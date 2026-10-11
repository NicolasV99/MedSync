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
        if (!response.ok) return;
        const data = (await response.json()) as CalendarStatusResponse;
        if (active) setConnected(Boolean(data.connected));
      } catch {
        if (active) setConnected(false);
      }
    }

    void loadCalendarStatus();
    return () => { active = false; };
  }, []);

  return (
    <header className="h-14 material-regular border-b border-neutral-border/40 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10 lg:pl-6 pl-16">
      <div className="text-caption text-neutral-gray font-medium">
        Medical CRM
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-caption text-neutral-gray border border-neutral-border/50 rounded-full px-3 py-1.5 bg-white/50">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-success" : "bg-neutral-gray/40"}`} />
          <span className="font-medium">
            {connected ? "Calendar synced" : "Calendar not connected"}
          </span>
        </div>
      </div>
    </header>
  );
}
