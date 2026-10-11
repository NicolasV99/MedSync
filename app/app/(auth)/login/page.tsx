"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(result.url || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-svh bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-[380px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-[18px] mb-5 shadow-lg shadow-primary/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-title text-neutral-dark">MedSync</h1>
          <p className="text-caption text-neutral-gray mt-1">Medical practice management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm shadow-black/5 border border-neutral-border/50 p-7">
          <h2 className="text-headline text-neutral-dark mb-0.5">Welcome back</h2>
          <p className="text-caption text-neutral-gray mb-6">Sign in to access your dashboard.</p>

          {/* Google sign-in first (primary action) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="pressable w-full py-3 px-4 border border-neutral-border/60 text-[15px] font-medium
                       text-neutral-dark rounded-xl bg-white transition-colors disabled:opacity-60
                       flex items-center justify-center gap-3"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-neutral-border/60" />
            <span className="text-[12px] text-neutral-gray font-medium">or</span>
            <div className="flex-1 h-px bg-neutral-border/60" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-neutral-dark mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm((c) => ({ ...c, email: e.target.value }))}
                placeholder="doctor@clinic.com"
                required
                autoComplete="email"
                className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-neutral-gray/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[13px] font-semibold text-neutral-dark">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[12px] text-primary font-medium">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((c) => ({ ...c, password: e.target.value }))}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-3 text-[15px] bg-neutral-light/60 border border-neutral-border/50 rounded-xl outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-neutral-gray/50"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[13px] text-danger bg-bg-danger/60 rounded-xl px-3.5 py-2.5 border border-danger/10">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pressable w-full py-3 px-4 bg-primary text-white text-[15px] font-semibold
                         rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-[13px] text-center text-neutral-gray mt-5">
            Need an account?{" "}
            <Link href="/signup" className="text-primary font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        <p className="text-[12px] text-center text-neutral-gray/60 mt-6">
          CSE 499 Senior Project
        </p>
      </div>
    </div>
  );
}
