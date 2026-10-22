import { authorize, failure, HttpError, readJson } from "@/lib/cms/http";
import { getListings, saveListing } from "@/lib/cms/repository";
import { listingSchema } from "@/lib/cms/validation";

export async function GET(request: Request) {
  try { await authorize(request); return Response.json(await getListings(), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const session = await authorize(request, true);
    const parsed = listingSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(" "));
    return Response.json(await saveListing(null, parsed.data, 0, session.user.id), { status: 201 });
  } catch (error) { return failure(error); }
}
