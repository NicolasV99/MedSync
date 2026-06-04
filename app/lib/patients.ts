import { getPool } from "@/lib/db";

export type Patient = {
  patient_id: number;
  patient_name: string;
  email: string | null;
  phone: string | null;
  dob: string;
  last_visit: string | null;
};

export const MOCK_PATIENTS: Patient[] = [
  {
    patient_id: 1,
    patient_name: "Maria Gutierrez",
    email: "maria@example.com",
    phone: "+1 555-0101",
    dob: "1985-03-12",
    last_visit: "2026-05-10",
  },
  {
    patient_id: 2,
    patient_name: "Doug McManamon",
    email: "doug@example.com",
    phone: "+1 555-0102",
    dob: "1978-07-24",
    last_visit: "2026-04-28",
  },
  {
    patient_id: 3,
    patient_name: "Norman Allen",
    email: "norman@example.com",
    phone: "+1 555-0103",
    dob: "1992-11-05",
    last_visit: null,
  },
  {
    patient_id: 4,
    patient_name: "Douglas King",
    email: "dking@example.com",
    phone: "+1 555-0104",
    dob: "1965-01-30",
    last_visit: "2026-05-01",
  },
];

export async function getPatients() {
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

  return { patients, usingMockData };
}
