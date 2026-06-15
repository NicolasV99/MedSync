import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createGoogleCalendarEvent,
  isGoogleCalendarConnected,
} from "@/lib/google-calendar";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

type AppointmentRow = {
  id: number;
  patient_id: number | null;
  patient_name: string | null;
  user_id: number;
  title: string | null;
  datetime: Date;
  end_datetime: Date | null;
  status: string;
  notes: string | null;
  google_event_id: string | null;
  created_at: Date;
};

function isValidDate(input: string) {
  // Accept only values that can be parsed into a valid JS Date.
  return !Number.isNaN(new Date(input).getTime());
}

function mapAppointment(row: AppointmentRow) {
  // Normalize DB shape to the frontend calendar contract.
  return {
    id: String(row.id),
    patient_id: row.patient_id,
    patient_name: row.patient_name || "Unknown Patient",
    title: row.title || "General Consultation",
    start: row.datetime.toISOString(),
    end: (
      row.end_datetime || new Date(row.datetime.getTime() + 30 * 60 * 1000)
    ).toISOString(),
    status: row.status,
    notes: row.notes,
    google_event_id: row.google_event_id,
    created_at: row.created_at.toISOString(),
  };
}

export async function GET() {
  try {
    // Scope data by authenticated user to avoid cross-account reads.
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const result = await getPool().query<AppointmentRow>(
      `SELECT
         a.id,
         a.patient_id,
         p.patient_name,
         a.user_id,
         a.title,
         a.datetime,
         a.end_datetime,
         a.status,
         a.notes,
         a.google_event_id,
         a.created_at
       FROM appointments a
       LEFT JOIN patients p ON p.patient_id = a.patient_id AND p.user_id = a.user_id
       WHERE a.user_id = $1
       ORDER BY a.datetime DESC`,
      [userId],
    );

    return NextResponse.json({ appointments: result.rows.map(mapAppointment) });
  } catch (error) {
    console.error("Failed to fetch appointments", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Require a signed-in user before creating appointments.
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as {
      patient_id?: number;
      title?: string;
      start?: string;
      end?: string;
      status?: "scheduled" | "confirmed" | "cancelled" | "completed";
      notes?: string;
      syncGoogle?: boolean;
    };

    const patientId = body.patient_id ?? null;
    const title = body.title?.trim() || "General Consultation";
    const start = body.start?.trim() || "";
    const end = body.end?.trim() || "";
    const status = body.status || "scheduled";
    const notes = body.notes?.trim() || null;

    // Validate input datetime values early before writing to DB.
    if (!start || !isValidDate(start)) {
      return NextResponse.json(
        { error: "A valid start datetime is required." },
        { status: 400 },
      );
    }

    if (end && !isValidDate(end)) {
      return NextResponse.json(
        { error: "End datetime is invalid." },
        { status: 400 },
      );
    }

    if (
      patientId !== null &&
      (!Number.isInteger(patientId) || patientId <= 0)
    ) {
      return NextResponse.json(
        { error: "patient_id is invalid." },
        { status: 400 },
      );
    }

    const result = await getPool().query<AppointmentRow>(
      `INSERT INTO appointments (
         patient_id,
         user_id,
         title,
         datetime,
         end_datetime,
         status,
         notes
       )
       SELECT
         CASE WHEN $1::INTEGER IS NULL THEN NULL ELSE p.patient_id END,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7
       FROM (SELECT 1) seed
       LEFT JOIN patients p
         ON p.patient_id = $1
        AND p.user_id = $2
       WHERE $1::INTEGER IS NULL OR p.patient_id IS NOT NULL
       RETURNING
         id,
         patient_id,
         (
           SELECT p.patient_name
           FROM patients p
           WHERE p.patient_id = appointments.patient_id
             AND p.user_id = appointments.user_id
         ) AS patient_name,
         user_id,
         title,
         datetime,
         end_datetime,
         status,
         notes,
         google_event_id,
         created_at`,
      [
        patientId,
        userId,
        title,
        new Date(start),
        end ? new Date(end) : null,
        status,
        notes,
      ],
    );

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Selected patient does not belong to your account." },
        { status: 400 },
      );
    }

    const appointment = result.rows[0];
    let calendarSyncWarning: string | null = null;

    // If Google is connected, mirror the newly created appointment in Calendar.
    if (
      body.syncGoogle !== false &&
      (await isGoogleCalendarConnected(userId))
    ) {
      try {
        const startDate = appointment.datetime.toISOString();
        const endDate = (
          appointment.end_datetime ||
          new Date(appointment.datetime.getTime() + 30 * 60 * 1000)
        ).toISOString();

        const googleEvent = await createGoogleCalendarEvent(userId, {
          title: appointment.title || "General Consultation",
          date: startDate.slice(0, 10),
          startTime: startDate.slice(11, 19),
          endTime: endDate.slice(11, 19),
          notes: appointment.notes,
        });

        if (googleEvent.id) {
          // Persist external event ID so later updates/deletes target the same event.
          await getPool().query(
            `UPDATE appointments
             SET google_event_id = $1
             WHERE id = $2 AND user_id = $3`,
            [googleEvent.id, appointment.id, userId],
          );
          appointment.google_event_id = googleEvent.id;
        }
      } catch (error) {
        console.warn("Google Calendar sync skipped for new appointment", error);
        calendarSyncWarning =
          "Appointment created, but Google Calendar could not be synced.";
      }
    }

    return NextResponse.json(
      { appointment: mapAppointment(appointment), calendarSyncWarning },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create appointment", error);
    return NextResponse.json(
      { error: "Failed to create appointment." },
      { status: 500 },
    );
  }
}
