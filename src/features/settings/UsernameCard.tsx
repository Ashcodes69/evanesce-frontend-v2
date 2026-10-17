"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import { api } from "@/src/services/api";
import { useAlert } from "@/src/contexts/AlertContext";

export default function UsernameCard() {
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!password || !newUsername.trim()) {
      showAlert("Please fill in both fields.", false);
      return;
    }

    showConfirm(
      "Changing your username will log you out. Continue?",
      async () => {
        setSaving(true);
        try {
          await api.put("/me/username", {
            password,
            new_username: newUsername,
          });

          // Purge session and logout
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("auth-changed"));

          showAlert("Username updated. Please log in again.", true);
          router.push("/auth/login");
        } catch (err: any) {
          showAlert(
            err.response?.data?.detail || "Failed to update username.",
            false,
          );
          setSaving(false);
        }
      },
    );
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-text-main text-lg font-semibold">
          Change Username
        </h2>
        <p className="text-text-muted text-sm mt-1">
          Requires your current password. Changing this logs you out.
        </p>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="text"
            placeholder="e.g. agent007"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={saving || !password || !newUsername.trim()}
          className="w-full sm:w-auto text-white bg-destructive hover:bg-red-600 border-none"
        >
          {saving ? "Updating..." : "Update username"}
        </Button>
      </form>
    </div>
  );
}
