import "server-only";
import { createHash } from "node:crypto";
import { sendNotification, normalizeDelivery, type NotificationResult } from "@/lib/mail/delivery";
import { database } from "@/lib/cms/db";
import { HttpError } from "@/lib/cms/http";
import { pacificNow, showingConsent, showingDateRange, type SavedShowing, type ShowingRequest } from "./types";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
async function notifyBroker(data: SavedShowing): Promise<NotificationResult> {
  return sendNotification({ kind: "showing", name: data.name, email: data.email, details: [
    ["Property", data.address], ["Preferred showing", `${data.date} at ${data.time} (Pacific time)`],
    ["Appointment", "Needs confirmation"], ["Name", data.name], ["Email", data.email], ["Phone", data.phone],
    ["Notes", data.notes || "None"], ["Consent", showingConsent], ["Reference", data.requestId],
  ] });
}

export async function submitShowing(data: ShowingRequest, ip: string, notify = notifyBroker) {
  const fingerprint = digest(JSON.stringify(data));
  const client = await database().connect();
  let saved: SavedShowing;
  try {
    await client.query("BEGIN");
    // Serialize duplicate submissions across processes before checking or sending mail.
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [data.requestId]);
    const existing = await client.query("SELECT fingerprint FROM mellon_showing_requests WHERE id=$1", [data.requestId]);
    if (existing.rows[0]) {
      if (existing.rows[0].fingerprint !== fingerprint) throw new HttpError(409, "Start a new request to change these details.");
      await client.query("COMMIT"); return { status: "requested" as const };
    }
    const now = pacificNow();
    if (`${data.date}T${data.time}` <= now || data.date > showingDateRange().maxDate)
      throw new HttpError(400, "Choose a future time within the next 180 days (Pacific time).");
    const listing = await client.query("SELECT data FROM mellon_listings WHERE id=$1 AND data->>'status'='published' AND data->>'availability' != 'Sold' FOR SHARE", [data.listingId]);
    if (!listing.rows[0]) throw new HttpError(404, "This property is no longer available for showing requests.");
    const item = listing.rows[0].data;
    saved = { ...data, address: `${item.address}, ${item.city}, ${item.state} ${item.zip}`, consentText: showingConsent };
    const hour = new Date().toISOString().slice(0, 13);
    for (const [key, limit] of [[`email:${digest(data.email)}:${hour}`, 3], [`ip:${digest(ip)}:${hour}`, 10]] as const) {
      const counter = await client.query(`INSERT INTO mellon_showing_usage (key, expires_at) VALUES ($1, now() + interval '2 hours')
        ON CONFLICT (key) DO UPDATE SET count=mellon_showing_usage.count+1 WHERE mellon_showing_usage.count < $2 RETURNING count`, [key, limit]);
      if (!counter.rowCount) throw new HttpError(429, "Too many requests. Please try again in an hour or contact Ian directly.");
    }
    await client.query("INSERT INTO mellon_showing_requests (id, fingerprint, data) VALUES ($1, $2, $3)", [data.requestId, fingerprint, JSON.stringify(saved)]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
  // Requests remain in the private inbox even if the email provider is unavailable.
  let delivery = normalizeDelivery("failed");
  try { delivery = normalizeDelivery(await notify(saved)); } catch { /* Retain the request for follow-up. */ }
  await database().query("UPDATE mellon_showing_requests SET email_status=$2, confirmation_status=$3 WHERE id=$1", [data.requestId, delivery.broker, delivery.customer]);
  await database().query("DELETE FROM mellon_showing_usage WHERE expires_at < now()");
  return { status: "requested" as const };
}
