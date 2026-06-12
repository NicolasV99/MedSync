import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isGoogleCalendarConnected } from "@/lib/google-calendar";

export async function GET() {
  try {
    // Return connection state for the authenticated user's Google Calendar link.
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const connected = await isGoogleCalendarConnected(userId);

    return NextResponse.json({ connected });
  } catch (error) {
    console.error("Failed to get Google Calendar status", error);
    return NextResponse.json(
      { error: "Failed to get Google Calendar status." },
      { status: 500 },
    );
  }
}
