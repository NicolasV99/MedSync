import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  queryMock: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.authMock,
}));

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: mocks.queryMock }),
}));

import {
  GET as GET_PATIENTS,
  POST as POST_PATIENTS,
} from "@/app/api/patients/route";
import {
  DELETE as DELETE_PATIENT_BY_ID,
  GET as GET_PATIENT_BY_ID,
  PUT as PUT_PATIENT_BY_ID,
} from "@/app/api/patients/[id]/route";

describe("patients routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authMock.mockResolvedValue({ user: { id: "7" } });
  });

  it("returns 401 for unauthenticated list request", async () => {
    mocks.authMock.mockResolvedValueOnce(null);

    const response = await GET_PATIENTS();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized." });
  });

  it("lists only current user patients", async () => {
    mocks.queryMock.mockResolvedValueOnce({
      rows: [
        {
          patient_id: 12,
          patient_name: "Maria",
          email: "maria@example.com",
          phone: "+1-555-0101",
          dob: "1988-04-12",
          last_visit: "2026-06-10",
        },
      ],
    });

    const response = await GET_PATIENTS();
    const body = (await response.json()) as {
      patients: Array<{ patient_id: number }>;
    };

    expect(response.status).toBe(200);
    expect(mocks.queryMock).toHaveBeenCalledWith(
      expect.stringContaining("WHERE user_id = $1"),
      [7],
    );
    expect(body.patients).toHaveLength(1);
    expect(body.patients[0].patient_id).toBe(12);
  });

  it("creates a patient tied to the current user", async () => {
    mocks.queryMock.mockResolvedValueOnce({
      rows: [
        {
          patient_id: 22,
          patient_name: "John",
          email: "john@example.com",
          phone: "+1-555-0102",
          dob: "1991-02-11",
          last_visit: null,
        },
      ],
    });

    const response = await POST_PATIENTS(
      new Request("http://localhost/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: "John",
          dob: "1991-02-11",
          email: "john@example.com",
          phone: "+1-555-0102",
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.queryMock).toHaveBeenCalledWith(
      expect.stringContaining("user_id"),
      ["John", "1991-02-11", "john@example.com", "+1-555-0102", 7],
    );
  });

  it("scopes patient by id routes to owner user", async () => {
    mocks.queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            patient_id: 33,
            patient_name: "Owner Patient",
            email: null,
            phone: null,
            dob: "1980-09-09",
            last_visit: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            patient_id: 33,
            patient_name: "Owner Patient Updated",
            email: null,
            phone: null,
            dob: "1980-09-09",
            last_visit: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ patient_id: 33 }] });

    const getResponse = await GET_PATIENT_BY_ID(
      new Request("http://localhost/api/patients/33"),
      { params: Promise.resolve({ id: "33" }) },
    );

    const putResponse = await PUT_PATIENT_BY_ID(
      new Request("http://localhost/api/patients/33", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: "Owner Patient Updated",
          dob: "1980-09-09",
          email: "",
          phone: "",
        }),
      }),
      { params: Promise.resolve({ id: "33" }) },
    );

    const deleteResponse = await DELETE_PATIENT_BY_ID(
      new Request("http://localhost/api/patients/33", { method: "DELETE" }),
      { params: Promise.resolve({ id: "33" }) },
    );

    expect(getResponse.status).toBe(200);
    expect(putResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);

    expect(mocks.queryMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("WHERE patient_id = $1 AND user_id = $2"),
      [33, 7],
    );
    expect(mocks.queryMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("WHERE patient_id = $5 AND user_id = $6"),
      ["Owner Patient Updated", "1980-09-09", null, null, 33, 7],
    );
    expect(mocks.queryMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("WHERE patient_id = $1 AND user_id = $2"),
      [33, 7],
    );
  });
});
