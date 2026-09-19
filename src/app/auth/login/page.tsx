"use client";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(false);
    // Mocking an API call delay
    console.log("Logging in with:", { username, password });
    setTimeout(() => {
      setIsLoading(false);
      // Here is where you will eventually router.push('/')
    }, 1500);
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface border border-border rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-text-main text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Enter your credentials to access your secure chats.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-main pl-1"
            >
              Username
            </label>
            <Input
              id="username"
              type="name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jhon doe"
              required
              className="py-3"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-main"
              >
                Password
              </label>
              {/* Forgot Password Link */}
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:text-primary-glow transition-colors"
                tabIndex={-1} // Keeps it out of the main tab flow for quicker typing
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

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 rounded-xl text-base font-medium mt-2"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? "Authenticating..." : "Log In"}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-text-muted">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary hover:text-primary-glow transition-colors font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
