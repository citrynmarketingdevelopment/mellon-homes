import { Pool } from "pg";
import { databaseConfigured } from "./config";

const globalDb = globalThis as unknown as { cmsPool?: Pool };
export function database() {
  if (!databaseConfigured()) throw new Error("CMS database is not configured.");
  return globalDb.cmsPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });
}
