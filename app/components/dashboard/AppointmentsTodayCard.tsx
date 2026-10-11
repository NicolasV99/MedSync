"use client";

import { useAppointments } from "@/context/AppointmentsContext";
import type { AppointmentStatus } from "@/context/AppointmentsContext";

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  confirmed: "bg-success/10 text-success",
  scheduled: "bg-primary/10 text-primary",
  cancelled: "bg-warning/10 text-warning",
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

type Props = {
  variant: "kpi" | "detail";
};

export function AppointmentsTodayCard({ variant }: Props) {
  const { appointments } = useAppointments();

  const todayAppointments = appointments
    .filter((a) => isToday(a.start))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (variant === "kpi") {
    return (
      <div className="bg-white rounded-2xl border border-neutral-border/50 p-4 lg:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-caption font-semibold text-neutral-gray uppercase tracking-wide">Today</p>
          <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center">
            <svg className="w-[18px] h-[18px] text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <p className="text-[2rem] font-bold text-neutral-dark tracking-tight leading-none">{todayAppointments.length}</p>
        <p className="text-[12px] text-neutral-gray mt-1.5">Appointments</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-border/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-headline text-neutral-dark">Today&apos;s Schedule</h2>
        <span className="text-[12px] font-semibold text-white bg-primary px-2.5 py-1 rounded-full min-w-[24px] text-center">
          {todayAppointments.length}
        </span>
      </div>

      {todayAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-11 h-11 bg-neutral-light rounded-full flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-neutral-dark">No appointments today</p>
          <p className="text-caption text-neutral-gray mt-0.5">Your schedule is clear.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {todayAppointments.map((appt) => (
            <li key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-light/50 transition-colors">
              <div className="w-1 h-9 rounded-full bg-primary/30 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-neutral-dark truncate">{appt.patient_name}</p>
                <p className="text-caption text-neutral-gray truncate">{appt.title}</p>
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-[13px] font-medium text-neutral-dark tabular-nums">{formatTime(appt.start)}</p>
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLORS[appt.status]}`}>
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
