"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import AuthLayout from "@/src/components/layout/AuthLayout";
import { OtpInput } from "@/src/components/ui/OtpInput";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

type Step = "identity" | "otp" | "reset";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("identity");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateForm = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (nextStep: Step | "done") => (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (nextStep === "done") {
        console.log("Password reset successful!");
        setStep("identity"); // loop back for testing
        setFormData({
          username: "",
          email: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setStep(nextStep);
      }
    }, 1000);
  };

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
        <form className="space-y-6" onSubmit={handleSubmit("otp")}>
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
        <form className="space-y-6" onSubmit={handleSubmit("reset")}>
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
        <form className="space-y-5" onSubmit={handleSubmit("done")}>
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
