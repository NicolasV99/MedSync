"use client";

type Props = {
  connected?: boolean;
  connectedEmail?: string | null;
};

export function GoogleCalendarCard({ connected = false, connectedEmail }: Props) {
  return (
    <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-light flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4285F4" strokeWidth="1.8" />
              <path d="M3 9h18" stroke="#4285F4" strokeWidth="1.8" />
              <path d="M8 2v4M16 2v4" stroke="#4285F4" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="7" y="13" width="4" height="3" rx="0.5" fill="#EA4335" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-dark">Google Calendar</p>
            <p className="text-xs text-neutral-gray">
              {connected
                ? `Connected as ${connectedEmail ?? "your account"}`
                : "Sync appointments with your calendar"}
            </p>
          </div>
        </div>

        {connected ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-bg-success px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Connected
            </span>
            <button
              type="button"
              disabled
              title="Coming soon"
              className="text-xs text-neutral-gray hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled
            title="Coming soon — backend integration in progress"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-primary
                       rounded-lg hover:bg-primary-dark transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 18 18" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M9 1a8 8 0 100 16A8 8 0 009 1zm0 14.5A6.5 6.5 0 112.5 9 6.508 6.508 0 019 15.5z" />
              <path d="M9.75 4.5h-1.5v5.25l4.5 2.7.75-1.23-3.75-2.22V4.5z" />
            </svg>
            Connect Calendar
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-gray bg-neutral-light rounded-lg px-3 py-2">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Once connected, new appointments will automatically appear in your Google Calendar.
      </div>
    </div>
  );
}
