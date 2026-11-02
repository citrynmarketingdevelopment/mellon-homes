import { databaseConfigured } from "@/lib/cms/config";
import { HttpError, limitedBody } from "@/lib/cms/http";
import { contactSchema } from "@/lib/contact/types";
import { submitContact } from "@/lib/contact/service";

export const runtime = "nodejs";
export const maxDuration = 60;
const respond = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = process.env.VALUATION_SITE_ORIGIN || `${url.protocol}//${request.headers.get("host") || url.host}`;
    if (request.headers.get("origin") !== origin) throw new HttpError(403, "Please submit your inquiry from this website.");
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Invalid request format.");
    let body: unknown;
    try { body = JSON.parse((await limitedBody(request, 12000)).toString("utf8")); }
    catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "Invalid request format."); }
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "Check your contact details, message, and contact consent.");
    if (!databaseConfigured()) throw new HttpError(503, "We couldn’t save your inquiry. Please call or email Ian directly.");
    const ipHeader = process.env.VALUATION_TRUSTED_IP_HEADER;
    const ip = ipHeader ? request.headers.get(ipHeader)?.split(",")[0].trim().slice(0,100) || "unknown" : "shared";
    return respond(await submitContact(parsed.data, ip));
  } catch (error) {
    if (error instanceof HttpError) return respond({ error: error.message }, error.status);
    console.error("Specialty inquiry could not be completed.");
    return respond({ error: "We couldn’t save your inquiry. Please try again or contact Ian directly." }, 503);
  }
}
