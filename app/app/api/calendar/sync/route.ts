import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createGoogleCalendarEvent,
  isGoogleCalendarConnected,
  updateGoogleCalendarEvent,
} from "@/lib/google-calendar";
import { getPool } from "@/lib/db";

type AppointmentRow = {
  id: number;
  patient_name: string | null;
  title: string | null;
  datetime: Date;
  end_datetime: Date | null;
  notes: string | null;
  google_event_id: string | null;
};

export async function POST(request: Request) {
  try {
    // Sync is always performed for the current authenticated user only.
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!(await isGoogleCalendarConnected(userId))) {
      return NextResponse.json(
        { error: "Google Calendar is not connected." },
        { status: 400 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      appointmentId?: number;
    };

    const appointmentId =
      typeof body.appointmentId === "number" ? body.appointmentId : null;

    // When appointmentId is provided, sync just one row; otherwise sync all user rows.

    const result = await getPool().query<AppointmentRow>(
      `SELECT
         a.id,
         p.patient_name,
         a.title,
         a.datetime,
         a.end_datetime,
         a.notes,
         a.google_event_id
       FROM appointments a
       LEFT JOIN patients p ON p.patient_id = a.patient_id
       WHERE a.user_id = $1
         AND ($2::INTEGER IS NULL OR a.id = $2)
       ORDER BY a.datetime DESC`,
      [userId, appointmentId],
    );

    const synced: Array<{ id: number; google_event_id: string | null }> = [];

    for (const item of result.rows) {
      // Convert appointment range into ISO pieces expected by the Google service helper.
      const startDate = item.datetime.toISOString();
      const endDate = (
        item.end_datetime || new Date(item.datetime.getTime() + 30 * 60 * 1000)
      ).toISOString();

      let googleEventId = item.google_event_id;

      if (googleEventId) {
        try {
          // Update existing Google event when we already have an external ID.
          await updateGoogleCalendarEvent(userId, googleEventId, {
            title: item.title || "General Consultation",
            patientName: item.patient_name || undefined,
            date: startDate.slice(0, 10),
            startTime: startDate.slice(11, 19),
            endTime: endDate.slice(11, 19),
            notes: item.notes,
          });
        } catch {
          googleEventId = null;
        }
      }

      if (!googleEventId) {
        // Create the event when there is no mapping yet or update failed.
        const created = await createGoogleCalendarEvent(userId, {
          title: item.title || "General Consultation",
          patientName: item.patient_name || undefined,
          date: startDate.slice(0, 10),
          startTime: startDate.slice(11, 19),
          endTime: endDate.slice(11, 19),
          notes: item.notes,
        });

        googleEventId = created.id || null;
      }

      if (googleEventId && googleEventId !== item.google_event_id) {
        // Persist/repair event mapping after successful create or recovery.
        await getPool().query(
          `UPDATE appointments
           SET google_event_id = $1
           WHERE id = $2 AND user_id = $3`,
          [googleEventId, item.id, userId],
        );
      }

      synced.push({ id: item.id, google_event_id: googleEventId });
    }

    return NextResponse.json({ syncedCount: synced.length, synced });
  } catch (error) {
    console.error("Failed to sync Google Calendar", error);
    return NextResponse.json(
      { error: "Failed to sync Google Calendar." },
      { status: 500 },
    );
  }
}
