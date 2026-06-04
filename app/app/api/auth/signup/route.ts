import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

import { getPool } from "@/lib/db";

// Promisified scrypt for async/await password hashing.
const scrypt = promisify(scryptCallback);

type SignUpBody = {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
};

type UserRow = {
  id: number;
};

// Creates a salted hash in a storable format: scrypt$salt$hash.
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

// Quick uniqueness check to provide a friendly 409 response before insert.
async function emailExists(email: string) {
  const result = await getPool().query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1 LIMIT 1",
    [email],
  );

  return result.rows.length > 0;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignUpBody;

    // Normalize user-provided fields before server-side validation.
    const firstName = body.first_name?.trim();
    const lastName = body.last_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    // Required fields validation.
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "first_name, last_name, email and password are required." },
        { status: 400 },
      );
    }

    // Minimum password policy.
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    // Avoid duplicate accounts by email.
    if (await emailExists(email)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    // New users are created with default staff role.
    await getPool().query<UserRow>(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [firstName, lastName, email, passwordHash, "staff"],
    );

    return NextResponse.json(
      { message: "Account created successfully." },
      { status: 201 },
    );
  } catch (error: unknown) {
    const pgError = error as {
      code?: string;
      message?: string;
    };

    // Safety net for race conditions if duplicate email is inserted concurrently.
    if (pgError.code === "23505") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Return a clear setup hint when the users table is missing.
    if (pgError.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "Users table not found. Run app/app/data/users.sql in your database.",
        },
        { status: 500 },
      );
    }

    console.error("Failed to sign up user", pgError);
    return NextResponse.json(
      { error: "Could not create account." },
      { status: 500 },
    );
  }
}
