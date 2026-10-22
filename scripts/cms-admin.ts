import { loadEnvConfig } from "@next/env";
import { makeAuth } from "../src/lib/cms/auth";
import { adminEmails } from "../src/lib/cms/config";
import { database } from "../src/lib/cms/db";

async function main() {
  loadEnvConfig(process.cwd());
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "";
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim();
  if (!email || !adminEmails().includes(email) || !name || password.length < 12 || password.length > 128)
    throw new Error("Set an allowed admin email, name, and a password of 12–128 characters.");
  const existing = await database().query('SELECT id FROM "user" WHERE lower(email)=$1', [email]);
  if (existing.rowCount) { console.log("This account already exists; its password was not changed."); await database().end(); return; }
  // Registration is enabled only in this local CLI process, never on the website.
  await makeAuth(true).api.signUpEmail({ body: { email, password, name } });
  console.log("Admin account created. Clear ADMIN_BOOTSTRAP_PASSWORD from the environment.");
  await database().end();
}
main().catch(() => { console.error("Admin creation failed. Check the bootstrap fields and allowlist; an existing account will not be overwritten."); process.exit(1); });
