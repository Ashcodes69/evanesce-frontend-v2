"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";

import AuthLayout from "@/src/components/layout/AuthLayout";
import { OtpInput } from "@/src/components/ui/OtpInput";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

type Step = "email" | "otp" | "username" | "details";

export default function Register() {
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    username: "",
    fullName: "",
    password: "",
    confirm: "",
  });

  const updateForm = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (nextStep: Step) => (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(nextStep);
    }, 1000);
  };

  const footer = (
    <>
      Already have an account?{" "}
      <Link
        href="/auth/login"
        className="text-primary hover:text-primary-glow font-medium"
      >
        Log In
      </Link>
    </>
  );

  const subtitles = {
    email: "Let's start with your email",
    otp: "Enter the code we sent you",
    username: "Pick a unique username",
    details: "Set your name and password",
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle={subtitles[step]}
      footer={footer}
    >
      {step === "email" && (
        <form className="space-y-6" onSubmit={handleSubmit("otp")}>
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
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={loading || !formData.email}
          >
            Send verification code
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form className="space-y-6" onSubmit={handleSubmit("username")}>
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
              Verify code
            </Button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-center text-sm text-text-muted hover:text-text-main"
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {step === "username" && (
        <form className="space-y-6" onSubmit={handleSubmit("details")}>
          <div className="space-y-2">
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-text-main pl-1"
            >
              Username
            </label>
            <Input
              id="userName"
              type="text"
              required
              value={formData.username}
              onChange={(e) => updateForm("username", e.target.value)}
              placeholder="johndoe"
              className="py-3"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            disabled={loading || !formData.username}
          >
            Continue
          </Button>
        </form>
      )}

      {step === "details" && (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Done");
          }}
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-main pl-1">
              Full Name
            </label>
            <Input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => updateForm("fullName", e.target.value)}
              placeholder="John Doe"
              className="py-3"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-main pl-1">
              Password
            </label>
            <Input
              type="password"
              required
              value={formData.password}
              onChange={(e) => updateForm("password", e.target.value)}
              placeholder="••••••••"
              className="py-3"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-main pl-1">
              Confirm
            </label>
            <Input
              type="password"
              required
              value={formData.confirm}
              onChange={(e) => updateForm("confirm", e.target.value)}
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
              !formData.password ||
              formData.password !== formData.confirm
            }
          >
            Create account
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
