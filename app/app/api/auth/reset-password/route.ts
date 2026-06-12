import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { verifyResetToken } from "@/lib/password-reset";
import { getPool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
    };

    const token = body.token?.trim() || "";
    const password = body.password || "";

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 },
      );
    }

    const payload = verifyResetToken(token);

    if (!payload?.email) {
      return NextResponse.json(
        { error: "This reset link is invalid or expired." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    const result = await getPool().query(
      `UPDATE users
       SET password_hash = $1
       WHERE email = $2`,
      [passwordHash, payload.email],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Failed to reset password", error);
    return NextResponse.json(
      { error: "Unable to reset password right now." },
      { status: 500 },
    );
  }
}
