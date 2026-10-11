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
  confirmed: "bg-success/10 text-success",
  scheduled: "bg-primary/10 text-primary",
  cancelled: "bg-warning/10 text-warning",
  completed: "bg-neutral-light text-neutral-gray",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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
    <div className="bg-white rounded-2xl border border-neutral-border/50 p-5 shadow-sm">
      <h2 className="text-headline text-neutral-dark mb-4">Recent Appointments</h2>

      {past.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 bg-neutral-light rounded-full flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-neutral-dark">No past appointments</p>
          <p className="text-caption text-neutral-gray mt-0.5">Previous appointments will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-neutral-border/50">
                <th className="text-left text-[12px] font-semibold text-neutral-gray uppercase tracking-wide px-5 pb-3">Patient</th>
                <th className="text-left text-[12px] font-semibold text-neutral-gray uppercase tracking-wide px-3 pb-3">Visit</th>
                <th className="text-left text-[12px] font-semibold text-neutral-gray uppercase tracking-wide px-3 pb-3">Date</th>
                <th className="text-right text-[12px] font-semibold text-neutral-gray uppercase tracking-wide px-5 pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {past.map((appt) => (
                <tr key={appt.id} className="border-b border-neutral-border/30 last:border-0">
                  <td className="px-5 py-3">
                    <p className="text-[14px] font-semibold text-neutral-dark">{appt.patient_name}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-[14px] text-neutral-gray">{appt.title}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-[13px] text-neutral-dark tabular-nums">{formatDate(appt.start)}</p>
                    <p className="text-[12px] text-neutral-gray tabular-nums">{formatTime(appt.start)}</p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-md ${STATUS_COLORS[appt.status]}`}>
                      {STATUS_LABEL[appt.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
