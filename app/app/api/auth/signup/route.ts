import { NextResponse } from "next/server";

import { hashPassword, isStrongPassword } from "@/lib/auth";
import { getPool } from "@/lib/db";

type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

function splitFullName(fullName: string) {
  // Split a full name into first and last names for the current DB schema.
  const trimmed = fullName.trim();
  const [firstName, ...rest] = trimmed.split(/\s+/);
  const lastName = rest.join(" ");

  return {
    firstName: firstName || "",
    lastName: lastName || "-",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const fullName = body.fullName?.trim() || "";
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";
    const role = body.role?.trim() || "staff";

    if (!fullName || !email || !password) {
      // Required fields validation.
      return NextResponse.json(
        { error: "fullName, email, and password are required." },
        { status: 400 },
      );
    }

    if (!isStrongPassword(password)) {
      // Enforce strong password policy on the server, not just the UI.
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters and include an uppercase letter, a number, and a special character.",
        },
        { status: 400 },
      );
    }

    const { firstName, lastName } = splitFullName(fullName);
    // Store only the bcrypt hash, never the raw password.
    const passwordHash = await hashPassword(password);

    const result = await getPool().query<UserRow>(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, role`,
      [firstName, lastName, email, passwordHash, role],
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    const pgError = error as { code?: string; message?: string };

    if (pgError.code === "23505") {
      // PostgreSQL unique_violation for duplicate email.
      return NextResponse.json(
        { error: "Email already exists." },
        { status: 409 },
      );
    }

    console.error("Failed to sign up", pgError);
    return NextResponse.json({ error: "Failed to sign up." }, { status: 500 });
  }
}
