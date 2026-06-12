import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

function readEnvValue(content, key) {
  const line = content
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));

  if (!line) return null;
  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^"|"$/g, "");
}

async function run() {
  const root = process.cwd();
  const envPath = path.join(root, ".env.local");
  const migrationPath = path.join(
    root,
    "app",
    "data",
    "migrations",
    "appointments_calendar.sql",
  );

  const envContent = fs.readFileSync(envPath, "utf8");
  const connectionString =
    readEnvValue(envContent, "DATABASE_URL") ||
    readEnvValue(envContent, "POSTGRES_URL");

  if (!connectionString) {
    throw new Error("DATABASE_URL or POSTGRES_URL was not found in .env.local");
  }

  const sql = fs.readFileSync(migrationPath, "utf8");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log("Appointments migration applied successfully.");
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error("Failed to apply appointments migration", error);
  process.exit(1);
});
