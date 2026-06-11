import { NextResponse } from "next/server";

import { createResetToken } from "@/lib/password-reset";
import { sendResetEmail } from "@/lib/mailer";
import { getPool } from "@/lib/db";

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    (process.env.SMTP_FROM || process.env.SMTP_USER),
  );
}

type UserLookupRow = {
  email: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() || "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const result = await getPool().query<UserLookupRow>(
      `SELECT email
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email],
    );

    const user = result.rows[0];

    // Always return a generic success message to avoid account enumeration.
    if (user) {
      const token = createResetToken(user.email);
      const baseUrl =
        process.env.NEXTAUTH_URL ||
        process.env.APP_URL ||
        "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

      await sendResetEmail(user.email, resetUrl);
    }

    return NextResponse.json({
      message:
        "If the email exists in our system, password reset instructions will be sent shortly.",
      emailDeliveryConfigured: hasSmtpConfig(),
    });
  } catch (error) {
    console.error("Failed to send password reset email", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes("SMTP")
            ? "Password recovery email could not be sent because SMTP is not configured correctly."
            : "Unable to process the request right now.",
      },
      { status: 500 },
    );
  }
}
