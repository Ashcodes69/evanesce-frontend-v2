"use client";
import ChatHeader from "@/src/features/chat/ChatHeader";
import ChatInput from "@/src/features/chat/ChatInput";
import MessageBubble from "@/src/features/chat/MessageBubble";

export default function ConversationPage({
  params,
}: {
  params: { userId: string };
}) {
  // Pure mock data to test our layout and scrolling
  const mockMessages = [
    {
      id: 1,
      content: "Did you check the logs of that target server?",
      isSender: false,
      timestamp: "2:41 PM",
    },
    {
      id: 2,
      content:
        "Yeah. The root password was cracked. Looks like standard dictionary attack.",
      isSender: true,
      timestamp: "2:43 PM",
    },
    {
      id: 3,
      content:
        "Excellent. Leave no trace of our monitoring tool in the system files.",
      isSender: false,
      timestamp: "2:45 PM",
    },
    {
      id: 4,
      content: "Done. Cleared all traces from the auth log. We are invisible.",
      isSender: true,
      timestamp: "2:46 PM",
    },
  ];

  return (
    <main className="flex h-dvh flex-col bg-background sm:p-6 md:p-8">
      {/* Constraints for Desktop monitors */}
      <div className="mx-auto flex w-full max-w-2xl flex-col bg-background sm:rounded-3xl sm:border sm:border-border h-full sm:h-[85vh] md:h-[85vh] overflow-hidden sm:shadow-2xl relative">
        {/* Top Header */}
        <ChatHeader
          fullName="Dexter Morgan"
          username="dexter"
          onBlock={() => console.log("Block button clicked")}
        />

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto sm:px-4 py-6 space-y-2">
          {mockMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              isSender={msg.isSender}
              timestamp={msg.timestamp}
              isRemoving={false}
            />
          ))}
        </div>

        {/* Bottom Input Area */}
        <ChatInput
          onSendMessage={(msg) => console.log("Attempting to send:", msg)}
        />
      </div>
    </main>
  );
}
