import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

import { getPool } from "@/lib/db";

const scrypt = promisify(scryptCallback);

type LoginBody = {
  email?: string;
  password?: string;
};

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
};

async function verifyScryptPassword(password: string, storedHash: string) {
  const [algorithm, salt, hashHex] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !hashHex) {
    return false;
  }

  const storedBuffer = Buffer.from(hashHex, "hex");
  const computedBuffer = (await scrypt(
    password,
    salt,
    storedBuffer.length,
  )) as Buffer;

  if (computedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedBuffer, storedBuffer);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required." },
        { status: 400 },
      );
    }

    const result = await getPool().query<UserRow>(
      `SELECT id, email, password_hash, first_name, last_name
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const passwordMatches = await verifyScryptPassword(
      password,
      user.password_hash,
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const response = NextResponse.json(
      {
        message: "Signed in successfully.",
        user: {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
        },
      },
      { status: 200 },
    );

    // Temporary session cookie for dashboard access flow.
    response.cookies.set("medsync_session", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error: unknown) {
    const pgError = error as {
      code?: string;
      message?: string;
    };

    if (pgError.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "Users table not found. Run app/app/data/users.sql in your database.",
        },
        { status: 500 },
      );
    }

    console.error("Failed to sign in user", pgError);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
