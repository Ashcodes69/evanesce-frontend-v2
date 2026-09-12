import Navbar from "@/src/components/layout/Navbar";
import Input from "@/src/components/ui/Input";
import ChatRow from "@/src/features/chat/ChatRow";

const activeChats = [
  {
    id: 1,
    fullName: "Dexter Morgan",
    unreadCount: 0,
    lastMessageText: "Active now",
  },
  { id: 2, fullName: "Ashish Kumar", unreadCount: 1 },
  { id: 3, fullName: "Eliot Alderson", unreadCount: 3 },
];
export default function page() {
  return (
    <main className="min-h-screen bg-background pb24">
      <div className="max-w-lg mx-auto flex flex-col w-full h-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-6 py-6 border-border">
          <h1 className="text-text-main text-2xl font-bold mb-4">Messages</h1>
          <Input type="text" placeholder="Search conversations..." />
        </div>

        <div className="flex flex-col">
          {activeChats.map((chat) => (
            <ChatRow
              key={chat.id}
              userId={chat.id}
              fullName={chat.fullName}
              unreadMsgCount={chat.unreadCount}
            />
          ))}
        </div>
      </div>
      <Navbar />
    </main>
  );
}
