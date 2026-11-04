"use client";
import { useState } from "react";
import clsx from "clsx";
import { isAxiosError } from "axios";
import { Download, File as FileIcon } from "lucide-react";

import Button from "@/src/components/ui/Button";
import { api } from "@/src/services/api";
import { decryptFile, FileCryptoError, importFileKey } from "./fileCrypto";
import type { FileMessagePayload } from "./fileTransfer";

type Status = "idle" | "working" | "done" | "error";

interface FileCardProps {
  file: FileMessagePayload;
  isSender: boolean;
  timestamp?: string;
  isRemoving: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// The name comes from the sender, so strip characters file systems dislike.
function safeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim();
  return cleaned || "file";
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export default function FileCard({
  file,
  isSender,
  timestamp,
  isRemoving,
}: FileCardProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");

  const handleDownload = async () => {
    setStatus("working");
    setNote("");

    try {
      // responseType "blob": on errors, err.response.data is a Blob too,
      // so only the status code is used below.
      const res = await api.get<Blob>(`/files/${file.id}/download`, {
        responseType: "blob",
      });
      const key = await importFileKey(file.key);
      const decrypted = await decryptFile(res.data, key);
      saveBlob(decrypted, safeFileName(file.name));
    } catch (err) {
      setStatus("error");
      if (err instanceof FileCryptoError) {
        setNote("This file is damaged, or the key is wrong.");
      } else if (
        isAxiosError(err) &&
        (err.response?.status === 404 || err.response?.status === 410)
      ) {
        setNote("This file is no longer available.");
      } else {
        setNote("Download failed. Try again.");
      }
      return; // nothing is reported as complete
    }

    // Only reached once the file is decrypted and handed to the browser.
    try {
      await api.post(`/files/${file.id}/complete`);
    } catch {
      setNote(
        "Saved, but the server could not be notified. The card may stay until it expires.",
      );
    }
    setStatus("done");
  };

  const statusText = isSender
    ? "Waiting for them to download"
    : status === "working"
      ? "Downloading and decrypting..."
      : status === "done"
        ? "Downloaded. This card will disappear shortly."
        : status === "error"
          ? note
          : "Encrypted file";

  return (
    <div
      className={clsx(
        "flex w-full transition-all duration-300 ease-out",
        isSender ? "justify-end" : "justify-start",
        isRemoving
          ? "opacity-0 scale-95 blur-[2px]"
          : "opacity-100 scale-100 blur-0",
      )}
    >
      <div
        className={clsx(
          "flex flex-col max-w-[85%] sm:max-w-[75%]",
          isSender ? "items-end" : "items-start",
        )}
      >
        <div
          className={clsx(
            "flex items-center gap-3 px-3 py-3 min-w-60 border shadow-sm rounded-2xl",
            isSender
              ? "bg-primary text-white border-transparent rounded-br-sm"
              : "bg-surface text-text-main border-border rounded-bl-sm",
          )}
        >
          <FileIcon size={28} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium">{file.name}</p>
            <p className="text-xs opacity-70">{formatBytes(file.size)}</p>
          </div>
          {!isSender && status !== "done" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={status === "working"}
              onClick={handleDownload}
              aria-label="Download file"
              className="shrink-0"
            >
              {status === "working" ? "..." : <Download size={16} />}
            </Button>
          )}
        </div>
        <span className="text-[11px] mt-1.5 px-1 font-medium text-text-muted">
          {statusText}
          {status === "done" && note ? ` ${note}` : ""}
        </span>
        {timestamp && (
          <span className="text-[11px] px-1 font-medium text-text-muted">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}