import { AddPatientButton } from "@/components/patients/AddPatientButton";
import { PatientTable } from "@/components/patients/PatientTable";
import { getPool } from "@/lib/db";

// Always fetch fresh data — no caching
export const dynamic = "force-dynamic";

type Patient = {
  patient_id: number;
  patient_name: string;
  email: string | null;
  phone: string | null;
  dob: string;
  last_visit: string | null;
};

// Mock data for local development when DB is unavailable
const MOCK_PATIENTS: Patient[] = [
  { patient_id: 1, patient_name: "Maria Gutierrez", email: "maria@example.com", phone: "+1 555-0101", dob: "1985-03-12", last_visit: "2026-05-10" },
  { patient_id: 2, patient_name: "Doug McManamon", email: "doug@example.com", phone: "+1 555-0102", dob: "1978-07-24", last_visit: "2026-04-28" },
  { patient_id: 3, patient_name: "Norman Allen", email: "norman@example.com", phone: "+1 555-0103", dob: "1992-11-05", last_visit: null },
  { patient_id: 4, patient_name: "Douglas King", email: "dking@example.com", phone: "+1 555-0104", dob: "1965-01-30", last_visit: "2026-05-01" },
];

export default async function PatientsPage() {
  let patients: Patient[] = [];
  let usingMockData = false;

  try {
    const result = await getPool().query<Patient>(
      `SELECT patient_id, patient_name, email, phone, dob, last_visit
       FROM patients
       ORDER BY patient_id DESC`,
    );
    patients = result.rows;
  } catch (error) {
    console.error("Failed to load patients — using mock data", error);
    patients = MOCK_PATIENTS;
    usingMockData = true;
  }

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
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          DB offline — showing mock data. Ask Nefi to resume the Neon database.
        </div>
      )}

      <PatientTable patients={patients} />
    </div>
  );
}
