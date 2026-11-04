// Browser-side encryption for Evanesce file transfers ("DEAD" format v2).
//
// header (18 bytes): "DEAD" | version (1) | algorithm (1) | chunk size (u32 BE) | nonce prefix (8)
// body: encrypted chunks, each = up to CHUNK_SIZE plaintext bytes + 16-byte GCM tag
//
// Every chunk is authenticated together with the header, its position and a
// "final chunk" flag, so reordering, swapping or truncating chunks makes
// decryption fail instead of returning a damaged file.

const MAGIC = [0x44, 0x45, 0x41, 0x44]; // "DEAD"
const FORMAT_VERSON = 2;
const ALGORITHM_AES_256_GCM = 1;
export const CHUNK_SIZE = 1024 * 1024; // plaintext bytes per chunk
const TAG_BYTES = 16;
const NONCE_PREFIX_BYTES = 8;
const HEADER_BYTES = 4 + 1 + 1 + 4 + NONCE_PREFIX_BYTES; // 18

export class FileCryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileCryptoError";
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(text: string) {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ---------- key handling ----------
export async function generateFileKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function exportFileKey(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  return toBase64Url(raw);
}

export async function importFileKey(encoded: string): Promise<CryptoKey> {
  let raw: ReturnType<typeof fromBase64Url>;
  try {
    raw = fromBase64Url(encoded);
  } catch {
    throw new FileCryptoError("Invalid key");
  }
  if (raw.length !== 32) throw new FileCryptoError("Invalid key");
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "decrypt",
  ]);
}

// ---------- format helpers ----------
function buildHeader(noncePrefix: Uint8Array) {
  const header = new Uint8Array(HEADER_BYTES);
  header.set(MAGIC, 0);
  header[4] = FORMAT_VERSON;
  header[5] = ALGORITHM_AES_256_GCM;
  new DataView(header.buffer).setUint32(6, CHUNK_SIZE, false);
  header.set(noncePrefix, 10);
  return header;
}

// 12-byte GCM nonce = 8-byte random prefix + 4-byte chunk counter
function chunkIv(noncePrefix: Uint8Array, index: number) {
  const iv = new Uint8Array(12);
  iv.set(noncePrefix, 0);
  new DataView(iv.buffer).setUint32(8, index, false);
  return iv;
}

// associated data = header + chunk index + final-chunk flag
function chunkAad(header: Uint8Array, index: number, isFinal: boolean) {
  const aad = new Uint8Array(HEADER_BYTES + 5);
  aad.set(header, 0);
  new DataView(aad.buffer).setUint32(HEADER_BYTES, index, false);
  aad[HEADER_BYTES + 4] = isFinal ? 1 : 0;
  return aad;
}

// ---------- encrypt / decrypt ----------
export async function encryptFile(file: Blob, key: CryptoKey): Promise<Blob> {
  const plain = new Uint8Array(await file.arrayBuffer());

  const noncePrefix = crypto.getRandomValues(
    new Uint8Array(NONCE_PREFIX_BYTES),
  );
  const header = buildHeader(noncePrefix);

  // an empty file still gets one (empty) final chunk
  const chunkCount = Math.max(1, Math.ceil(plain.length / CHUNK_SIZE));
  const parts: BlobPart[] = [header];

  for (let i = 0; i < chunkCount; i++) {
    const chunk = plain.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: chunkIv(noncePrefix, i),
        additionalData: chunkAad(header, i, i === chunkCount - 1),
        tagLength: TAG_BYTES * 8,
      },
      key,
      chunk,
    );
    parts.push(encrypted);
  }

  return new Blob(parts, { type: "application/octet-stream" });
}

export async function decryptFile(
  encrypted: Blob,
  key: CryptoKey,
): Promise<Blob> {
  const data = new Uint8Array(await encrypted.arrayBuffer());

  if (data.length < HEADER_BYTES + TAG_BYTES) {
    throw new FileCryptoError("not a valid encrypted file");
  }

  const header = data.subarray(0, HEADER_BYTES);
  const magicOK = MAGIC.every((byte, i) => header[i] == byte);

  if (
    !magicOK ||
    header[4] !== FORMAT_VERSON ||
    header[5] !== ALGORITHM_AES_256_GCM
  ) {
    throw new FileCryptoError("not a valid encrypted file");
  }

  // Only the one chunk size we produce is accepted. A tiny value chosen by a
  // malicious sender could otherwise force millions of decrypt calls.
  const chunkSize = new DataView(
    header.buffer,
    header.byteOffset,
    HEADER_BYTES,
  ).getUint32(6, false);
  if (chunkSize !== CHUNK_SIZE) {
    throw new FileCryptoError("not a valid encryptwd file");
  }

  const noncePrefix = header.subarray(10, 10 + NONCE_PREFIX_BYTES);

  const body = data.length - HEADER_BYTES;
  const encryptedChunkSize = CHUNK_SIZE + TAG_BYTES;
  const chunkCount = Math.ceil(body / encryptedChunkSize);
  const lastChunkLength = body - (chunkCount - 1) * encryptedChunkSize;

  if (lastChunkLength < TAG_BYTES) {
    throw new FileCryptoError("not a valid encrypted file");
  }

  const parts: BlobPart[] = [];
  try {
    for (let i = 0; i < chunkCount; i++) {
      const start = HEADER_BYTES + i * encryptedChunkSize;
      const end = Math.min(start + encryptedChunkSize, data.length);
      const plain = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: chunkIv(noncePrefix, i),
          additionalData: chunkAad(header, i, i === chunkCount - 1),
          tagLength: TAG_BYTES * 8,
        },
        key,
        data.subarray(start, end),
      );
      parts.push(plain);
    }
  } catch {
    throw new FileCryptoError(
      "could not decrypt: the file is corrupted or the key is wrong",
    );
  }
  return new Blob(parts, { type: "application/octet-stream" });
}
