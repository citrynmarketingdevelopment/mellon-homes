import "server-only";
import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { database } from "@/lib/cms/db";
import { consentText, parseValuation, type ValuationLead, type ValuationResponse } from "./types";

export class LeadError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const digest = (text: string) => createHash("sha256").update(text).digest("hex");

async function reserveBudget() {
  const configured = Number(process.env.VALUATION_MONTHLY_LIMIT ?? 50);
  const limit = Number.isInteger(configured) && configured >= 0 ? configured : 50;
  const month = new Date().toISOString().slice(0, 7);
  const result = await database().query(
    `INSERT INTO mellon_valuation_usage (key, count, expires_at)
     SELECT $1, 1, now() + interval '35 days' WHERE $2::integer > 0
     ON CONFLICT (key) DO UPDATE SET count = mellon_valuation_usage.count + 1
     WHERE mellon_valuation_usage.count < $2 RETURNING count`, [`rentcast:${month}`, limit]);
  return result.rowCount === 1;
}

async function getEstimate(lead: ValuationLead): Promise<ValuationResponse> {
  if (!process.env.RENTCAST_API_KEY || !(await reserveBudget())) return { status: "requested" };
  try {
    const url = new URL("https://api.rentcast.io/v1/avm/value");
    url.searchParams.set("address", lead.address);
    url.searchParams.set("compCount", "5");
    url.searchParams.set("lookupSubjectAttributes", "true");
    const response = await fetch(url, {
      headers: { "X-Api-Key": process.env.RENTCAST_API_KEY, Accept: "application/json" },
      cache: "no-store", signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return { status: "requested" };
    return { status: "estimate", report: parseValuation(await response.json(), lead) };
  } catch { return { status: "requested" }; }
}

async function notifyBroker(lead: ValuationLead, result: ValuationResponse) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM, LEAD_EMAIL_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !LEAD_EMAIL_TO) return "unconfigured";
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST, port, secure: port === 465, requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8_000, greetingTimeout: 8_000, socketTimeout: 12_000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  try {
    const report = result.status === "estimate" ? result.report : undefined;
    const message = await transport.sendMail({
      from: SMTP_FROM, to: LEAD_EMAIL_TO, replyTo: lead.email,
      subject: "Mellon: new home valuation request",
      text: [
        `Name: ${lead.name}`, `Property: ${lead.address}`, `Email: ${lead.email}`, `Phone: ${lead.phone}`,
        `Homeowner-provided total loan balance: ${lead.loanBalance === undefined ? "Not provided" : `$${lead.loanBalance.toLocaleString("en-US")}`}`,
        report ? `Estimated value: $${report.value.toLocaleString("en-US")} (RentCast AVM)` : "Personal review requested; automated estimate unavailable.",
        report?.equity === undefined ? "Equity: not calculated" : `Estimated equity: $${report.equity.toLocaleString("en-US")}`,
        `Contact consent: ${consentText}`, `Request reference: ${lead.requestId}`,
      ].join("\n"),
    });
    return message.accepted.length > 0 && message.rejected.length === 0 ? "sent" : "failed";
  } catch { return "failed"; }
  finally { transport.close(); }
}

// Tests can supply local provider/mail doubles; production always uses the defaults.
export async function submitValuation(lead: ValuationLead, ip: string, dependencies = { estimate: getEstimate, notify: notifyBroker }) {
  const fingerprint = digest(JSON.stringify(lead));
  const connection = await database().connect();
  try {
    await connection.query("BEGIN");
    const inserted = await connection.query(
      "INSERT INTO mellon_valuation_leads (id, fingerprint, data) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id",
      [lead.requestId, fingerprint, JSON.stringify({ ...lead, consentText })]);
    if (!inserted.rowCount) {
      const existing = await connection.query("SELECT fingerprint, result FROM mellon_valuation_leads WHERE id = $1", [lead.requestId]);
      await connection.query("ROLLBACK");
      if (existing.rows[0]?.fingerprint !== fingerprint) throw new LeadError(409, "Please start a new request.");
      if (!existing.rows[0]?.result) throw new LeadError(409, "Your request is still processing. Please try again shortly.");
      return existing.rows[0].result as ValuationResponse;
    }
    // Shared database counters work across app instances, unlike in-memory rate limits.
    const hour = new Date().toISOString().slice(0, 13);
    for (const [key, maximum] of [[`email:${digest(lead.email)}:${hour}`, 3], [`ip:${digest(ip)}:${hour}`, 10]] as const) {
      const counter = await connection.query(
        `INSERT INTO mellon_valuation_usage (key, expires_at) VALUES ($1, now() + interval '2 hours')
         ON CONFLICT (key) DO UPDATE SET count = mellon_valuation_usage.count + 1
         WHERE mellon_valuation_usage.count < $2 RETURNING count`, [key, maximum]);
      if (!counter.rowCount) throw new LeadError(429, "You’ve reached the request limit. Please try again in an hour or contact Ian directly.");
    }
    await connection.query("COMMIT");
  } catch (error) { await connection.query("ROLLBACK"); throw error; }
  finally { connection.release(); }

  // The lead is durable before any paid lookup or email attempt begins.
  let result: ValuationResponse = { status: "requested" };
  try { result = await dependencies.estimate(lead); } catch { /* Keep the saved lead for personal follow-up. */ }
  await database().query("UPDATE mellon_valuation_leads SET result = $2 WHERE id = $1", [lead.requestId, JSON.stringify(result)]);
  let emailStatus = "failed";
  try { emailStatus = await dependencies.notify(lead, result); } catch { /* The private inbox retains this request. */ }
  await database().query("UPDATE mellon_valuation_leads SET email_status = $2 WHERE id = $1", [lead.requestId, emailStatus]);
  await database().query("DELETE FROM mellon_valuation_usage WHERE expires_at < now()");
  return result;
}
