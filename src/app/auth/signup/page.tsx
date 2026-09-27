'use client';

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthLayout from '@/src/components/layout/AuthLayout';
import { OtpInput } from '@/src/components/ui/OtpInput';
import  Input  from "@/src/components/ui/Input";
import  Button from "@/src/components/ui/Button";

import { api } from "@/src/services/api";
import { useAlert } from "@/src/contexts/AlertContext";

type Step = "email" | "otp" | "username" | "details";

// Helper to parse FastAPI validation errors
const getErrorMessage = (err: any, fallback: string): string => {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d: any) => d.msg).join(", ");
  }
  return fallback;
};

export default function Register() {
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [signupToken, setSignupToken] = useState("");
  
  const [formData, setFormData] = useState({ 
    email: '', 
    otp: '', 
    username: '', 
    fullName: '', 
    password: '', 
    confirm: '' 
  });

  const router = useRouter();
  const { showAlert } = useAlert();

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // ---- Step 1: Request OTP ----
  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    setLoading(true);
    try {
      await api.post("/auth/signup/request-otp", { email: formData.email });
      showAlert("Verification code sent to your email.", true);
      setStep("otp");
    } catch (err: any) {
      showAlert(getErrorMessage(err, "Failed to send code."), false);
    } finally {
      setLoading(false);
    }
  };

  // ---- Step 2: Verify OTP ----
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.otp.trim()) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/signup/verify-otp", {
        email: formData.email,
        code: formData.otp,
      });
      setSignupToken(res.data.signup_token);
      setStep("username");
    } catch (err: any) {
      showAlert(getErrorMessage(err, "Invalid or expired code."), false);
    } finally {
      setLoading(false);
    }
  };

  // ---- Step 3: Check Username Availability ----
  const handleCheckUsername = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) return;

    setLoading(true);
    try {
      await api.post("/auth/signup/check-username", { username: formData.username });
      setStep("details");
    } catch (err: any) {
      showAlert(getErrorMessage(err, "That username isn't available."), false);
    } finally {
      setLoading(false);
    }
  };

  // ---- Step 4: Complete Signup ----
  const handleCompleteSignup = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirm) {
      showAlert("Passwords do not match", false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/signup/complete", {
        signup_token: signupToken,
        username: formData.username,
        password: formData.password,
        full_name: formData.fullName,
      });

      const token = res.data.access_token;
      localStorage.setItem("token", token);
      
      // Connect WebSockets immediately
      window.dispatchEvent(new Event("auth-changed"));
      
      showAlert("Account created!", true);
      router.push("/");
    } catch (err: any) {
      showAlert(getErrorMessage(err, "Failed to create account."), false);
    } finally {
      setLoading(false);
    }
  };

  // ---- Presentational Logic ----

  const footer = (
    <>
      Already have an account?{" "}
      <Link href="/auth/login" className="text-primary hover:text-primary-glow font-medium">
        Log In
      </Link>
    </>
  );

  const subtitles = {
    email: "Let's start with your email",
    otp: "Enter the code we sent you",
    username: "Pick a unique username",
    details: "Set your name and password"
  };

  return (
    <AuthLayout title="Create an account" subtitle={subtitles[step]} footer={footer}>
      
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
              value={formData.email} 
              onChange={(e) => updateForm('email', e.target.value)} 
              placeholder="agent@evanesce.com" 
              className="py-3" 
            />
          </div>
          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || !formData.email}>
            {loading ? "Sending code..." : "Send verification code"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <OtpInput 
            id="otp" 
            required 
            value={formData.otp} 
            onChange={(e) => updateForm('otp', e.target.value)} 
            email={formData.email} 
          />
          <div className="space-y-3">
            <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || formData.otp.length < 6}>
              {loading ? "Verifying..." : "Verify code"}
            </Button>
            <button type="button" onClick={() => setStep("email")} className="w-full text-center text-sm text-text-muted hover:text-text-main transition-colors">
              Use a different email
            </button>
          </div>
        </form>
      )}

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
              value={formData.username} 
              onChange={(e) => updateForm('username', e.target.value)} 
              placeholder="johndoe" 
              className="py-3" 
            />
          </div>
          <Button type="submit" variant="primary" className="w-full py-3" disabled={loading || !formData.username}>
            {loading ? "Checking..." : "Continue"}
          </Button>
        </form>
      )}

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
              value={formData.fullName} 
              onChange={(e) => updateForm('fullName', e.target.value)} 
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
              value={formData.password} 
              onChange={(e) => updateForm('password', e.target.value)} 
              placeholder="••••••••" 
              className="py-3" 
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-text-main pl-1">
              Confirm Password
            </label>
            <Input 
              id="confirm" 
              type="password" 
              required 
              value={formData.confirm} 
              onChange={(e) => updateForm('confirm', e.target.value)} 
              placeholder="••••••••" 
              className="py-3" 
            />
          </div>
          <Button type="submit" variant="primary" className="w-full py-3 mt-4" disabled={loading || !formData.password || formData.password !== formData.confirm || !formData.fullName}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      )}
      
    </AuthLayout>
  );
}