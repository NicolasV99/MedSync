import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  queryMock: vi.fn(),
  hashPasswordMock: vi.fn(),
  verifyPasswordMock: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.authMock,
}));

vi.mock("@/lib/db", () => ({
  getPool: () => ({ query: mocks.queryMock }),
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: mocks.hashPasswordMock,
  verifyPassword: mocks.verifyPasswordMock,
  isStrongPassword: (password: string) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password),
}));

import { DELETE, GET, PUT } from "@/app/api/account/route";

describe("account route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authMock.mockResolvedValue({ user: { id: "7" } });
    mocks.verifyPasswordMock.mockResolvedValue(true);
    mocks.hashPasswordMock.mockResolvedValue("hashed-password");
  });

  it("returns the current account for authenticated users", async () => {
    mocks.queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 7,
          first_name: "Nefi",
          last_name: "Zaldana",
          email: "nefi@example.com",
          role: "doctor",
          password_hash: "hash",
        },
      ],
    });

    const response = await GET();
    const body = (await response.json()) as {
      user?: { email?: string };
    };

    expect(response.status).toBe(200);
    expect(body.user?.email).toBe("nefi@example.com");
  });

  it("updates the account name without requiring a password", async () => {
    mocks.queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            id: 7,
            first_name: "Nefi",
            last_name: "Zaldana",
            email: "nefi@example.com",
            role: "doctor",
            password_hash: "hash",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 7,
            first_name: "Nicolas",
            last_name: "Velasquez",
            email: "nefi@example.com",
            role: "doctor",
            password_hash: "hash",
          },
        ],
      });

    const response = await PUT(
      new Request("http://localhost/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Nicolas Velasquez",
        }),
      }),
    );

    const body = (await response.json()) as {
      user?: { email?: string };
    };

    expect(response.status).toBe(200);
    expect(mocks.verifyPasswordMock).not.toHaveBeenCalled();
    expect(body.user?.email).toBe("nefi@example.com");
  });

  it("rejects password updates when confirmation does not match", async () => {
    mocks.queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 7,
          first_name: "Nefi",
          last_name: "Zaldana",
          email: "nefi@example.com",
          role: "doctor",
          password_hash: "hash",
        },
      ],
    });

    const response = await PUT(
      new Request("http://localhost/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Nefi Zaldana",
          currentPassword: "Current123!",
          newPassword: "NewPass123!",
          confirmNewPassword: "Mismatch123!",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "New passwords do not match.",
    });
  });

  it("deletes account for an authenticated user", async () => {
    mocks.queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            id: 7,
            first_name: "Nefi",
            last_name: "Zaldana",
            email: "nefi@example.com",
            role: "doctor",
            password_hash: "hash",
          },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 });

    const response = await DELETE();

    expect(response.status).toBe(200);
    expect(mocks.verifyPasswordMock).not.toHaveBeenCalled();
    expect(mocks.queryMock).toHaveBeenNthCalledWith(2, "BEGIN");
    expect(mocks.queryMock).toHaveBeenNthCalledWith(
      3,
      `DELETE FROM appointments WHERE user_id = $1`,
      [7],
    );
    expect(mocks.queryMock).toHaveBeenNthCalledWith(
      4,
      `DELETE FROM google_calendar_tokens WHERE user_id = $1`,
      [7],
    );
    expect(mocks.queryMock).toHaveBeenNthCalledWith(
      5,
      `DELETE FROM users WHERE id = $1`,
      [7],
    );
    expect(mocks.queryMock).toHaveBeenNthCalledWith(6, "COMMIT");
  });

  it("rejects deletion for unauthenticated users", async () => {
    mocks.authMock.mockResolvedValueOnce(null);

    const response = await DELETE();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized.",
    });
  });
});
