"use client";

import { useEffect, useState } from "react";

type CalendarStatusResponse = {
  connected?: boolean;
};

export default function Navbar() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCalendarStatus() {
      try {
        const response = await fetch("/api/calendar/status", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as CalendarStatusResponse;

        if (active) {
          setConnected(Boolean(data.connected));
        }
      } catch {
        if (active) {
          setConnected(false);
        }
      }
    }

    void loadCalendarStatus();

    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="h-14 bg-white border-b border-neutral-border px-6 flex items-center justify-between shrink-0">
      <div className="text-sm text-neutral-gray">Spring 2025 — CSE 499</div>
      <div className="flex items-center gap-3">
        {/* Google Calendar connection badge */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-gray border border-neutral-border rounded-full px-3 py-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-neutral-gray"}`}
          ></span>
          {connected
            ? "Google Calendar conected"
            : "Google Calendar not connected"}
        </div>
      </div>
    </header>
  );
}
