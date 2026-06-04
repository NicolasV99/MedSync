"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginForm = {
  email: string;
  password: string;
};

type SignUpForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialSignUpForm: SignUpForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const initialLoginForm: LoginForm = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  // Stores user input for sign-in.
  const [loginForm, setLoginForm] = useState<LoginForm>(initialLoginForm);
  // Displays API or validation errors for sign-in.
  const [loginError, setLoginError] = useState<string | null>(null);
  // Prevents duplicate sign-in requests.
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  // Controls the visibility of the sign-up form inside the login card.
  const [showSignUp, setShowSignUp] = useState(false);
  // Stores user input for account creation.
  const [signUpForm, setSignUpForm] = useState<SignUpForm>(initialSignUpForm);
  // Displays API or validation errors for sign-up.
  const [signUpError, setSignUpError] = useState<string | null>(null);
  // Displays success feedback after account creation.
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  // Prevents duplicate requests while the sign-up request is running.
  const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError(null);
    setSignUpSuccess(null);

    const email = loginForm.email.trim().toLowerCase();
    const password = loginForm.password;

    if (!email || !password) {
      setLoginError("Enter your email and password.");
      return;
    }

    setIsSubmittingLogin(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not sign in.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Could not sign in.",
      );
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSignUpError(null);
    setSignUpSuccess(null);

    // Normalizes text fields before validation/submission.
    const firstName = signUpForm.firstName.trim();
    const lastName = signUpForm.lastName.trim();
    const email = signUpForm.email.trim().toLowerCase();

    // Basic client-side validation for required fields.
    if (!firstName || !lastName || !email || !signUpForm.password) {
      setSignUpError("Please complete all required fields.");
      return;
    }

    // Enforces a minimum password length before hitting the API.
    if (signUpForm.password.length < 8) {
      setSignUpError("Password must be at least 8 characters.");
      return;
    }

    // Ensures the user typed the same password twice.
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setSignUpError("Passwords do not match.");
      return;
    }

    setIsSubmittingSignUp(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // The backend expects snake_case keys.
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password: signUpForm.password,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not create account.");
      }

      // On success, clear form and collapse sign-up section.
      setSignUpSuccess(
        payload.message ?? "Account created. You can now sign in.",
      );
      setSignUpForm(initialSignUpForm);
      setShowSignUp(false);
    } catch (error) {
      setSignUpError(
        error instanceof Error ? error.message : "Could not create account.",
      );
    } finally {
      setIsSubmittingSignUp(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-dark">MedSync</h1>
          <p className="text-sm text-neutral-gray mt-1">
            Medical practice management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-border p-8">
          <h2 className="text-lg font-semibold text-neutral-dark mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-neutral-gray mb-6">
            Sign in to access your dashboard.
          </p>

          {loginError && (
            <p className="mb-4 text-sm px-3 py-2 rounded-lg bg-bg-danger text-danger border border-red-200">
              {loginError}
            </p>
          )}

          {/* Shared alert area for sign-up feedback. */}
          {signUpError && (
            <p className="mb-4 text-sm px-3 py-2 rounded-lg bg-bg-danger text-danger border border-red-200">
              {signUpError}
            </p>
          )}
          {signUpSuccess && (
            <p className="mb-4 text-sm px-3 py-2 rounded-lg bg-bg-success text-success border border-green-200">
              {signUpSuccess}
            </p>
          )}

          <form className="space-y-4" onSubmit={handleSignIn}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-dark mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="doctor@clinic.com"
                className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-dark"
                >
                  Password
                </label>
                <span className="text-xs text-primary cursor-pointer hover:text-primary-dark">
                  Forgot password?
                </span>
              </div>
              <input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-semibold
                         rounded-lg transition-colors disabled:opacity-60"
            >
              {isSubmittingLogin ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign-up form appears on demand to keep initial login UI compact. */}
          {showSignUp && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-neutral-border"></div>
                <span className="text-xs text-neutral-gray">
                  create account
                </span>
                <div className="flex-1 h-px bg-neutral-border"></div>
              </div>

              <form className="space-y-3" onSubmit={handleSignUp}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-neutral-dark mb-1.5"
                    >
                      First Name
                    </label>
                    <input
                      id="first_name"
                      value={signUpForm.firstName}
                      onChange={(event) =>
                        setSignUpForm((current) => ({
                          ...current,
                          firstName: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                                 focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-neutral-dark mb-1.5"
                    >
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      value={signUpForm.lastName}
                      onChange={(event) =>
                        setSignUpForm((current) => ({
                          ...current,
                          lastName: event.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                                 focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup_email"
                    className="block text-sm font-medium text-neutral-dark mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="signup_email"
                    type="email"
                    value={signUpForm.email}
                    onChange={(event) =>
                      setSignUpForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                               focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup_password"
                    className="block text-sm font-medium text-neutral-dark mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="signup_password"
                    type="password"
                    value={signUpForm.password}
                    onChange={(event) =>
                      setSignUpForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="At least 8 characters"
                    className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                               focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-neutral-dark mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm_password"
                    type="password"
                    value={signUpForm.confirmPassword}
                    onChange={(event) =>
                      setSignUpForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                               focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingSignUp}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-semibold
                             rounded-lg transition-colors disabled:opacity-60"
                >
                  {isSubmittingSignUp
                    ? "Creating account..."
                    : "Create Account"}
                </button>
              </form>
            </>
          )}

          {/* Demo shortcut kept for development/testing. */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-neutral-border"></div>
            <span className="text-xs text-neutral-gray">demo</span>
            <div className="flex-1 h-px bg-neutral-border"></div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-neutral-border
                       text-sm font-medium text-neutral-dark rounded-lg hover:bg-neutral-light transition-colors"
          >
            Continue to Dashboard
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => {
              // Reset messages when toggling views to avoid stale alerts.
              setLoginError(null);
              setSignUpError(null);
              setSignUpSuccess(null);
              setShowSignUp((current) => !current);
            }}
            className="mt-4 w-full text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            {showSignUp ? "Hide Sign Up" : "Don\'t have an account? Sign Up"}
          </button>
        </div>

        <p className="text-xs text-center text-neutral-gray mt-6">
          CSE 499 Senior Project · BYU Spring 2025
        </p>
      </div>
    </div>
  );
}
