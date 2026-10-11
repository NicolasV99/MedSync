"use client";

import { useAppointments } from "@/context/AppointmentsContext";

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

const AVATAR_COLORS = [
  "from-primary to-primary-dark",
  "from-success to-emerald-600",
  "from-info to-cyan-600",
  "from-warning to-amber-600",
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
];

type Props = {
  variant: "kpi" | "detail";
};

export function PatientsThisWeekCard({ variant }: Props) {
  const { appointments } = useAppointments();
  const { monday, sunday } = getWeekBounds();

  const weekAppointments = appointments.filter((a) => {
    const d = new Date(a.start);
    return d >= monday && d <= sunday;
  });

  const uniquePatients = Array.from(
    new Map(
      weekAppointments.map((a) => [
        a.patient_id ?? a.patient_name,
        { name: a.patient_name, count: 0 },
      ])
    ).values()
  );

  weekAppointments.forEach((a) => {
    const patient = uniquePatients.find((p) => p.name === a.patient_name);
    if (patient) patient.count++;
  });

  if (variant === "kpi") {
    return (
      <div className="bg-white rounded-2xl border border-neutral-border/50 p-4 lg:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-caption font-semibold text-neutral-gray uppercase tracking-wide">This Week</p>
          <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
            <svg className="w-[18px] h-[18px] text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p className="text-[2rem] font-bold text-neutral-dark tracking-tight leading-none">{uniquePatients.length}</p>
        <p className="text-[12px] text-neutral-gray mt-1.5">Unique patients</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-border/50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-headline text-neutral-dark">Patients This Week</h2>
        <span className="text-[12px] font-semibold text-white bg-warning px-2.5 py-1 rounded-full min-w-[24px] text-center">
          {uniquePatients.length}
        </span>
      </div>

      {uniquePatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-11 h-11 bg-neutral-light rounded-full flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-neutral-dark">No patients this week</p>
          <p className="text-caption text-neutral-gray mt-0.5">Schedule appointments to see patients here.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {uniquePatients.map((patient, i) => (
            <li key={patient.name} className="flex items-center gap-3 p-2.5 rounded-xl transition-colors">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center shrink-0`}>
                <span className="text-[12px] font-bold text-white">
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-[14px] font-medium text-neutral-dark truncate flex-1">{patient.name}</p>
              <span className="text-caption text-neutral-gray shrink-0 tabular-nums">
                {patient.count} {patient.count === 1 ? "appt" : "appts"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
