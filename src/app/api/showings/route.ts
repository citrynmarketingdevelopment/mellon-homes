import { databaseConfigured } from "@/lib/cms/config";
import { HttpError, limitedBody } from "@/lib/cms/http";
import { showingSchema } from "@/lib/showings/types";
import { submitShowing } from "@/lib/showings/service";

export const runtime = "nodejs";
export const maxDuration = 60;
const respond = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = process.env.VALUATION_SITE_ORIGIN || `${url.protocol}//${request.headers.get("host") || url.host}`;
    if (request.headers.get("origin") !== origin) throw new HttpError(403, "Please submit this request from the website.");
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Invalid request format.");
    let body: unknown;
    try { body = JSON.parse((await limitedBody(request, 8192)).toString("utf8")); }
    catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "Invalid request format."); }
    const parsed = showingSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "Check your contact details, preferred date and time, and contact consent.");
    if (!databaseConfigured()) throw new HttpError(503, "Requests are temporarily unavailable. Please contact Ian directly.");
    const ipHeader = process.env.VALUATION_TRUSTED_IP_HEADER;
    const ip = ipHeader ? request.headers.get(ipHeader)?.split(",")[0].trim().slice(0, 100) || "unknown" : "shared";
    return respond(await submitShowing(parsed.data, ip));
  } catch (error) {
    if (error instanceof HttpError) return respond({ error: error.message }, error.status);
    console.error("Showing request could not be completed.");
    return respond({ error: "We couldn’t save your request. Please try again or contact Ian directly." }, 503);
  }
}
