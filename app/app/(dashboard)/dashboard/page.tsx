import { getPool } from "@/lib/db";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentAppointments } from "@/components/dashboard/RecentAppointments";

type TotalPatientsRow = {
  total: string;
};

export default async function DashboardPage() {
  let totalPatients = "0";

  try {
    const result = await getPool().query<TotalPatientsRow>(
      `SELECT COUNT(*)::text AS total FROM patients`,
    );
    totalPatients = result.rows[0]?.total ?? "0";
  } catch (error) {
    console.error("Failed to fetch total patients", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-dark">Dashboard</h1>
        <p className="text-sm text-neutral-gray mt-1">
          Welcome back. Here&apos;s your clinic overview.
        </p>
      </div>

      <StatsGrid totalPatients={totalPatients} />

      <RecentAppointments />
    </div>
  );
}
