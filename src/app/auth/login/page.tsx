"use client";
import { useState, FormEvent, ReactNode } from "react";
import Link from "next/link";
import AuthLayout from "@/src/components/layout/AuthLayout";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";

import { useRouter } from "next/navigation";
import { useAlert } from "@/src/contexts/AlertContext";
import { api } from "@/src/services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { showAlert } = useAlert();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      return;
    }

    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    try {
      const res = await api.post("login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = await res.data.access_token;
      localStorage.setItem("token", token);

      window.dispatchEvent(new Event("auth-changed"));
      router.push("/");
    } catch (err: any) {
      const detail =
        err.response?.data?.detail || "invalid username or password";
      showAlert(typeof detail === "string" ? detail : "login failed", false);
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <>
      Don't have an account?{" "}
      <Link
        href="/auth/signup"
        className="text-primary hover:text-primary-glow transition-colors font-medium"
      >
        Sign up
      </Link>
    </>
  );

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your secure chats."
      footer={footer}
    >
      <form onSubmit={handleLogin} className="space-y-6">
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="agent007"
            required
            className="py-3"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between pl-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-main"
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary hover:text-primary-glow"
              tabIndex={-1}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="py-3"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 rounded-xl mt-2"
          disabled={isLoading || !username || !password}
        >
          {isLoading ? "Authenticating..." : "Log In"}
        </Button>
      </form>
    </AuthLayout>
  );
}
