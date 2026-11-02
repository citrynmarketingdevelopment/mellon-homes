import "server-only";
import { createHash } from "node:crypto";
import { database } from "@/lib/cms/db";
import { HttpError } from "@/lib/cms/http";
import { getSpecialty } from "@/lib/specialties";
import { sendNotification, normalizeDelivery } from "@/lib/mail/delivery";
import { contactConsent, type ContactRequest } from "./types";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export async function submitContact(data: ContactRequest, ip: string, notify = sendNotification) {
  const fingerprint = digest(JSON.stringify(data));
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [`contact:${data.requestId}`]);
    const existing = await client.query("SELECT fingerprint FROM mellon_contact_requests WHERE id=$1", [data.requestId]);
    if (existing.rows[0]) {
      if (existing.rows[0].fingerprint !== fingerprint) throw new HttpError(409, "Start a new request to change these details.");
      await client.query("COMMIT"); return { status: "received" as const };
    }
    const hour = new Date().toISOString().slice(0, 13);
    for (const [key, limit] of [[`contact:email:${digest(data.email)}:${hour}`, 3], [`contact:ip:${digest(ip)}:${hour}`, 10]] as const) {
      const counter = await client.query(`INSERT INTO mellon_showing_usage (key, expires_at) VALUES ($1, now() + interval '2 hours')
        ON CONFLICT (key) DO UPDATE SET count=mellon_showing_usage.count+1 WHERE mellon_showing_usage.count < $2 RETURNING count`, [key, limit]);
      if (!counter.rowCount) throw new HttpError(429, "Too many requests. Please try again in an hour or call Ian directly.");
    }
    await client.query("INSERT INTO mellon_contact_requests (id, fingerprint, data) VALUES ($1,$2,$3)", [data.requestId, fingerprint, JSON.stringify({ ...data, consentText: contactConsent })]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
  const topic = getSpecialty(data.specialty)!.label;
  let delivery = normalizeDelivery("failed");
  try { delivery = await notify({ kind: "inquiry", name: data.name, email: data.email, topic, details: [
    ["Name", data.name], ["Email", data.email], ["Phone", data.phone], ["Specialty", topic], ["Property", data.address || "Not provided"],
    ["Message", data.message], ["Consent", contactConsent], ["Reference", data.requestId],
  ] }); } catch { /* Saved before email delivery. */ }
  await database().query("UPDATE mellon_contact_requests SET email_status=$2, confirmation_status=$3 WHERE id=$1", [data.requestId, delivery.broker, delivery.customer]);
  await database().query("DELETE FROM mellon_showing_usage WHERE expires_at < now()");
  return { status: "received" as const };
}
