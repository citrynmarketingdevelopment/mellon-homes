import { loadEnvConfig } from "@next/env";
import { database } from "../src/lib/cms/db";
async function main() {
  loadEnvConfig(process.cwd());
  const result = await database().query(`DELETE FROM mellon_photos p WHERE created_at < now()-interval '24 hours'
    AND NOT EXISTS (SELECT 1 FROM mellon_listings l WHERE l.data->'photos' ? p.id::text)`);
  console.log(`Removed ${result.rowCount} unreferenced photos older than 24 hours.`);
  await database().end();
}
main().catch(() => { console.error("Photo cleanup failed. Check the database connection."); process.exit(1); });
