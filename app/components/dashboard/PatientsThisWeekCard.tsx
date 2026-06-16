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

export function PatientsThisWeekCard() {
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
    const key = a.patient_id ?? a.patient_name;
    const patient = uniquePatients.find(
      (p) => p.name === a.patient_name
    );
    if (patient) patient.count++;
  });

  return (
    <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-neutral-dark">
          Patients This Week
        </h2>
        <span className="text-xs font-medium text-white bg-primary px-2 py-0.5 rounded-full">
          {uniquePatients.length}
        </span>
      </div>

      {uniquePatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 bg-neutral-light rounded-full flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-gray">No patients this week</p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-border">
          {uniquePatients.map((patient) => (
            <li key={patient.name} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-primary">
                    {patient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-dark truncate">
                  {patient.name}
                </p>
              </div>
              <span className="text-xs text-neutral-gray shrink-0">
                {patient.count} {patient.count === 1 ? "appt" : "appts"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
