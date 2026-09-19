'use client';

import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

type Step = "email" | "otp" | "username" | "details";

export default function Register() {
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  const router = useRouter();

  // ---- Mock Handlers (Pure UI transitions) ----
  
  const handleRequestOtp = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

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
      setStep("username");
    }, 1000);
  };

  const handleCheckUsername = (e: FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setStep("details");
    }, 1000);
  };

  const handleCompleteSignup = (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmedPassword) {
      console.error("Passwords do not match");
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      console.log("Signup complete! Navigating to home...");
      // router.push("/"); // Commented out so you can stay on the page to test
    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface border border-border rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-text-main text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-text-muted mt-2 text-sm h-5 transition-all">
            {step === "email" && "Let's start with your email"}
            {step === "otp" && "Enter the code we sent you"}
            {step === "username" && "Pick a unique username"}
            {step === "details" && "Set your name and password"}
          </p>
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
          <form className="space-y-6" onSubmit={handleRequestOtp}>
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
            <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || !email}>
              {loading ? "Sending code..." : "Send verification code"}
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
              <p className="mt-2 text-xs text-text-muted pl-1">Sent to {email}</p>
            </div>
            <div className="space-y-3">
              <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || otp.length < 6}>
                {loading ? "Verifying..." : "Verify code"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-center text-sm text-text-muted hover:text-text-main transition-colors"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Username */}
        {step === "username" && (
          <form className="space-y-6" onSubmit={handleCheckUsername}>
            <div className="space-y-2">
              <label htmlFor="userName" className="block text-sm font-medium text-text-main pl-1">
                Username
              </label>
              <Input
                id="userName"
                type="text"
                required
                value={userName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                placeholder="johndoe"
                className="py-3"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || !userName}>
              {loading ? "Checking..." : "Continue"}
            </Button>
          </form>
        )}

        {/* Step 4: Details */}
        {step === "details" && (
          <form className="space-y-5" onSubmit={handleCompleteSignup}>
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-text-main pl-1">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="py-3"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-main pl-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="py-3"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmedPassword" className="block text-sm font-medium text-text-main pl-1">
                Confirm Password
              </label>
              <Input
                id="confirmedPassword"
                type="password"
                required
                value={confirmedPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmedPassword(e.target.value)}
                placeholder="••••••••"
                className="py-3"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={loading || !password || !confirmedPassword || !fullName}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-text-muted pt-2 border-t border-border/50">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:text-primary-glow transition-colors font-medium">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}