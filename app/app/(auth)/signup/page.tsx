"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const PASSWORD_PATTERN = "(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    // Read current form values and send them to the signup API.
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!response.ok) {
        // Show backend validation/message (e.g., duplicate email, weak password).
        const data = (await response.json()) as { error?: string };
        setError(data.error || "Could not create account.");
        return;
      }

      // Create session cookie immediately after successful signup.
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!loginResult || loginResult.error) {
        router.push("/login");
        return;
      }

      router.push(loginResult.url || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-sm">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-dark">
            Create account
          </h1>
          <p className="text-sm text-neutral-gray mt-1">
            Sign up to start using MedSync.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-border p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-neutral-dark mb-1.5"
              >
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Dr. Jane Smith"
                required
                className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-dark mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="doctor@clinic.com"
                required
                className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-dark mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={8}
                pattern={PASSWORD_PATTERN}
                required
                title="Password must be at least 8 characters and include an uppercase letter, a number, and a special character."
                className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
              />
              <ul className="mt-2 text-xs text-neutral-gray space-y-1 list-disc list-inside">
                <li>Minimum 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one special character</li>
                <li>At least one number</li>
              </ul>
            </div>

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-semibold
                         rounded-lg transition-colors disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-xs text-center text-neutral-gray mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
