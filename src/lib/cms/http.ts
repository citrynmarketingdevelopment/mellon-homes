import { adminSession } from "./auth";
import { cmsConfigured } from "./config";

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function authorize(request: Request, write = false) {
  if (!cmsConfigured()) throw new HttpError(503, "The CMS has not been connected yet.");
  if (write && request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL!).origin)
    throw new HttpError(403, "This request is not allowed.");
  const session = await adminSession(request.headers);
  if (!session) throw new HttpError(401, "Please sign in as an administrator.");
  return session;
}
export async function limitedBody(request: Request, max: number) {
  if (Number(request.headers.get("content-length")) > max) throw new HttpError(413, "The upload is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "A request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > max) { await reader.cancel(); throw new HttpError(413, "The upload is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
export async function readJson(request: Request) {
  try { return JSON.parse((await limitedBody(request, 32_000)).toString()); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "Invalid request."); }
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof Error && error.message === "CONFLICT") return Response.json({ error: "This listing changed in another session. Reload before saving again." }, { status: 409 });
  if (error instanceof Error && error.message === "PHOTOS") return Response.json({ error: "One or more photos are unavailable. Remove them and upload again." }, { status: 400 });
  console.error("CMS operation failed", error instanceof Error ? error.name : "Unknown error");
  return Response.json({ error: "We couldn’t complete that request. Check the database connection and try again." }, { status: 503 });
}
