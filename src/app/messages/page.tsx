"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/src/components/layout/Navbar";
import Input from "@/src/components/ui/Input";
import ChatRow from "@/src/features/chat/ChatRow";
import { api } from "@/src/services/api";
import { useWebSocketContext } from "@/src/contexts/WebSocketContext";

interface RecentChat {
  user_id: number;
  username: string;
  full_name: string;
  last_message: string;
  unread_msg_count: number;
}

export default function MessagesPage() {
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { addListener } = useWebSocketContext();

  // 1. Initial Data Fetch
  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const res = await api.get("/conversations");
        setChats(res.data);
      } catch (err) {
        console.error("Failed to fetch conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentChats();

    // Re-fetch if auth changes while on this page
    window.addEventListener("auth-changed", fetchRecentChats);
    return () => window.removeEventListener("auth-changed", fetchRecentChats);
  }, []);

  // 2. Real-time WebSocket Updates
  useEffect(() => {
    const unsubscribe = addListener((data) => {
      if (data.type === "connection_accepted") {
        // Fetch fresh list to get the new connection
        api.get("/conversations").then((res) => setChats(res.data));
      }

      if (data.type === "connection_blocked") {
        // Remove blocked user immediately
        setChats((prev) => prev.filter((c) => c.user_id !== data.user_id));
      }

      if (data.message && data.from) {
        const senderId = data.from;

        setChats((prev) => {
          const exists = prev.some((c) => c.user_id === senderId);

          if (!exists) {
            // New chat started, fetch full list
            api.get("/conversations").then((res) => setChats(res.data));
            return prev;
          }

          // Bump unread count and update last message, bubble to top
          const updated = prev.map((c) =>
            c.user_id === senderId
              ? {
                  ...c,
                  last_message: data.message,
                  unread_msg_count: c.unread_msg_count + 1,
                }
              : c,
          );

          const chat = updated.find((c) => c.user_id === senderId)!;
          const rest = updated.filter((c) => c.user_id !== senderId);
          return [chat, ...rest];
        });
      }
    });

    return unsubscribe;
  }, [addListener]);

  // 3. Local Optimistic Event Listeners (Blocks & Sent Messages)
  useEffect(() => {
    const handleLocalBlock = (e: Event) => {
      const { userId } = (e as CustomEvent).detail;
      setChats((prev) => prev.filter((c) => c.user_id !== userId));
    };

    const handleLocalMessageSent = (e: Event) => {
      const { receiverId, message } = (e as CustomEvent).detail;

      setChats((prev) => {
        const exists = prev.some((c) => c.user_id === receiverId);
        if (!exists) return prev; // Avoid fetching if they aren't on the list yet

        // Update local UI immediately without waiting for server bounce-back
        const updated = prev.map((c) =>
          c.user_id === receiverId ? { ...c, last_message: message } : c,
        );

        const chat = updated.find((c) => c.user_id === receiverId)!;
        const rest = updated.filter((c) => c.user_id !== receiverId);
        return [chat, ...rest];
      });
    };

    window.addEventListener("connection-blocked-local", handleLocalBlock);
    window.addEventListener("message-sent-local", handleLocalMessageSent);

    return () => {
      window.removeEventListener("connection-blocked-local", handleLocalBlock);
      window.removeEventListener("message-sent-local", handleLocalMessageSent);
    };
  }, []);

  // 4. Local Search Filtering
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.full_name.toLowerCase().includes(query) ||
        chat.username.toLowerCase().includes(query),
    );
  }, [chats, searchQuery]);

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto flex flex-col w-full h-full">
        {/* Sticky Header with Search */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-6 py-6 border-b border-border">
          <h1 className="text-text-main text-2xl font-bold mb-4">Messages</h1>
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Chat List */}
        <div className="flex flex-col pt-2 px-2">
          {loading ? (
            <div className="text-center text-text-muted mt-10 animate-pulse">
              Loading secure chats...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center text-text-muted mt-10 text-sm">
              {searchQuery
                ? "No chats match your search."
                : "No active conversations."}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatRow
                key={chat.user_id}
                userId={chat.user_id}
                fullName={chat.full_name}
                unreadMsgCount={chat.unread_msg_count}
                // Optional: pass last_message if your ChatRow supports it
                // lastMessage={chat.last_message}
              />
            ))
          )}
        </div>
      </div>
      <Navbar />
    </main>
  );
}
