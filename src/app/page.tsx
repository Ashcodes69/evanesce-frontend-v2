"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/src/components/layout/Navbar";
import IncomingRequests from "@/src/features/connections/IncomingRequests";
import SearchPanel from "@/src/features/connections/SearchPanel";
import SearchResult from "@/src/features/connections/SearchResult";
import { api } from "@/src/services/api";
import { useAlert } from "@/src/contexts/AlertContext";
import { useWebSocketContext } from "@/src/contexts/WebSocketContext";

interface UserResult {
  id: number;
  username: string;
  full_name: string;
  connection_status: "none" | "pending_sent" | "pending_received" | "accepted";
}

interface RequestItem {
  connection_id: number;
  sender_id: number;
  sender_username: string;
  sender_full_name: string;
}

export default function Home() {
  const [fullName, setFullName] = useState("");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [userResult, setUserResult] = useState<UserResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Requests State
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [requestLoadingId, setRequestLoadingId] = useState<number | null>(null);

  const router = useRouter();
  const { showAlert } = useAlert();
  const { addListener } = useWebSocketContext();

  // Initial Data Fetch
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/auth/login");
    }
    api
      .get("/me")
      .then((res) => setFullName(res.data.full_name))
      .catch(() => {});
    api
      .get("/connections/requests/incoming")
      .then((res) => setRequests(res.data))
      .catch(() => {});
  }, []);

  // WebSocket Listener for real-time acceptance
  useEffect(() => {
    const unsubscribe = addListener((data) => {
      if (
        data.type === "connection_accepted" &&
        userResult &&
        data.user_id === userResult.id
      ) {
        setUserResult({ ...userResult, connection_status: "accepted" });
      }
    });
    return unsubscribe;
  }, [addListener, userResult]);

  // Search Logic
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setUserResult(null);

    try {
      const response = await api.get(`/users/search/${searchQuery}`);
      setUserResult(response.data);
      console.log(response.data)
    } catch (err: any) {
      if (err.response?.status === 404) showAlert("User not found.", false);
      else showAlert("Search failed.", false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!userResult) return;
    setActionLoading(true);
    try {
      await api.post("/connections/request", { target_user_id: userResult.id });
      setUserResult({ ...userResult, connection_status: "pending_sent" });
      showAlert("Request sent.", true);
    } catch (err: any) {
      showAlert(err.response?.data?.detail || "Failed to send request.", false);
    } finally {
      setActionLoading(false);
    }
  };

  // Request Management Logic
  const handleAccept = async (connectionId: number, userId: number) => {
    setRequestLoadingId(connectionId);
    try {
      await api.post(`/connections/${connectionId}/accept`);
      window.dispatchEvent(new Event("connection-accepted-local"));
      router.push(`/messages/${userId}`);
    } catch (err) {
      showAlert("Failed to accept request.", false);
      setRequestLoadingId(null);
    }
  };

  const handleDecline = async (connectionId: number) => {
    setRequestLoadingId(connectionId);
    try {
      await api.post(`/connections/${connectionId}/reject`);
      setRequests((prev) =>
        prev.filter((r) => r.connection_id !== connectionId),
      );
    } catch (err) {
      showAlert("Failed to reject request.", false);
    } finally {
      setRequestLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-24 px-6 pt-0">
      <div className="max-w-xl mx-auto w-full flex flex-col gap-12">
        {/* Header & Greeting */}
        <div className="pt-5 text-center">
          <h1 className="text-text-main text-2xl font-bold tracking-tight">
            Evanesce
          </h1>
          {fullName && (
            <p className="text-text-muted mt-1 text-sm">
              Welcome back, {fullName}
            </p>
          )}
        </div>

        <Navbar />

        {/* Search Feature */}
        <div className="space-y-6">
          <SearchPanel
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            loading={searchLoading}
          />
          <SearchResult
            user={userResult}
            onSendRequest={handleSendRequest}
            actionLoading={actionLoading}
          />
        </div>

        {/* Requests Feature */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-primary text-sm font-semibold">
              Chat requests
            </h2>
            {requests.length > 0 && (
              <span className="bg-surface border border-border text-text-muted text-xs px-2 py-0.5 rounded-full">
                {requests.length} new
              </span>
            )}
          </div>

          <IncomingRequests
            requests={requests}
            onAccept={handleAccept}
            onDecline={handleDecline}
            actionLoadingId={requestLoadingId}
          />
        </section>
      </div>
    </main>
  );
}
