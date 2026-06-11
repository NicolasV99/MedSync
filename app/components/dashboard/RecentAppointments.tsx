"use client";

import { useAppointments } from "@/context/AppointmentsContext";
import type { AppointmentStatus } from "@/context/AppointmentsContext";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "Confirmed",
  scheduled: "Scheduled",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  confirmed: "bg-bg-success text-success",
  scheduled: "bg-bg-info text-info",
  cancelled: "bg-bg-warning text-warning",
  completed: "bg-neutral-light text-neutral-gray",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function RecentAppointments() {
  const { appointments } = useAppointments();

  const past = appointments
    .filter((a) => new Date(a.start) < startOfToday())
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm">
      <h2 className="text-base font-semibold text-neutral-dark mb-4">
        Recent Appointments
      </h2>

      {past.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 bg-neutral-light rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-neutral-gray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-neutral-dark">
            No past appointments
          </p>
          <p className="text-xs text-neutral-gray mt-1">
            Completed appointments from previous days will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-border">
          {past.map((appt) => (
            <li key={appt.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-dark truncate">
                  {appt.patient_name}
                </p>
                <p className="text-xs text-neutral-gray truncate">{appt.title}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-neutral-dark">
                  {formatDate(appt.start)}
                </p>
                <p className="text-xs text-neutral-gray">{formatTime(appt.start)}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[appt.status]}`}
              >
                {STATUS_LABEL[appt.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
