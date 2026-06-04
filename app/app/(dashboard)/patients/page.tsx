import { AddPatientButton } from "@/components/patients/AddPatientButton";
import { PatientTable } from "@/components/patients/PatientTable";
import { getPatients } from "@/lib/patients";

// Always fetch fresh data — no caching
export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const { patients, usingMockData } = await getPatients();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Patients</h1>
          <p className="text-sm text-neutral-gray mt-1">
            Manage your patient records.
          </p>
        </div>
        <AddPatientButton />
      </div>

      {usingMockData && (
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-bg-warning text-warning border border-yellow-200">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          DB offline — showing mock data. Ask Nefi to resume the Neon database.
        </div>
      )}

      <PatientTable patients={patients} />
    </div>
  );
}
