"use client";
import Link from "next/link";
import clsx from "clsx";

export interface ChatRowProps {
  userId: number;
  fullName: string;
  unreadMsgCount: number;
}

export default function ChatRow({
  userId,
  fullName,
  unreadMsgCount = 0,
}: ChatRowProps) {
  return (
    <Link href={`/messages/${userId}`} className="block w-full group">
      <div
        className={clsx(
          "flex flex-col justify-center px-5 py-4 border-b border-border bg-background transition-colors duration-200",
          "group-hover:bg-surface/50",
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-text-main text-lg font-medium tracking-wide">
            {fullName}
          </h3>

          {unreadMsgCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_var(--primary)]">
              {unreadMsgCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
