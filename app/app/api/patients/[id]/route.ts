import { NextResponse } from "next/server";

import { getPool } from "@/lib/db";

type PatientRow = {
  patient_id: number;
  patient_name: string;
  email: string | null;
  phone: string | null;
  dob: string;
  last_visit: string | null;
};

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return NextResponse.json(
        { error: "Invalid patient ID." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as {
      patient_name?: string;
      email?: string;
      phone?: string;
      dob?: string;
      last_visit?: string;
    };

    const patientName = body.patient_name?.trim();
    const dob = body.dob?.trim();
    const email = body.email?.trim() || null;
    const phone = body.phone?.trim() || null;
    const lastVisit = body.last_visit?.trim() || null;

    if (!patientName || !dob) {
      return NextResponse.json(
        { error: "patient_name and dob are required." },
        { status: 400 },
      );
    }

    const result = await getPool().query<PatientRow>(
      `UPDATE patients
       SET patient_name = $1, dob = $2, email = $3, phone = $4, last_visit = $5
       WHERE patient_id = $6
       RETURNING patient_id, patient_name, email, phone, dob, last_visit`,
      [patientName, dob, email, phone, lastVisit, patientId],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ patient: result.rows[0] });
  } catch (error) {
    console.error("Failed to update patient", error);
    return NextResponse.json(
      { error: "Failed to update patient." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const patientId = parseInt(id, 10);

    if (isNaN(patientId)) {
      return NextResponse.json(
        { error: "Invalid patient ID." },
        { status: 400 },
      );
    }

    const result = await getPool().query(
      `DELETE FROM patients WHERE patient_id = $1`,
      [patientId],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Patient not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Patient deleted successfully." });
  } catch (error) {
    console.error("Failed to delete patient", error);
    return NextResponse.json(
      { error: "Failed to delete patient." },
      { status: 500 },
    );
  }
}
