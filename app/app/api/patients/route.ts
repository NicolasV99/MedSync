import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

type PatientRow = {
  patient_id: number;
  patient_name: string;
  email: string | null;
  phone: string | null;
  dob: string;
  last_visit: string | null;
};

export async function GET() {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const result = await getPool().query<PatientRow>(
      `SELECT patient_id, patient_name, email, phone, dob, last_visit
       FROM patients
       WHERE user_id = $1
       ORDER BY patient_id DESC`,
      [userId],
    );

    return NextResponse.json({ patients: result.rows });
  } catch (error) {
    console.error("Failed to fetch patients", error);
    return NextResponse.json(
      { error: "Failed to fetch patients." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as {
      patient_name?: string;
      email?: string;
      phone?: string;
      dob?: string;
    };

    const patientName = body.patient_name?.trim();
    const dob = body.dob?.trim();
    const email = body.email?.trim() || null;
    const phone = body.phone?.trim() || null;

    if (!patientName || !dob) {
      return NextResponse.json(
        { error: "patient_name and dob are required." },
        { status: 400 },
      );
    }

    const result = await getPool().query<PatientRow>(
      `INSERT INTO patients (patient_name, dob, email, phone, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING patient_id, patient_name, email, phone, dob, last_visit`,
      [patientName, dob, email, phone, userId],
    );

    return NextResponse.json({ patient: result.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    const pgError = error as {
      message?: string;
      code?: string;
      detail?: string;
      constraint?: string;
      column?: string;
      table?: string;
    };

    console.error("Failed to create patient", pgError);

    return NextResponse.json(
      {
        error: pgError.message ?? "Failed to create patient.",
        code: pgError.code ?? null,
        detail: pgError.detail ?? null,
        constraint: pgError.constraint ?? null,
        column: pgError.column ?? null,
        table: pgError.table ?? null,
      },
      { status: 500 },
    );
  }
}
