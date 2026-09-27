"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthLayout from "@/src/components/layout/AuthLayout";
import { OtpInput } from "@/src/components/ui/OtpInput";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

import { api } from "@/src/services/api";
import { useAlert } from "@/src/contexts/AlertContext";

type Step = "identity" | "otp" | "reset";

// Helper to parse FastAPI detail arrays or strings
const getErrorMessage = (err: any, fallback: string): string => {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d: any) => d.msg).join(", ");
  }
  return fallback;
};

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("identity");
  const [loading, setLoading] = useState(false);

  // Grouped form data for cleaner JSX
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // The token returned from the OTP verification step
  const [resetToken, setResetToken] = useState("");

  const router = useRouter();
  const { showAlert } = useAlert();

  const updateForm = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ---- API Integration Handlers ----

  const handleVerifyIdentity = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) {
      showAlert("Please fill in both fields.", false);
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-reset-identity", {
        username: formData.username,
        email: formData.email,
      });
      showAlert("Verification code sent to your email.", true);
      setStep("otp");
    } catch (err: any) {
      showAlert(getErrorMessage(err, "Verification failed."), false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.otp.trim()) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-reset-otp", {
        username: formData.username,
        email: formData.email,
        code: formData.otp,
      });
      setResetToken(res.data.reset_token);
      setStep("reset");
    } catch (err: any) {
      showAlert(getErrorMessage(err, "Invalid or expired code."), false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showAlert("Passwords do not match.", false);
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        reset_token: resetToken,
        new_password: formData.newPassword,
      });

      // Purge any existing sessions just to be safe
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-changed"));

      showAlert("Password updated. Please log in.", true);
      router.push("/auth/login");
    } catch (err: any) {
      showAlert(getErrorMessage(err, "Failed to reset password."), false);
    } finally {
      setLoading(false);
    }
  };

  // ---- Presentational Details ----

  const footer = (
    <>
      Remember your password?{" "}
      <Link
        href="/auth/login"
        className="text-primary hover:text-primary-glow font-medium"
      >
        Log In
      </Link>
    </>
  );

  const subtitles = {
    identity: "Verify your identity to continue",
    otp: "Enter the recovery code",
    reset: "Secure your account",
  };

  return (
    <AuthLayout
      title="Recover Account"
      subtitle={subtitles[step]}
      footer={footer}
    >
      {step === "identity" && (
        <form className="space-y-6" onSubmit={handleVerifyIdentity}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-text-main pl-1"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => updateForm("username", e.target.value)}
                placeholder="agent007"
                className="py-3"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-main pl-1"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="agent@evanesce.com"
                className="py-3"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={loading || !formData.username || !formData.email}
          >
            {loading ? "Verifying..." : "Send verification code"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          <OtpInput
            id="otp"
            required
            value={formData.otp}
            onChange={(e) => updateForm("otp", e.target.value)}
            email={formData.email}
          />
          <div className="space-y-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              disabled={loading || formData.otp.length < 6}
            >
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

      {step === "reset" && (
        <form className="space-y-5" onSubmit={handleReset}>
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-text-main pl-1"
            >
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              required
              value={formData.newPassword}
              onChange={(e) => updateForm("newPassword", e.target.value)}
              placeholder="••••••••"
              className="py-3"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-text-main pl-1"
            >
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => updateForm("confirmPassword", e.target.value)}
              placeholder="••••••••"
              className="py-3"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 mt-4"
            disabled={
              loading ||
              !formData.newPassword ||
              formData.newPassword !== formData.confirmPassword
            }
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
