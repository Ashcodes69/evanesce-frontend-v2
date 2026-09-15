"use client";
import DissapearBar from "./DissapearBar";
import clsx from "clsx";

export interface MessageBubbleProps {
  content: string;
  timestamp?: string;
  isSender: boolean;
  isRemoving: boolean;
}

export default function MessageBubble({
  content,
  timestamp,
  isSender,
  isRemoving,
}: MessageBubbleProps) {
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
            "relative px-3 py-2.5 text-[15px] leading-relaxed shadow-sm border",
            isSender
              ? "bg-primary text-white border-transparent rounded-2xl rounded-br-sm shadow-[0_0_15px_rgba(0,102,255,0.15)]"
              : "bg-surface text-text-main border-border rounded-2xl rounded-bl-sm",
          )}
        >
          <p className="wrap-break-word whitespace-pre-wrap">{content}</p>
          <div className="w-full min-w-30 h-1 mt-2 rounded-full overflow-hidden bg-black/50">
            <DissapearBar content={content} isSender={isSender} />
          </div>
        </div>
        {timestamp && (
          <span className="text-[11px] mt-1.5 px-1 font-medium text-text-muted">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}
