import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import { database } from "../src/lib/cms/db";

async function main() {
  loadEnvConfig(process.cwd());
  try {
    await database().query(await readFile("database/valuation.sql", "utf8"));
    console.log("Home valuation lead tables are ready.");
  } finally { await database().end(); }
}
main().catch(() => { console.error("Valuation setup failed. Check DATABASE_URL and database permissions."); process.exitCode = 1; });
