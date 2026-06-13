import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hashPassword, isStrongPassword, verifyPassword } from "@/lib/auth";
import { getPool } from "@/lib/db";

type AccountRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  password_hash: string;
};

function splitFullName(fullName: string) {
  const trimmed = fullName.trim();
  const [firstName, ...rest] = trimmed.split(/\s+/);
  const lastName = rest.join(" ");

  return {
    firstName: firstName || "",
    lastName: lastName || "",
  };
}

async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);

  if (Number.isNaN(userId)) {
    return null;
  }

  const result = await getPool().query<AccountRow>(
    `SELECT id, first_name, last_name, email, role, password_hash
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId],
  );

  return result.rows[0] ?? null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: String(user.id),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Failed to load account", error);
    return NextResponse.json(
      { error: "Failed to load account." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as {
      fullName?: string;
      currentPassword?: string;
      newPassword?: string;
      confirmNewPassword?: string;
    };

    const fullName = body.fullName?.trim() || "";
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";
    const confirmNewPassword = body.confirmNewPassword || "";

    // Account settings intentionally allow only name/password updates; email stays immutable.

    if (!fullName) {
      return NextResponse.json(
        { error: "fullName is required." },
        { status: 400 },
      );
    }

    const { firstName, lastName } = splitFullName(fullName);

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Please enter both a first and last name." },
        { status: 400 },
      );
    }

    const passwordChanged = Boolean(newPassword);

    if (passwordChanged) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change your password." },
          { status: 400 },
        );
      }

      const isCurrentPasswordValid = await verifyPassword(
        currentPassword,
        currentUser.password_hash,
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 401 },
        );
      }
    }

    if (passwordChanged) {
      if (newPassword !== confirmNewPassword) {
        return NextResponse.json(
          { error: "New passwords do not match." },
          { status: 400 },
        );
      }

      if (!isStrongPassword(newPassword)) {
        return NextResponse.json(
          {
            error:
              "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.",
          },
          { status: 400 },
        );
      }
    }

    const nextPasswordHash = passwordChanged
      ? await hashPassword(newPassword)
      : currentUser.password_hash;

    // Keep email untouched to avoid account identity drift across auth/session flows.
    const result = await getPool().query<AccountRow>(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           password_hash = $3
       WHERE id = $4
       RETURNING id, first_name, last_name, email, role, password_hash`,
      [firstName, lastName, nextPasswordHash, currentUser.id],
    );

    return NextResponse.json({
      user: {
        id: String(result.rows[0].id),
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
    });
  } catch (error: unknown) {
    const pgError = error as { code?: string; message?: string };

    if (pgError.code === "23505") {
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 },
      );
    }

    console.error("Failed to update account", pgError);
    return NextResponse.json(
      { error: "Failed to update account." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    // Reuse the current authenticated user context for authorization and ownership.
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Execute all deletes in one DB transaction so partial cleanup cannot happen.
    await getPool().query("BEGIN");

    // Delete dependent data first, then remove the user account.
    await getPool().query(`DELETE FROM appointments WHERE user_id = $1`, [
      currentUser.id,
    ]);
    await getPool().query(
      `DELETE FROM google_calendar_tokens WHERE user_id = $1`,
      [currentUser.id],
    );
    await getPool().query(`DELETE FROM users WHERE id = $1`, [currentUser.id]);

    // Persist all deletions only after every statement succeeds.
    await getPool().query("COMMIT");

    return NextResponse.json({
      message: "Account deleted permanently.",
    });
  } catch (error) {
    try {
      // Best effort rollback when any step in the transaction fails.
      await getPool().query("ROLLBACK");
    } catch {
      // Ignore rollback errors and return the original failure.
    }

    console.error("Failed to delete account", error);
    return NextResponse.json(
      { error: "Failed to delete account." },
      { status: 500 },
    );
  }
}
