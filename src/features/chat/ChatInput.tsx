"use client";
import { FormEvent, useState } from "react";

import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

import { Send } from "lucide-react";

export default function ChatInput({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 p-4 bg-background border-t border-border"
    >
        
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a secure message..."
        className="rounded-2xl py-3"
      />

      <Button
        type="submit"
        disabled={!message.trim()}
        variant="primary"
        className="p-3 rounded-full flex shrink-0"
      >
        <Send size={18} />
      </Button>
    </form>
  );
}
