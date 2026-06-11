"use client";

import { useAppointments } from "@/context/AppointmentsContext";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-bg-success text-success",
  scheduled: "bg-bg-info text-info",
  cancelled: "bg-bg-warning text-warning",
  completed: "bg-neutral-light text-neutral-gray",
};

type Stat = {
  label: string;
  value: string | number;
  icon: string;
  color: string;
};

type Props = {
  totalPatients: string;
};

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

export function StatsGrid({ totalPatients }: Props) {
  const { appointments } = useAppointments();
  const todayCount = appointments.filter((a) => isToday(a.start)).length;

  const { monday, sunday } = getWeekBounds();
  const patientsThisWeek = new Set(
    appointments
      .filter((a) => {
        const d = new Date(a.start);
        return d >= monday && d <= sunday;
      })
      .map((a) => a.patient_id ?? a.patient_name)
  ).size;

  const stats: Stat[] = [
    {
      label: "Total Patients",
      value: totalPatients,
      icon: "👥",
      color: "bg-primary-light text-primary",
    },
    {
      label: "Appointments Today",
      value: todayCount,
      icon: "📅",
      color: "bg-bg-info text-info",
    },
    {
      label: "Reminders Sent",
      value: "—",
      icon: "💬",
      color: "bg-bg-success text-success",
    },
    {
      label: "Patients This Week",
      value: patientsThisWeek,
      icon: "📊",
      color: "bg-bg-warning text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm"
        >
          <div
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-lg ${stat.color} mb-3`}
          >
            {stat.icon}
          </div>
          <p className="text-2xl font-bold text-neutral-dark">{stat.value}</p>
          <p className="text-sm text-neutral-gray mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
