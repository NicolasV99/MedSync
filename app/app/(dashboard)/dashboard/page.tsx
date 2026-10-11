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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-title text-neutral-dark">Dashboard</h1>
        <p className="text-caption text-neutral-gray mt-1">
          Welcome back. Here&apos;s your clinic overview.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white rounded-2xl border border-neutral-border/50 p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-caption font-semibold text-neutral-gray uppercase tracking-wide">Patients</p>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="w-[18px] h-[18px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-[2rem] font-bold text-neutral-dark tracking-tight leading-none">{totalPatients}</p>
          <p className="text-[12px] text-neutral-gray mt-1.5">Total registered</p>
        </div>

        <AppointmentsTodayCard variant="kpi" />

        <PatientsThisWeekCard variant="kpi" />

        <div className="bg-white rounded-2xl border border-neutral-border/50 p-4 lg:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-caption font-semibold text-neutral-gray uppercase tracking-wide">Sync</p>
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
              <svg className="w-[18px] h-[18px] text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <p className="text-[2rem] font-bold text-neutral-dark tracking-tight leading-none">—</p>
          <p className="text-[12px] text-neutral-gray mt-1.5">Google Calendar</p>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <AppointmentsTodayCard variant="detail" />
        <PatientsThisWeekCard variant="detail" />
      </div>

      {/* Recent */}
      <RecentAppointments />
    </div>
  );
}
