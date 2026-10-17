"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/src/components/layout/Navbar";
import ProfileNameCard from "@/src/features/settings/ProfileNameCard";
import UsernameCard from "@/src/features/settings/UsernameCard";
import ActionCard from "@/src/features/settings/ActionCard";
import Button from "@/src/components/ui/Button";
import { useAlert } from "@/src/contexts/AlertContext";
import { useEffect } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { showConfirm } = useAlert();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/auth/login");
    }
  },[]);
  const handleLogout = () => {
    showConfirm("Are you sure you want to log out?", () => {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/auth/login");
    });
  };

  return (
    <main className="min-h-screen bg-background pb-28 px-4 sm:px-6 pt-8">
      <div className="max-w-lg mx-auto w-full space-y-8">
        <div className="text-center mb-10">
          <h1 className="text-text-main text-3xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Manage your account and preferences
          </p>
        </div>

        <ProfileNameCard />
        <UsernameCard />

        <ActionCard
          title="Security"
          description="Update your password via email verification."
          href="/auth/forgot-password"
          linkText="Change Password"
        />
        <ActionCard
          title="Blocklist"
          description="Manage the users you have blocked."
          href="connections\Blocklist" // Adjusted to match your right-sidebar path
          linkText="View Blocklist"
        />

        <div className="pt-4">
          <Button
            onClick={handleLogout}
            className="w-full py-4 bg-transparent border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-2xl font-semibold transition-colors"
          >
            Log Out
          </Button>
        </div>
      </div>
      <Navbar />
    </main>
  );
}
