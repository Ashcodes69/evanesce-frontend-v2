"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Button from "@/src/components/ui/Button";
import { api } from "@/src/services/api";
import { useAlert } from "@/src/contexts/AlertContext";
import { useRouter } from "next/navigation";

interface BlockedUser {
  user_id: number;
  username: string;
  full_name: string;
}

export default function BlocklistPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  const { showAlert, showConfirm } = useAlert();
  const router = useRouter();

  useEffect(() => {
    const fetchBlocklist = async () => {
      if (!localStorage.getItem("token")) {
        router.push("/auth/login");
      }
      try {
        const res = await api.get("/connections/blocked");
        setBlockedUsers(res.data);
      } catch (err) {
        showAlert("Failed to load blocklist.", false);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocklist();
  }, [showAlert]);

  const handleUnblock = (userId: number, username: string) => {
    showConfirm(
      `Unblock @${username}? They will be able to send you chat requests again.`,
      async () => {
        setUnblockingId(userId);
        try {
          await api.post(`/connections/${userId}/unblock`);

          // Optimistically remove the user from the UI list
          setBlockedUsers((prev) =>
            prev.filter((user) => user.user_id !== userId),
          );
          showAlert(`@${username} has been unblocked.`, true);
        } catch (err: any) {
          showAlert(
            err.response?.data?.detail || "Failed to unblock user.",
            false,
          );
        } finally {
          setUnblockingId(null);
        }
      },
    );
  };

  return (
    <main className="min-h-screen bg-background pb-28 px-4 sm:px-6 pt-8">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Header with Back Navigation */}
        <div className="flex items-center mb-10 relative">
          <Link
            href="/settings"
            className="absolute left-0 p-2 -ml-2 text-text-muted hover:text-text-main transition-colors"
            aria-label="Back to settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-text-main text-2xl font-bold tracking-tight">
              Blocklist
            </h1>
            <p className="text-text-muted mt-1 text-sm">
              Manage restricted accounts
            </p>
          </div>
        </div>

        {/* Blocklist Area */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-text-muted text-sm animate-pulse">
              Loading blocklist...
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-text-muted opacity-80 space-y-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium">You haven't blocked anyone.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 transition-all hover:border-border"
                >
                  <div className="flex flex-col">
                    <span className="text-text-main font-medium">
                      {user.full_name}
                    </span>
                    <span className="text-text-muted text-xs">
                      @{user.username}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleUnblock(user.user_id, user.username)}
                    disabled={unblockingId === user.user_id}
                    className="px-4 py-1.5 text-xs bg-transparent border border-border text-text-muted hover:text-white hover:border-white/30"
                  >
                    {unblockingId === user.user_id
                      ? "Unblocking..."
                      : "Unblock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Navigation */}
      <Navbar />
    </main>
  );
}
