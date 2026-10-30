import { databaseConfigured } from "@/lib/cms/config";
import { leadSchema } from "@/lib/valuation/types";
import { LeadError, submitValuation } from "@/lib/valuation/service";

export const runtime = "nodejs";
export const maxDuration = 60;
const respond = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  // Next's internal URL can use localhost even when the browser uses 127.0.0.1.
  // Use the actual host, or a fixed public origin behind a reverse proxy.
  const url = new URL(request.url);
  const siteOrigin = process.env.VALUATION_SITE_ORIGIN || `${url.protocol}//${request.headers.get("host") || url.host}`;
  if (request.headers.get("origin") !== siteOrigin) return respond({ error: "Please submit your request from this website." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return respond({ error: "Invalid request format." }, 415);
  // Read a bounded stream, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return respond({ error: "Please complete the form." }, 400);
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytes += chunk.value.byteLength;
    if (bytes > 8_192) { await reader.cancel(); return respond({ error: "Request is too large." }, 413); }
    chunks.push(chunk.value);
  }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { return respond({ error: "Invalid request format." }, 400); }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return respond({ error: "Please check your name, full address with ZIP, email, phone, and contact consent." }, 400);
  if (!databaseConfigured()) return respond({ error: "We couldn’t save your request. Please try again later or contact Ian directly." }, 503);
  // Only trust an IP header explicitly configured for the deployment's trusted proxy.
  const ipHeader = process.env.VALUATION_TRUSTED_IP_HEADER;
  const ip = ipHeader ? request.headers.get(ipHeader)?.split(",")[0].trim().slice(0, 100) || "unknown" : "shared";
  try { return respond(await submitValuation(parsed.data, ip)); }
  catch (error) {
    if (error instanceof LeadError) return respond({ error: error.message }, error.status);
    console.error("Valuation request could not be completed.");
    return respond({ error: "We couldn’t complete your request. Please try again or contact Ian directly." }, 503);
  }
}
