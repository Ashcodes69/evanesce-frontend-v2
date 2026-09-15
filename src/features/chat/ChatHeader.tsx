"use client";
import Link from "next/link";
import { ChevronLeft, MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  fullName: string;
  username: string;
  onBlock: () => void;
}

export default function ChatHeader({
  fullName,
  username,
  onBlock,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-4 bg-surface/90 backdrop-blur-md border-b border-border z-20">
      <div className="flex items-center gap-2">
        <Link
          href="/messages"
          className="text-text-muted hover:text-primary transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>

        <div className="flex flex-col">
          <h2 className="text-text-main font-semibold text-lg leading-tight">
            {fullName}
          </h2>
          <span className="text-text-muted text-xs">{username}</span>
        </div>
      </div>

      <button
        onClick={onBlock}
        aria-label="more options"
        className="text-text-muted hover:text-destructive transition-colors p-2"
      >
        <MoreVertical size={20} />
      </button>
    </div>
  );
}
