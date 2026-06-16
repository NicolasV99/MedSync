import { getPool } from "@/lib/db";
import { auth } from "@/auth";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentAppointments } from "@/components/dashboard/RecentAppointments";
import { GoogleCalendarCard } from "@/components/dashboard/GoogleCalendarCard";

export const dynamic = "force-dynamic";

type PatientCountRow = {
  total_patients: string;
};

async function getTotalPatients() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return "0";
    }

    const result = await getPool().query<PatientCountRow>(
      `SELECT COUNT(*)::text AS total_patients
       FROM patients
       WHERE user_id = $1`,
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

      <StatsGrid totalPatients={totalPatients} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAppointments />
        <GoogleCalendarCard />
      </div>
    </div>
  );
}
