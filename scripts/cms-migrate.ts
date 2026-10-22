import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import { getMigrations } from "better-auth/db/migration";
import { makeAuth } from "../src/lib/cms/auth";
import { database } from "../src/lib/cms/db";

async function main() {
  loadEnvConfig(process.cwd());
  const instance = makeAuth();
  const migration = await getMigrations(instance.options);
  await migration.runMigrations();
  await database().query(await readFile("database/cms.sql", "utf8"));
  console.log("CMS tables are ready.");
  await database().end();
}
main().catch(() => { console.error("CMS setup failed. Check DATABASE_URL, authentication settings, and database permissions."); process.exit(1); });
