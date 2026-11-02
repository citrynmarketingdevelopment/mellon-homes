import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import { database } from "../src/lib/cms/db";

async function main() {
  loadEnvConfig(process.cwd());
  try {
    await database().query(await readFile("database/property-updates.sql", "utf8"));
    console.log("Development content and showing-request tables are ready. Existing listings are unchanged.");
  } finally { await database().end(); }
}
main().catch(() => { console.error("Property update migration failed. Check the database connection and permissions."); process.exitCode = 1; });
