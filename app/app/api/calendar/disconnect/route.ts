import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { disconnectGoogleCalendar } from "@/lib/google-calendar";

export async function POST() {
  try {
    // Remove stored OAuth tokens for the current user to disable calendar sync.
    const session = await auth();
    const userId = Number(session?.user?.id || 0);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await disconnectGoogleCalendar(userId);

    return NextResponse.json({ message: "Google Calendar disconnected." });
  } catch (error) {
    console.error("Failed to disconnect Google Calendar", error);
    return NextResponse.json(
      { error: "Failed to disconnect Google Calendar." },
      { status: 500 },
    );
  }
}
