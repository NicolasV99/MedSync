import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

type PatientCountRow = {
  total_patients: string;
};

// Gets the current number of patient records from the database for the dashboard stat.
async function getTotalPatients() {
  try {
    const result = await getPool().query<PatientCountRow>(
      `SELECT COUNT(*)::text AS total_patients
       FROM patients`,
    );

    return result.rows[0]?.total_patients ?? "0";
  } catch (error) {
    console.error("Failed to load total patients", error);
    return "—";
  }
}

export default async function DashboardPage() {
  const totalPatients = await getTotalPatients();

  const stats = [
    {
      label: "Total Patients",
      value: totalPatients,
      icon: "👥",
      color: "bg-primary-light text-primary",
    },
    {
      label: "Appointments Today",
      value: "—",
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
      label: "No-Show Rate",
      value: "—",
      icon: "📊",
      color: "bg-bg-warning text-warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-dark">Dashboard</h1>
        <p className="text-sm text-neutral-gray mt-1">
          Welcome back. Here&apos;s your clinic overview.
        </p>
      </div>

      {/* Stats */}
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

      {/* Recent Activity placeholder */}
      <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-dark mb-4">
          Recent Appointments
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
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
            No appointments yet
          </p>
          <p className="text-xs text-neutral-gray mt-1">
            Appointments will appear here once you connect Google Calendar.
          </p>
        </div>
      </div>
    </div>
  );
}
