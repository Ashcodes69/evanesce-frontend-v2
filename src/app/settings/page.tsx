'use client';

import { useState, FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

export default function SettingsPage() {
  // Pure UI mock state - pre-filled as if the /me endpoint already returned data
  const [fullName, setFullName] = useState("Ashish Kumar");
  const [savingName, setSavingName] = useState(false);

  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  // ---- Mock Handlers (Pure UI transitions) ----

  const handleSaveFullName = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    
    setSavingName(true);
    // Simulate API delay
    setTimeout(() => {
      setSavingName(false);
      console.log("Full name updated to:", fullName);
    }, 1000);
  };

  const handleChangeUsername = (e: FormEvent) => {
    e.preventDefault();
    if (!password || !newUsername.trim()) return;

    // In the real app, this would trigger your showConfirm dialog
    setSavingUsername(true);
    // Simulate API delay
    setTimeout(() => {
      setSavingUsername(false);
      console.log("Username updated! Triggering logout...");
      setPassword("");
      setNewUsername("");
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-background pb-28 px-4 sm:px-6 pt-8">
      {/* Constraints for Desktop monitors */}
      <div className="max-w-lg mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-text-main text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-text-muted mt-2 text-sm">Manage your account and preferences</p>
        </div>

        {/* Full Name Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-text-main text-lg font-semibold">Display Name</h2>
            <p className="text-text-muted text-sm mt-1">This is how you appear to your connections.</p>
          </div>
          <form onSubmit={handleSaveFullName} className="space-y-4">
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            <Button 
              type="submit" 
              variant="primary" 
              disabled={savingName || !fullName.trim()}
              className="w-full sm:w-auto"
            >
              {savingName ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </div>

        {/* Username Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-text-main text-lg font-semibold">Change Username</h2>
            <p className="text-text-muted text-sm mt-1">
              Requires your current password. Changing this will log you out.
            </p>
          </div>
          <form onSubmit={handleChangeUsername} className="space-y-4">
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="text"
                placeholder="e.g. Ashcodes69"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={savingUsername || !password || !newUsername.trim()}
              className="w-full sm:w-auto text-white bg-destructive hover:bg-red-600 border-none"
            >
              {savingUsername ? "Updating..." : "Update username"}
            </Button>
          </form>
        </div>

        {/* Security / Password Reset Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-text-main text-lg font-semibold">Security</h2>
            <p className="text-text-muted text-sm mt-1">
              Update your password via email verification.
            </p>
          </div>
          <Link 
            href="/auth/forgot-password"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-text-main bg-background border border-border rounded-lg hover:bg-border/50 transition-colors whitespace-nowrap"
          >
            Change Password
          </Link>
        </div>

      </div>

      {/* Global Navigation */}
      <Navbar />
    </main>
  );
}