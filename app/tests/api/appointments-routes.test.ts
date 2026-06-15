import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  queryMock: vi.fn(),
  createGoogleCalendarEventMock: vi.fn(),
  updateGoogleCalendarEventMock: vi.fn(),
  deleteGoogleCalendarEventMock: vi.fn(),
  isGoogleCalendarConnectedMock: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.authMock,
}));

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: mocks.queryMock }),
}));

vi.mock("@/lib/google-calendar", () => ({
  createGoogleCalendarEvent: mocks.createGoogleCalendarEventMock,
  updateGoogleCalendarEvent: mocks.updateGoogleCalendarEventMock,
  deleteGoogleCalendarEvent: mocks.deleteGoogleCalendarEventMock,
  isGoogleCalendarConnected: mocks.isGoogleCalendarConnectedMock,
}));

import { GET, POST } from "@/app/api/appointments/route";
import {
  DELETE as DELETE_BY_ID,
  PUT as PUT_BY_ID,
} from "@/app/api/appointments/[id]/route";

describe("appointments routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authMock.mockResolvedValue({ user: { id: "7" } });
    mocks.isGoogleCalendarConnectedMock.mockResolvedValue(false);
  });

  it("returns 401 for unauthenticated GET", async () => {
    mocks.authMock.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized." });
  });

  it("returns appointment list for authenticated GET", async () => {
    mocks.queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 11,
          patient_id: 4,
          patient_name: "Maria",
          user_id: 7,
          title: "General Consultation",
          datetime: new Date("2026-06-11T10:00:00.000Z"),
          end_datetime: new Date("2026-06-11T10:30:00.000Z"),
          status: "scheduled",
          notes: null,
          google_event_id: null,
          created_at: new Date("2026-06-11T09:00:00.000Z"),
        },
      ],
    });

    const response = await GET();
    const body = (await response.json()) as {
      appointments: Array<{ id: string }>;
    };

    expect(response.status).toBe(200);
    expect(body.appointments).toHaveLength(1);
    expect(body.appointments[0].id).toBe("11");
  });

  it("creates an appointment and stores google_event_id when Google sync succeeds", async () => {
    mocks.isGoogleCalendarConnectedMock.mockResolvedValueOnce(true);
    mocks.queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            id: 20,
            patient_id: 4,
            patient_name: null,
            user_id: 7,
            title: "Follow-up",
            datetime: new Date("2026-06-11T10:00:00.000Z"),
            end_datetime: new Date("2026-06-11T10:30:00.000Z"),
            status: "scheduled",
            notes: "Bring reports",
            google_event_id: null,
            created_at: new Date("2026-06-11T08:00:00.000Z"),
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1 });

    mocks.createGoogleCalendarEventMock.mockResolvedValueOnce({
      id: "g-event-1",
    });

    const request = new Request("http://localhost/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: 4,
        title: "Follow-up",
        start: "2026-06-11T10:00:00.000Z",
        end: "2026-06-11T10:30:00.000Z",
        status: "scheduled",
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      appointment: { google_event_id?: string };
    };

    expect(response.status).toBe(201);
    expect(mocks.createGoogleCalendarEventMock).toHaveBeenCalledTimes(1);
    expect(body.appointment.google_event_id).toBe("g-event-1");
  });

  it("rejects creating appointment with patient from another user", async () => {
    mocks.queryMock.mockResolvedValueOnce({ rows: [] });

    const request = new Request("http://localhost/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: 999,
        title: "Follow-up",
        start: "2026-06-11T10:00:00.000Z",
        end: "2026-06-11T10:30:00.000Z",
        status: "scheduled",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Selected patient does not belong to your account.",
    });
  });

  it("updates and deletes an appointment by id", async () => {
    mocks.queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            id: 21,
            patient_id: 5,
            patient_name: "John",
            user_id: 7,
            title: "Check-up",
            datetime: new Date("2026-06-11T12:00:00.000Z"),
            end_datetime: new Date("2026-06-11T12:30:00.000Z"),
            status: "scheduled",
            notes: null,
            google_event_id: "g-event-2",
            created_at: new Date("2026-06-11T08:30:00.000Z"),
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 21,
            patient_id: 5,
            patient_name: null,
            user_id: 7,
            title: "Check-up",
            datetime: new Date("2026-06-11T12:15:00.000Z"),
            end_datetime: new Date("2026-06-11T12:45:00.000Z"),
            status: "confirmed",
            notes: "Updated",
            google_event_id: "g-event-2",
            created_at: new Date("2026-06-11T08:30:00.000Z"),
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 21,
            patient_id: 5,
            patient_name: "John",
            user_id: 7,
            title: "Check-up",
            datetime: new Date("2026-06-11T12:15:00.000Z"),
            end_datetime: new Date("2026-06-11T12:45:00.000Z"),
            status: "confirmed",
            notes: "Updated",
            google_event_id: "g-event-2",
            created_at: new Date("2026-06-11T08:30:00.000Z"),
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1 });

    mocks.isGoogleCalendarConnectedMock.mockResolvedValue(true);
    mocks.updateGoogleCalendarEventMock.mockResolvedValue({});
    mocks.deleteGoogleCalendarEventMock.mockResolvedValue({});

    const putResponse = await PUT_BY_ID(
      new Request("http://localhost/api/appointments/21", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: "2026-06-11T12:15:00.000Z",
          end: "2026-06-11T12:45:00.000Z",
          status: "confirmed",
          notes: "Updated",
        }),
      }),
      { params: Promise.resolve({ id: "21" }) },
    );

    expect(putResponse.status).toBe(200);

    const deleteResponse = await DELETE_BY_ID(
      new Request("http://localhost/api/appointments/21", { method: "DELETE" }),
      { params: Promise.resolve({ id: "21" }) },
    );

    expect(deleteResponse.status).toBe(200);
    expect(mocks.deleteGoogleCalendarEventMock).toHaveBeenCalledWith(
      7,
      "g-event-2",
    );
  });
});
