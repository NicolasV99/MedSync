import { Pool } from "pg";

const globalForPg = globalThis as unknown as {
  pool?: Pool;
};

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  );
}

export function getPool() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error(
      "Database URL is missing. Set DATABASE_URL or POSTGRES_URL in app/.env.local",
    );
  }

  if (!globalForPg.pool) {
    globalForPg.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  return globalForPg.pool;
}
