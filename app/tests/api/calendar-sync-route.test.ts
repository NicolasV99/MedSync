import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  queryMock: vi.fn(),
  isGoogleCalendarConnectedMock: vi.fn(),
  createGoogleCalendarEventMock: vi.fn(),
  updateGoogleCalendarEventMock: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.authMock }));
vi.mock("@/lib/db", () => ({ getPool: () => ({ query: mocks.queryMock }) }));
vi.mock("@/lib/google-calendar", () => ({
  isGoogleCalendarConnected: mocks.isGoogleCalendarConnectedMock,
  createGoogleCalendarEvent: mocks.createGoogleCalendarEventMock,
  updateGoogleCalendarEvent: mocks.updateGoogleCalendarEventMock,
}));

import { POST } from "@/app/api/calendar/sync/route";

describe("calendar sync route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authMock.mockResolvedValue({ user: { id: "7" } });
  });

  it("returns 400 when Google Calendar is disconnected", async () => {
    mocks.isGoogleCalendarConnectedMock.mockResolvedValueOnce(false);

    const response = await POST(
      new Request("http://localhost/api/calendar/sync", { method: "POST" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Google Calendar is not connected.",
    });
  });

  it("creates Google events and persists ids during sync", async () => {
    mocks.isGoogleCalendarConnectedMock.mockResolvedValueOnce(true);
    mocks.queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            id: 31,
            patient_name: "Maria",
            title: "General Consultation",
            datetime: new Date("2026-06-11T14:00:00.000Z"),
            end_datetime: new Date("2026-06-11T14:30:00.000Z"),
            notes: null,
            google_event_id: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1 });

    mocks.createGoogleCalendarEventMock.mockResolvedValueOnce({
      id: "g-new-31",
    });

    const response = await POST(
      new Request("http://localhost/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: 31 }),
      }),
    );

    const body = (await response.json()) as {
      syncedCount: number;
      synced: Array<{ id: number; google_event_id: string | null }>;
    };

    expect(response.status).toBe(200);
    expect(body.syncedCount).toBe(1);
    expect(body.synced[0]).toEqual({ id: 31, google_event_id: "g-new-31" });
    expect(mocks.createGoogleCalendarEventMock).toHaveBeenCalledTimes(1);
  });

  it("updates existing Google events when mapping exists", async () => {
    mocks.isGoogleCalendarConnectedMock.mockResolvedValueOnce(true);
    mocks.queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 32,
          patient_name: "John",
          title: "Follow-up",
          datetime: new Date("2026-06-11T15:00:00.000Z"),
          end_datetime: new Date("2026-06-11T15:30:00.000Z"),
          notes: "Bring docs",
          google_event_id: "existing-event-32",
        },
      ],
    });

    mocks.updateGoogleCalendarEventMock.mockResolvedValueOnce({});

    const response = await POST(
      new Request("http://localhost/api/calendar/sync", { method: "POST" }),
    );

    const body = (await response.json()) as {
      synced: Array<{ id: number; google_event_id: string | null }>;
    };

    expect(response.status).toBe(200);
    expect(mocks.updateGoogleCalendarEventMock).toHaveBeenCalledWith(
      7,
      "existing-event-32",
      expect.objectContaining({ title: "Follow-up" }),
    );
    expect(body.synced[0].google_event_id).toBe("existing-event-32");
  });
});
