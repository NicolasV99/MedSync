"use client";

import { useAppointments } from "@/context/AppointmentsContext";
import type { AppointmentStatus } from "@/context/AppointmentsContext";

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  confirmed: "bg-bg-success text-success",
  scheduled: "bg-bg-info text-info",
  cancelled: "bg-bg-warning text-warning",
  completed: "bg-neutral-light text-neutral-gray",
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "Confirmed",
  scheduled: "Scheduled",
  cancelled: "Cancelled",
  completed: "Completed",
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function AppointmentsTodayCard() {
  const { appointments } = useAppointments();

  const todayAppointments = appointments
    .filter((a) => isToday(a.start))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-neutral-dark">
          Appointments Today
        </h2>
        <span className="text-xs font-medium text-white bg-primary px-2 py-0.5 rounded-full">
          {todayAppointments.length}
        </span>
      </div>

      {todayAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 bg-neutral-light rounded-full flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-gray">No appointments today</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-border">
          {todayAppointments.map((appt) => (
            <li key={appt.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-dark truncate">
                  {appt.patient_name}
                </p>
                <p className="text-xs text-neutral-gray truncate">{appt.title}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-xs text-neutral-dark">{formatTime(appt.start)}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[appt.status]}`}>
                  {STATUS_LABEL[appt.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
