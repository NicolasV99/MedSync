import { NextResponse } from "next/server";

import { getPool } from "@/lib/db";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query<{ now: string }>(
      "SELECT NOW()::text AS now",
    );

    return NextResponse.json({
      ok: true,
      now: result.rows[0]?.now ?? null,
      env: {
        DATABASE_URL: Boolean(process.env.DATABASE_URL),
        POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
        POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
      },
    });
  } catch (error) {
    console.error("DB health check failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown DB error",
        env: {
          DATABASE_URL: Boolean(process.env.DATABASE_URL),
          POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
          POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
        },
      },
      { status: 500 },
    );
  }
}
