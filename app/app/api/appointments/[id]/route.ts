import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  isGoogleCalendarConnected,
  updateGoogleCalendarEvent,
} from "@/lib/google-calendar";
import { getPool } from "@/lib/db";

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

type RouteContext = { params: Promise<{ id: string }> };

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

async function getAppointment(userId: number, appointmentId: number) {
  // Load only the appointment that belongs to the current signed-in user.
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
     LEFT JOIN patients p ON p.patient_id = a.patient_id
     WHERE a.id = $1 AND a.user_id = $2
     LIMIT 1`,
    [appointmentId, userId],
  );

  return result.rows[0] ?? null;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    // Require auth and constrain writes to the owner user.
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const appointmentId = parseInt(id, 10);

    if (Number.isNaN(appointmentId)) {
      return NextResponse.json(
        { error: "Invalid appointment ID." },
        { status: 400 },
      );
    }

    const current = await getAppointment(userId, appointmentId);

    if (!current) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 },
      );
    }

    // Merge partial payload with existing values so PUT can behave like edit/update.
    const body = (await request.json()) as {
      patient_id?: number;
      title?: string;
      start?: string;
      end?: string;
      status?: "scheduled" | "confirmed" | "cancelled" | "completed";
      notes?: string;
      syncGoogle?: boolean;
    };

    const title = body.title?.trim() || current.title || "General Consultation";
    const start = body.start?.trim() || current.datetime.toISOString();
    const end =
      body.end?.trim() ||
      (
        current.end_datetime ||
        new Date(current.datetime.getTime() + 30 * 60 * 1000)
      ).toISOString();
    const status = body.status || (current.status as AppointmentRow["status"]);
    const notes = body.notes?.trim() ?? current.notes;
    const patientId = body.patient_id ?? current.patient_id;

    if (!isValidDate(start) || !isValidDate(end)) {
      return NextResponse.json(
        { error: "Invalid appointment datetime." },
        { status: 400 },
      );
    }

    const result = await getPool().query<AppointmentRow>(
      `UPDATE appointments
       SET patient_id = $1,
           title = $2,
           datetime = $3,
           end_datetime = $4,
           status = $5,
           notes = $6
       WHERE id = $7 AND user_id = $8
       RETURNING
         id,
         patient_id,
         (
           SELECT p.patient_name
           FROM patients p
           WHERE p.patient_id = appointments.patient_id
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
        title,
        new Date(start),
        new Date(end),
        status,
        notes,
        appointmentId,
        userId,
      ],
    );

    const updated = result.rows[0];
    let calendarSyncWarning: string | null = null;

    // Keep Google Calendar in sync when integration is enabled.
    if (
      body.syncGoogle !== false &&
      (await isGoogleCalendarConnected(userId))
    ) {
      const startDate = updated.datetime.toISOString();
      const endDate = (
        updated.end_datetime ||
        new Date(updated.datetime.getTime() + 30 * 60 * 1000)
      ).toISOString();

      let eventId = updated.google_event_id;

      if (eventId) {
        try {
          // Try updating the existing Google event first.
          await updateGoogleCalendarEvent(userId, eventId, {
            title: updated.title || "General Consultation",
            patientName: current.patient_name || undefined,
            date: startDate.slice(0, 10),
            startTime: startDate.slice(11, 19),
            endTime: endDate.slice(11, 19),
            notes: updated.notes,
          });
        } catch {
          eventId = null;
        }
      }

      if (!eventId) {
        // Re-create the event when the old ID is missing or no longer valid.
        try {
          const created = await createGoogleCalendarEvent(userId, {
            title: updated.title || "General Consultation",
            patientName: current.patient_name || undefined,
            date: startDate.slice(0, 10),
            startTime: startDate.slice(11, 19),
            endTime: endDate.slice(11, 19),
            notes: updated.notes,
          });

          if (created.id) {
            await getPool().query(
              `UPDATE appointments
               SET google_event_id = $1
               WHERE id = $2 AND user_id = $3`,
              [created.id, appointmentId, userId],
            );
            updated.google_event_id = created.id;
          }
        } catch (error) {
          console.warn(
            "Google Calendar sync skipped for updated appointment",
            error,
          );
          calendarSyncWarning =
            "Appointment updated, but Google Calendar could not be synced.";
        }
      }
    }

    return NextResponse.json({
      appointment: mapAppointment(updated),
      calendarSyncWarning,
    });
  } catch (error) {
    console.error("Failed to update appointment", error);
    return NextResponse.json(
      { error: "Failed to update appointment." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    // Require auth and constrain deletes to the owner user.
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const appointmentId = parseInt(id, 10);

    if (Number.isNaN(appointmentId)) {
      return NextResponse.json(
        { error: "Invalid appointment ID." },
        { status: 400 },
      );
    }

    const current = await getAppointment(userId, appointmentId);

    if (!current) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 },
      );
    }

    if (current.google_event_id && (await isGoogleCalendarConnected(userId))) {
      try {
        // Best-effort delete in Google Calendar; local delete continues even if this fails.
        await deleteGoogleCalendarEvent(userId, current.google_event_id);
      } catch (error) {
        console.warn("Google event could not be deleted", error);
      }
    }

    await getPool().query(
      `DELETE FROM appointments
       WHERE id = $1 AND user_id = $2`,
      [appointmentId, userId],
    );

    return NextResponse.json({ message: "Appointment deleted successfully." });
  } catch (error) {
    console.error("Failed to delete appointment", error);
    return NextResponse.json(
      { error: "Failed to delete appointment." },
      { status: 500 },
    );
  }
}
