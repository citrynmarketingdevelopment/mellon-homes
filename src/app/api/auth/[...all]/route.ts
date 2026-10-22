import { auth } from "@/lib/cms/auth";
import { cmsConfigured } from "@/lib/cms/config";
import { authorize, failure, HttpError } from "@/lib/cms/http";

async function handle(request: Request) {
  try {
    if (!cmsConfigured()) throw new HttpError(503, "The CMS has not been connected yet.");
    const endpoint = new URL(request.url).pathname.replace("/api/auth/", "");
    if (!["sign-in/email", "sign-out", "get-session", "change-password"].includes(endpoint)) throw new HttpError(404, "Not found.");
    if (endpoint === "change-password") await authorize(request, true);
    return await auth().handler(request);
  } catch (error) { return failure(error); }
}
export const GET = handle;
export const POST = handle;
