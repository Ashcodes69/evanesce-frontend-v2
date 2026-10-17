"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import ChatHeader from "@/src/features/chat/ChatHeader";
import ChatInput from "@/src/features/chat/ChatInput";
import MessageBubble from "@/src/features/chat/MessageBubble";

import { api } from "@/src/services/api";
import { useAlert } from "@/src/contexts/AlertContext";
import { useWebSocketContext } from "@/src/contexts/WebSocketContext";

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  status?: string;
  created_at: string;
}

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>();

  // --- State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newMessage, setNewMessage] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [chatUserName, setChatUserName] = useState("Loading...");
  const [chatFullName, setChatFullName] = useState("");

  const [isTyping, setIsTyping] = useState(false);
  const [blocking, setBlocking] = useState(false);

  // --- Refs ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const { showConfirm, showAlert } = useAlert();
  const { sendJson, addListener } = useWebSocketContext();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle fading out messages before removing them from state
  const removeMessageWithFade = (messageId: number) => {
    setRemovingIds((prev) => new Set(prev).add(messageId));
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }, 350);
  };

  // Initial Data Fetching (Status & Chat History)
  useEffect(() => {
    if (!userId) return;

    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Fetch user status
        const statusRes = await api.get(`/users/status/${userId}`);
        setUserStatus(statusRes.data.status);
        if (statusRes.data.status === "offline") {
          const lastSeenRes = await api.get(`/users/last-seen/${userId}`);
          setLastSeen(lastSeenRes.data.last_seen);
        }

        // Fetch chat history and profile concurrently
        const [historyRes, profileRes] = await Promise.all([
          api.get(`/messages/${userId}`),
          api.get(`/users/${userId}`),
        ]);

        setMessages(historyRes.data);
        setChatUserName(profileRes.data.username);
        setChatFullName(profileRes.data.full_name);

        // Mark as seen
        api.put(`/messages/seen/${userId}`);
      } catch (err) {
        setError("Failed to load chat data.");
        setChatUserName("Unknown User");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userId, router]);

  // WebSocket Listener
  useEffect(() => {
    const unsubscribe = addListener((data) => {
      if (
        data.type === "connection_blocked" &&
        data.user_id.toString() === userId
      ) {
        showAlert("This user is no longer available to chat", false);
        router.push("/");
        return;
      }

      if (data.type === "presence" && data.user_id?.toString() === userId) {
        setUserStatus(data.status);
        if (data.status === "offline" && data.last_seen)
          setLastSeen(data.last_seen);
        return;
      }

      if (data.type === "typing" && data.from?.toString() === userId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
        return;
      }

      if (data.message && data.from?.toString() === userId) {
        setMessages((prev) => [
          ...prev,
          {
            id: data.message_id || Date.now(),
            sender_id: data.from,
            receiver_id: parseInt(userId),
            content: data.message,
            status: data.status,
            created_at: data.created_at,
          },
        ]);
        setIsTyping(false);
        api.put(`/messages/seen/${userId}`);
        return;
      }

      if (data.type === "message_ack") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.client_id
              ? {
                  ...m,
                  id: data.message_id,
                  status: data.status,
                  created_at: data.created_at,
                }
              : m,
          ),
        );
        return;
      }

      if (
        data.type === "message_hidden_sender" ||
        data.type === "message_deleted"
      ) {
        removeMessageWithFade(data.message_id);
      }
    });

    return unsubscribe;
  }, [userId, addListener, router, showAlert]);

  // Handlers
  const handleInputChange = (val: string) => {
    setNewMessage(val);
    sendJson({ receiver_id: parseInt(userId), type: "typing" });
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const tempId = Date.now();
    sendJson({
      receiver_id: parseInt(userId),
      message: content,
      client_id: tempId,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        sender_id: -1, // -1 denotes 'me' before server ack
        receiver_id: parseInt(userId),
        content,
        status: "sent",
        created_at: new Date().toISOString(),
      },
    ]);

    window.dispatchEvent(
      new CustomEvent("message-sent-local", {
        detail: { receiverId: parseInt(userId), message: content },
      }),
    );
    setNewMessage("");
  };

  const handleBlockClick = () => {
    showConfirm(
      `Block ${chatFullName || chatUserName}? They won't be able to message you anymore.`,
      async () => {
        setBlocking(true);
        try {
          await api.post(`/connections/${userId}/block`);
          window.dispatchEvent(
            new CustomEvent("connection-blocked-local", {
              detail: { userId: parseInt(userId) },
            }),
          );
          router.push("/");
        } catch (err: any) {
          showAlert(
            err.response?.data?.detail || "Failed to block user.",
            false,
          );
        } finally {
          setBlocking(false);
        }
      },
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted text-lg">
        Loading secure chat...
      </div>
    );
  }

  return (
    <main className="flex h-dvh flex-col bg-background sm:p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col bg-background sm:rounded-3xl sm:border sm:border-border h-full sm:h-[85vh] md:h-[85vh] overflow-hidden sm:shadow-2xl relative">
        <ChatHeader
          full_name={chatFullName}
          username={chatUserName}
          status={userStatus}
          lastSeen={lastSeen}
          onBlock={handleBlockClick}
          blocking={blocking}
        />

        {error && (
          <div className="bg-destructive/10 p-3 text-sm text-destructive text-center m-4 rounded-xl border border-destructive/20">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto sm:px-4 py-6 space-y-2">
          {messages.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-3 opacity-60">
              <p className="text-sm font-medium">Nothing said yet stays.</p>
              <p className="text-xs">
                Messages here don't last — say what you mean.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                isSender={
                  msg.sender_id === -1 || msg.sender_id.toString() !== userId
                }
                timestamp={msg.created_at}
                isRemoving={removingIds.has(msg.id)}
              />
            ))
          )}

          {isTyping && (
            <div className="flex justify-start opacity-70">
              <div className="bg-surface text-text-muted rounded-xl rounded-bl-sm px-4 py-2.5 shadow-sm flex items-center gap-1.5 border border-border">
                <span className="w-1.5 h-1.5 bg-text-muted/50 rounded-full animate-bounce"></span>
                <span
                  className="w-1.5 h-1.5 bg-text-muted/50 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-text-muted/50 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </main>
  );
}
