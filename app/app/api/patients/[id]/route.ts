import { NextResponse } from "next/server";

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

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parsePatientId(id: string) {
  const patientId = Number(id);
  if (!Number.isInteger(patientId) || patientId <= 0) {
    return null;
  }
  return patientId;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const patientId = parsePatientId(id);

  if (!patientId) {
    return NextResponse.json({ error: "Invalid patient id." }, { status: 400 });
  }

  try {
    const result = await getPool().query<PatientRow>(
      `SELECT patient_id, patient_name, email, phone, dob, last_visit
       FROM patients
       WHERE patient_id = $1`,
      [patientId],
    );

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ patient: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch patient", error);
    return NextResponse.json(
      { error: "Failed to fetch patient." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const patientId = parsePatientId(id);

  if (!patientId) {
    return NextResponse.json({ error: "Invalid patient id." }, { status: 400 });
  }

  try {
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
      `UPDATE patients
       SET patient_name = $1,
           dob = $2,
           email = $3,
           phone = $4
       WHERE patient_id = $5
       RETURNING patient_id, patient_name, email, phone, dob, last_visit`,
      [patientName, dob, email, phone, patientId],
    );

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ patient: result.rows[0] });
  } catch (error: unknown) {
    const pgError = error as {
      message?: string;
      code?: string;
      detail?: string;
      constraint?: string;
      column?: string;
      table?: string;
    };

    console.error("Failed to update patient", pgError);

    return NextResponse.json(
      {
        error: pgError.message ?? "Failed to update patient.",
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

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const patientId = parsePatientId(id);

  if (!patientId) {
    return NextResponse.json({ error: "Invalid patient id." }, { status: 400 });
  }

  try {
    const result = await getPool().query<Pick<PatientRow, "patient_id">>(
      `DELETE FROM patients
       WHERE patient_id = $1
       RETURNING patient_id`,
      [patientId],
    );

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      patient_id: result.rows[0].patient_id,
    });
  } catch (error: unknown) {
    const pgError = error as {
      message?: string;
      code?: string;
      detail?: string;
      constraint?: string;
      column?: string;
      table?: string;
    };

    console.error("Failed to delete patient", pgError);

    return NextResponse.json(
      {
        error: pgError.message ?? "Failed to delete patient.",
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
