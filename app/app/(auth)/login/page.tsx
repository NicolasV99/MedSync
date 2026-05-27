import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-4 shadow-sm">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-dark">MedSync</h1>
          <p className="text-sm text-neutral-gray mt-1">Medical practice management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-border p-8">
          <h2 className="text-lg font-semibold text-neutral-dark mb-1">Welcome back</h2>
          <p className="text-sm text-neutral-gray mb-6">Sign in to access your dashboard.</p>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="doctor@clinic.com"
                className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-dark">
                  Password
                </label>
                <span className="text-xs text-primary cursor-pointer hover:text-primary-dark">Forgot password?</span>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-semibold
                         rounded-lg transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Divider — temp while no auth */}
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <p className="text-xs text-center text-neutral-gray mt-6">
          CSE 499 Senior Project · BYU Spring 2025
        </p>
      </div>
    </div>
  );
}
