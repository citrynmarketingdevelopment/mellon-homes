import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { leadSchema, parseValuation, type ValuationLead } from "../src/lib/valuation/types";

// Only an isolated schema in the existing local test cluster is permitted.
async function main() {
const lines = (await readFile(".cms-test/test.env", "utf8")).trim().split(/\r?\n/);
const config = Object.fromEntries(lines.map(line => { const split = line.indexOf("="); return [line.slice(0, split), line.slice(split + 1)]; }));
const url = new URL(config.DATABASE_URL);
assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.port, "55438");
const schema = `valuation_test_${randomUUID().replaceAll("-", "")}`;
const setup = new Pool({ connectionString: url.toString() });
await setup.query(`CREATE SCHEMA "${schema}"`);
url.searchParams.set("options", `-c search_path=${schema}`);
process.env.DATABASE_URL = url.toString();
delete process.env.SMTP_HOST; delete process.env.RENTCAST_API_KEY;
const { database } = await import("../src/lib/cms/db");
const { submitValuation, LeadError } = await import("../src/lib/valuation/service");
const originalFetch = globalThis.fetch;
const base = (overrides: Partial<ValuationLead> = {}): ValuationLead => ({
  requestId: randomUUID(), name: "Valuation Test", address: "123 Test Street, Bakersfield, CA 93301",
  email: `${randomUUID()}@example.test`, phone: "6615550123", consent: true, ...overrides,
});
try {
  await database().query(await readFile("database/valuation.sql", "utf8"));
  const noLoan = base();
  assert.equal(parseValuation({ price: 500000 }, noLoan).equity, undefined);
  assert.equal(parseValuation({ price: 500000 }, base({ loanBalance: 0 })).equity, 500000);
  assert.equal(parseValuation({ price: 500000 }, base({ loanBalance: 550000 })).equity, -50000);
  assert.throws(() => parseValuation({ price: -1 }, noLoan));
  assert.equal(leadSchema.safeParse({ ...noLoan, consent: false }).success, false);
  assert.equal(leadSchema.safeParse({ ...noLoan, email: "bad" }).success, false);
  assert.equal(leadSchema.safeParse({ ...noLoan, loanBalance: -1 }).success, false);
  assert.equal(leadSchema.safeParse({ ...noLoan, phone: "not-a-phone" }).success, false);
  assert.equal(leadSchema.safeParse({ ...noLoan, website: "spam" }).success, false);
  assert.equal(leadSchema.safeParse({ ...noLoan, address: "Somewhere" }).success, false);

  let estimates = 0, emails = 0;
  const lead = base({ loanBalance: 250000 });
  const dependencies = {
    estimate: async (input: ValuationLead) => {
      const saved = await database().query("SELECT id FROM mellon_valuation_leads WHERE id = $1", [input.requestId]);
      assert.equal(saved.rowCount, 1, "Lead must be saved before the API call");
      estimates++;
      return { status: "estimate" as const, report: parseValuation({ price: 533438, subjectProperty: { bedrooms: 3, bathrooms: 2, squareFootage: 2541 } }, input) };
    },
    notify: async () => { emails++; return "sent" as const; },
  };
  const first = await submitValuation(lead, "test-ip", dependencies);
  assert.equal(first.status, "estimate");
  if (first.status === "estimate") assert.equal(first.report.equity, 283438);
  assert.deepEqual(await submitValuation(lead, "test-ip", dependencies), JSON.parse(JSON.stringify(first)));
  assert.equal(estimates, 1); assert.equal(emails, 1);
  await assert.rejects(submitValuation({ ...lead, name: "Changed" }, "test-ip", dependencies), error => error instanceof LeadError && error.status === 409);

  const failed = base();
  const fallback = await submitValuation(failed, "failure-ip", {
    estimate: async () => { throw new Error("Provider offline"); },
    notify: async () => { throw new Error("SMTP offline"); },
  });
  assert.deepEqual(fallback, { status: "requested" });
  const failureRow = await database().query("SELECT email_status, result FROM mellon_valuation_leads WHERE id = $1", [failed.requestId]);
  assert.equal(failureRow.rows[0].email_status, "failed");
  assert.deepEqual(failureRow.rows[0].result, { status: "requested" });

  const repeatedEmail = `${randomUUID()}@example.test`;
  for (let i = 0; i < 3; i++) await submitValuation(base({ email: repeatedEmail }), "rate-ip", dependencies);
  await assert.rejects(submitValuation(base({ email: repeatedEmail }), "rate-ip", dependencies), error => error instanceof LeadError && error.status === 429);
  const rateRows = await database().query("SELECT id FROM mellon_valuation_leads WHERE data->>'email' = $1", [repeatedEmail]);
  assert.equal(rateRows.rowCount, 3);

  let providerCalls = 0;
  process.env.RENTCAST_API_KEY = "local-test-only";
  process.env.VALUATION_MONTHLY_LIMIT = "1";
  globalThis.fetch = async (input, options) => {
    assert.equal(new URL(String(input)).hostname, "api.rentcast.io");
    assert.equal(new Headers(options?.headers).get("X-Api-Key"), "local-test-only");
    providerCalls++;
    return Response.json({ price: 425000, priceRangeLow: 400000, priceRangeHigh: 450000, subjectProperty: { formattedAddress: "123 Test Street, Bakersfield, CA 93301" } });
  };
  const quotaResults = await Promise.all([submitValuation(base(), "quota-ip-1"), submitValuation(base(), "quota-ip-2")]);
  assert.equal(providerCalls, 1);
  assert.equal(quotaResults.filter(result => result.status === "estimate").length, 1);
  assert.equal(quotaResults.filter(result => result.status === "requested").length, 1);
  console.log("PASS: validation, blank/zero/negative equity, durable lead capture, idempotency, provider/SMTP failures, shared rate limits, and concurrent monthly API cap.");
} finally {
  globalThis.fetch = originalFetch;
  await database().end();
  await setup.query(`DROP SCHEMA "${schema}" CASCADE`);
  await setup.end();
}
}
main().catch(error => { console.error("Valuation verification failed:", error instanceof Error ? error.message : "Unknown error"); process.exitCode = 1; });
