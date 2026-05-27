import { AddPatientButton } from "@/components/patients/AddPatientButton";
import { getPool } from "@/lib/db";

type Patient = {
  patient_id: number;
  patient_name: string;
  email: string | null;
  phone: string | null;
  dob: string;
  last_visit: string | null;
};

function formatDate(dateValue: string | null) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function PatientsPage() {
  let patients: Patient[] = [];
  let loadError = false;

  try {
    const result = await getPool().query<Patient>(
      `SELECT patient_id, patient_name, email, phone, dob, last_visit
       FROM patients
       ORDER BY patient_id DESC`,
    );
    patients = result.rows;
  } catch (error) {
    console.error("Failed to load patients", error);
    loadError = true;
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

      {loadError && (
        <p className="text-sm px-3 py-2 rounded-lg bg-bg-danger text-danger border border-red-200">
          Could not load patients from the database.
        </p>
      )}

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-gray"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          disabled
          placeholder="Search patients by name or email..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-border rounded-lg outline-none
                     focus:border-primary focus:ring-2 focus:ring-primary-light bg-white transition-colors disabled:opacity-60"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-border bg-neutral-light">
              <th className="text-left px-4 py-3 font-semibold text-neutral-gray">
                Name
              </th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-gray">
                Email
              </th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-gray">
                Phone
              </th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-gray">
                Last Visit
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.patient_id}
                className="border-b border-neutral-border/60 last:border-none"
              >
                <td className="px-4 py-3 text-neutral-dark font-medium">
                  {patient.patient_name}
                </td>
                <td className="px-4 py-3 text-neutral-gray">
                  {patient.email ?? "-"}
                </td>
                <td className="px-4 py-3 text-neutral-gray">
                  {patient.phone ?? "-"}
                </td>
                <td className="px-4 py-3 text-neutral-gray">
                  {formatDate(patient.last_visit)}
                </td>
              </tr>
            ))}

            {patients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-light rounded-full flex items-center justify-center">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-neutral-dark">
                      No patients found
                    </p>
                    <p className="text-xs text-neutral-gray">
                      Use Add Patient to create your first test patient.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
