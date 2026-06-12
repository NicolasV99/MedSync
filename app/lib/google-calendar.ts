import { google } from "googleapis";

import { getPool } from "@/lib/db";

// Read the Google OAuth credentials and fallback redirect URI from environment variables.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.client_id;
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || process.env.client_secret;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${NEXTAUTH_URL.replace(/\/$/, "")}/api/auth/callback/google`;

type GoogleCalendarTokenRow = {
  user_id: number;
  google_email: string;
  access_token: string;
  refresh_token: string | null;
  token_type: string | null;
  scope: string | null;
  expires_at: Date | null;
  calendar_id: string;
};

export type GoogleCalendarTokenInput = {
  userId: number;
  googleEmail: string;
  accessToken: string;
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  expiresAt?: number | null;
  calendarId?: string | null;
};

export type CalendarAppointmentInput = {
  title: string;
  patientName?: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
};

// Build the OAuth client configuration and fail fast if the app is missing Google credentials.
function getGoogleClientConfig() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET for Google Calendar integration.",
    );
  }

  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: GOOGLE_REDIRECT_URI,
  };
}

// Convert the numeric expiry value returned by Google into a Date for PostgreSQL.
function toDateOrNull(expiresAt?: number | null) {
  if (!expiresAt) {
    return null;
  }

  return new Date(expiresAt * 1000);
}

// Read the stored token row for a user so later calls can reuse the same Google connection.
async function getGoogleCalendarTokenRow(userId: number) {
  const result = await getPool().query<GoogleCalendarTokenRow>(
    `SELECT user_id, google_email, access_token, refresh_token, token_type, scope, expires_at, calendar_id
     FROM google_calendar_tokens
     WHERE user_id = $1
     LIMIT 1`,
    [userId],
  );

  return result.rows[0] ?? null;
}

async function persistOAuthCredentials(
  userId: number,
  tokenRow: GoogleCalendarTokenRow,
  credentials: {
    access_token?: string | null;
    refresh_token?: string | null;
    token_type?: string | null;
    scope?: string | null;
    expiry_date?: number | null;
  },
) {
  await saveGoogleCalendarTokens({
    userId,
    googleEmail: tokenRow.google_email,
    accessToken: credentials.access_token ?? tokenRow.access_token,
    refreshToken: credentials.refresh_token ?? tokenRow.refresh_token,
    tokenType: credentials.token_type ?? tokenRow.token_type,
    scope: credentials.scope ?? tokenRow.scope,
    expiresAt:
      credentials.expiry_date != null
        ? Math.floor(credentials.expiry_date / 1000)
        : tokenRow.expires_at
          ? Math.floor(tokenRow.expires_at.getTime() / 1000)
          : null,
    calendarId: tokenRow.calendar_id,
  });
}

async function ensureFreshAccessToken(
  userId: number,
  tokenRow: GoogleCalendarTokenRow,
  oauth2Client: InstanceType<typeof google.auth.OAuth2>,
) {
  const isExpired =
    !tokenRow.expires_at ||
    tokenRow.expires_at.getTime() <= Date.now() + 60_000;

  if (!tokenRow.refresh_token || !isExpired) {
    return;
  }

  const { credentials } = await oauth2Client.refreshAccessToken();

  oauth2Client.setCredentials({
    ...oauth2Client.credentials,
    ...credentials,
  });

  await persistOAuthCredentials(userId, tokenRow, credentials);
}

// Insert or update the OAuth token row whenever Google returns fresh credentials.
export async function saveGoogleCalendarTokens(
  input: GoogleCalendarTokenInput,
) {
  const result = await getPool().query<GoogleCalendarTokenRow>(
    `INSERT INTO google_calendar_tokens (
       user_id,
       google_email,
       access_token,
       refresh_token,
       token_type,
       scope,
       expires_at,
       calendar_id,
       updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'primary'), now())
     ON CONFLICT (user_id) DO UPDATE SET
       google_email = EXCLUDED.google_email,
       access_token = EXCLUDED.access_token,
       refresh_token = COALESCE(EXCLUDED.refresh_token, google_calendar_tokens.refresh_token),
       token_type = COALESCE(EXCLUDED.token_type, google_calendar_tokens.token_type),
       scope = COALESCE(EXCLUDED.scope, google_calendar_tokens.scope),
       expires_at = COALESCE(EXCLUDED.expires_at, google_calendar_tokens.expires_at),
       calendar_id = COALESCE(EXCLUDED.calendar_id, google_calendar_tokens.calendar_id),
       updated_at = now()
     RETURNING user_id, google_email, access_token, refresh_token, token_type, scope, expires_at, calendar_id`,
    [
      input.userId,
      input.googleEmail,
      input.accessToken,
      input.refreshToken ?? null,
      input.tokenType ?? null,
      input.scope ?? null,
      toDateOrNull(input.expiresAt),
      input.calendarId ?? "primary",
    ],
  );

  return result.rows[0];
}

// Check whether the current user already has a stored Google Calendar connection.
export async function isGoogleCalendarConnected(userId: number) {
  const row = await getGoogleCalendarTokenRow(userId);
  return Boolean(row);
}

// Remove the saved OAuth token row to disconnect Google Calendar for a user.
export async function disconnectGoogleCalendar(userId: number) {
  await getPool().query(
    `DELETE FROM google_calendar_tokens WHERE user_id = $1`,
    [userId],
  );
}

// Create an authenticated Google Calendar client from the saved token row.
export async function getGoogleCalendarClient(userId: number) {
  const tokenRow = await getGoogleCalendarTokenRow(userId);

  if (!tokenRow) {
    throw new Error("Google Calendar is not connected for this user.");
  }

  const { clientId, clientSecret, redirectUri } = getGoogleClientConfig();
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri,
  );

  oauth2Client.setCredentials({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token ?? undefined,
    token_type: tokenRow.token_type ?? undefined,
    scope: tokenRow.scope ?? undefined,
    expiry_date: tokenRow.expires_at
      ? tokenRow.expires_at.getTime()
      : undefined,
  });

  oauth2Client.on("tokens", (tokens) => {
    void persistOAuthCredentials(userId, tokenRow, tokens);
  });

  await ensureFreshAccessToken(userId, tokenRow, oauth2Client);

  return google.calendar({ version: "v3", auth: oauth2Client });
}

// Create a calendar event in Google using the appointment details from MedSync.
export async function createGoogleCalendarEvent(
  userId: number,
  appointment: CalendarAppointmentInput,
) {
  const calendar = await getGoogleCalendarClient(userId);
  const tokenRow = await getGoogleCalendarTokenRow(userId);

  const response = await calendar.events.insert({
    calendarId: tokenRow?.calendar_id || "primary",
    requestBody: {
      summary: appointment.patientName
        ? `${appointment.patientName} - ${appointment.title}`
        : appointment.title,
      description: appointment.notes ?? undefined,
      start: {
        dateTime: new Date(
          `${appointment.date}T${appointment.startTime}`,
        ).toISOString(),
      },
      end: {
        dateTime: new Date(
          `${appointment.date}T${appointment.endTime}`,
        ).toISOString(),
      },
    },
  });

  return response.data;
}

// Update an existing Google event so it stays in sync with the local appointment.
export async function updateGoogleCalendarEvent(
  userId: number,
  googleEventId: string,
  appointment: CalendarAppointmentInput,
) {
  const calendar = await getGoogleCalendarClient(userId);
  const tokenRow = await getGoogleCalendarTokenRow(userId);

  const response = await calendar.events.update({
    calendarId: tokenRow?.calendar_id || "primary",
    eventId: googleEventId,
    requestBody: {
      summary: appointment.patientName
        ? `${appointment.patientName} - ${appointment.title}`
        : appointment.title,
      description: appointment.notes ?? undefined,
      start: {
        dateTime: new Date(
          `${appointment.date}T${appointment.startTime}`,
        ).toISOString(),
      },
      end: {
        dateTime: new Date(
          `${appointment.date}T${appointment.endTime}`,
        ).toISOString(),
      },
    },
  });

  return response.data;
}

// Remove the matching Google event when the local appointment is deleted.
export async function deleteGoogleCalendarEvent(
  userId: number,
  googleEventId: string,
) {
  const calendar = await getGoogleCalendarClient(userId);
  const tokenRow = await getGoogleCalendarTokenRow(userId);

  await calendar.events.delete({
    calendarId: tokenRow?.calendar_id || "primary",
    eventId: googleEventId,
  });
}
