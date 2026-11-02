import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { ShowingRequest } from "../src/lib/showings/types";

async function main() {
  const lines = (await readFile(".cms-test/test.env", "utf8")).trim().split(/\r?\n/);
  const config = Object.fromEntries(lines.map(line => { const split = line.indexOf("="); return [line.slice(0, split), line.slice(split + 1)]; }));
  const url = new URL(config.DATABASE_URL);
  assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.port, "55438");
  const schema = `showings_test_${randomUUID().replaceAll("-", "")}`;
  const setup = new Pool({ connectionString: url.toString() });
  await setup.query(`CREATE SCHEMA "${schema}"`);
  url.searchParams.set("options", `-c search_path=${schema}`);
  process.env.DATABASE_URL = url.toString();
  delete process.env.SMTP_API; delete process.env.SMTP_HOST;
  const { database } = await import("../src/lib/cms/db");
  const { submitShowing } = await import("../src/lib/showings/service");
  try {
    await database().query(await readFile("database/cms.sql", "utf8"));
    await database().query(await readFile("database/property-updates.sql", "utf8"));
    const listingId = randomUUID();
    await database().query("INSERT INTO mellon_listings (id,data) VALUES ($1,$2)", [listingId, JSON.stringify({ address: "123 Test St", city: "Bakersfield", state: "CA", zip: "93301", status: "published", availability: "For sale" })]);
    const base = (): ShowingRequest => ({ requestId: randomUUID(), listingId, name: "Test Visitor", email: `${randomUUID()}@example.test`, phone: "6615550100", date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), time: "14:00", consent: true, notes: "Please call first.", website: "" });
    const request = base();
    let calls = 0;
    const notify = async (data: ShowingRequest & { address: string }) => { calls++; assert.equal(data.address, "123 Test St, Bakersfield, CA 93301"); assert.equal(data.time, "14:00"); return "sent"; };
    await Promise.all([submitShowing(request, "test", notify), submitShowing(request, "test", notify)]);
    assert.equal(calls, 1);
    assert.equal((await database().query("SELECT email_status FROM mellon_showing_requests WHERE id=$1", [request.requestId])).rows[0].email_status, "sent");
    const failed = base();
    await submitShowing(failed, "test", async () => { throw new Error("Mail provider unavailable"); });
    assert.equal((await database().query("SELECT email_status FROM mellon_showing_requests WHERE id=$1", [failed.requestId])).rows[0].email_status, "failed");
    const unconfigured = base();
    await submitShowing(unconfigured, "test");
    assert.equal((await database().query("SELECT email_status FROM mellon_showing_requests WHERE id=$1", [unconfigured.requestId])).rows[0].email_status, "unconfigured");
    await assert.rejects(submitShowing({ ...base(), date: "2020-01-01" }, "test"), /future time/);
    await assert.rejects(submitShowing({ ...request, notes: "Changed" }, "test"), /new request/);
    assert.equal((await database().query("SELECT id FROM mellon_showing_requests")).rowCount, 3);
    console.log("Showing service verified: concurrent retries, delivery status, failure retention, missing SMTP, date validation, and conflict protection.");
  } finally {
    await database().end();
    await setup.query(`DROP SCHEMA "${schema}" CASCADE`);
    await setup.end();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
