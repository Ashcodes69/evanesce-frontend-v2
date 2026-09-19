'use client';

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
// We commented out useRouter since this is purely a UI sandbox for now
// import { useRouter } from "next/navigation"; 
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

type Step = "identity" | "otp" | "reset";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("identity");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // const router = useRouter();

  // ---- Mock Handlers (Pure UI transitions) ----

  const handleVerifyIdentity = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1000);
  };

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setStep("reset");
    }, 1000);
  };

  const handleReset = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      console.log("Password reset successful! User can now log in.");
      // router.push("/auth/login"); // Commented out so you can test the UI state
      setStep("identity"); // Loop back to start for testing purposes
      setUsername("");
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface border border-border rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-text-main text-3xl font-bold tracking-tight">Recover Account</h1>
          <p className="text-text-muted mt-2 text-sm h-5 transition-all">
            {step === "identity" && "Verify your identity to continue"}
            {step === "otp" && "Enter the recovery code"}
            {step === "reset" && "Secure your account"}
          </p>
        </div>

        {/* Step 1: Identity */}
        {step === "identity" && (
          <form className="space-y-6" onSubmit={handleVerifyIdentity}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-text-main pl-1">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  placeholder="agent007"
                  className="py-3"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text-main pl-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="agent@evanesce.com"
                  className="py-3"
                />
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || !username || !email}>
              {loading ? "Verifying..." : "Send verification code"}
            </Button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-text-main pl-1">
                Verification code
              </label>
              <Input
                id="otp"
                type="text"
                required
                value={otp}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="py-3 tracking-widest text-center text-lg font-mono"
              />
              <p className="mt-2 text-xs text-text-muted text-center">Sent to {email}</p>
            </div>
            <div className="space-y-3">
              <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || otp.length < 6}>
                {loading ? "Verifying..." : "Verify code"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("identity")}
                className="w-full text-center text-sm text-text-muted hover:text-text-main transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <form className="space-y-5" onSubmit={handleReset}>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-text-main pl-1">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="py-3"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-main pl-1">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="py-3"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={loading || !newPassword || !confirmPassword}>
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-text-muted pt-2 border-t border-border/50">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-primary hover:text-primary-glow transition-colors font-medium">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}