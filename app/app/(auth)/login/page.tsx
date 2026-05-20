export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-dark">MedSync</h1>
          <p className="text-sm text-neutral-gray mt-1">Medical practice management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-border p-8">
          <h2 className="text-lg font-semibold text-neutral-dark mb-6">Sign in to your account</h2>

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
              <label htmlFor="password" className="block text-sm font-medium text-neutral-dark mb-1.5">
                Password
              </label>
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
                         rounded-lg transition-colors mt-2"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
