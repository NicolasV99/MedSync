import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth";
import { getPool } from "@/lib/db";

type UserLoginRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  password_hash: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";

    if (!email || !password) {
      // Required fields validation.
      return NextResponse.json(
        { error: "email and password are required." },
        { status: 400 },
      );
    }

    const result = await getPool().query<UserLoginRow>(
      `SELECT id, first_name, last_name, email, role, password_hash
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    const user = result.rows[0];

    if (!user) {
      // Use a generic message to avoid revealing which field failed.
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const validPassword = await verifyPassword(password, user.password_hash);

    if (!validPassword) {
      // Reject when bcrypt comparison fails.
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Failed to log in", error);
    return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
  }
}
