import { isAxiosError } from "axios";
import { api } from "@/src/services/api";
import { encryptFile, exportFileKey, generateFileKey } from "./fileCrypto";

// Must match MAX_FILE_BYTES in the backend.
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

// A chat message whose content starts with this is a file message.
export const FILE_MESSAGE_PREFIX = "evanesce-file:1:";

export class FileTransferError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileTransferError";
  }
}

export interface FileMessagePayload {
  id: number; // transfer id on the server
  name: string; // original filename (only ever travels inside the chat message)
  size: number; // original size in bytes
  key: string; // base64url AES-256 key
}

export function encodeFileMessage(payload: FileMessagePayload): string {
  return FILE_MESSAGE_PREFIX + JSON.stringify(payload);
}

// Message text comes from other users, so every field is validated.
export function parseFileMessage(content: string): FileMessagePayload | null {
  if (!content.startsWith(FILE_MESSAGE_PREFIX)) return null;
  try {
    const data = JSON.parse(content.slice(FILE_MESSAGE_PREFIX.length));

    const valid =
      Number.isInteger(data.id) &&
      data.id > 0 &&
      typeof data.name === "string" &&
      data.name.length > 0 &&
      data.name.length <= 255 &&
      Number.isFinite(data.size) &&
      data.size > 0 &&
      typeof data.key === "string" &&
      /^[A-Za-z0-9_-]{43}$/.test(data.key);

    if (!valid) return null;

    return { id: data.id, name: data.name, size: data.size, key: data.key };
  } catch {
    return null;
  }
}

function errorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return "could not upload th file";
}

// Encrypts the file in the browser, uploads the encrypted bytes, and returns
// the details to send to the receiver in a chat message.
export async function uploadEncryptedFile(
  file: File,
  receiverId: number,
): Promise<FileMessagePayload> {
  if (file.size > MAX_FILE_BYTES)
    throw new FileTransferError("file is too large (Limit: 20mb)");

  const key = await generateFileKey();
  const encrypted = await encryptFile(file, key);

  // encryption adds a small header and per-chunk tags
  if (encrypted.size > MAX_FILE_BYTES)
    throw new FileTransferError("file is too large (Limit: 20mb)");

  const form = new FormData();
  form.append("receiver_id", String(receiverId));
  form.append("file", encrypted, "file.dead");

  try {
    const res = await api.postForm<{ id: number }>("/files/upload", form);
    return {
      id: res.data.id,
      name: file.name,
      size: file.size,
      key: await exportFileKey(key),
    };
  } catch (err) {
    throw new FileTransferError(errorMessage(err));
  }
}
