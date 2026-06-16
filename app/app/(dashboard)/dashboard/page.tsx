import { getPool } from "@/lib/db";
import { auth } from "@/auth";
import { AppointmentsTodayCard } from "@/components/dashboard/AppointmentsTodayCard";
import { PatientsThisWeekCard } from "@/components/dashboard/PatientsThisWeekCard";
import { RecentAppointments } from "@/components/dashboard/RecentAppointments";

export const dynamic = "force-dynamic";

type PatientCountRow = {
  total_patients: string;
};

async function getTotalPatients() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) return "0";

    const result = await getPool().query<PatientCountRow>(
      `SELECT COUNT(*)::text AS total_patients FROM patients WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0]?.total_patients ?? "0";
  } catch (error) {
    console.error("Failed to load total patients", error);
    return "—";
  }
}

export default async function DashboardPage() {
  const totalPatients = await getTotalPatients();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-dark">Dashboard</h1>
        <p className="text-sm text-neutral-gray mt-1">
          Welcome back. Here&apos;s your clinic overview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Patients */}
        <div className="bg-white rounded-xl border border-neutral-border p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-neutral-dark">Total Patients</p>
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-lg">
              👥
            </div>
          </div>
          <p className="text-4xl font-bold text-neutral-dark">{totalPatients}</p>
          <p className="text-xs text-neutral-gray mt-1">Registered in your clinic</p>
        </div>

        {/* Appointments Today */}
        <AppointmentsTodayCard />

        {/* Patients This Week */}
        <PatientsThisWeekCard />

        {/* Recent Appointments */}
        <RecentAppointments />
      </div>
    </div>
  );
}
