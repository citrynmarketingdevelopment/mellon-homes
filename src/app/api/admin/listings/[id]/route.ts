import { authorize, failure, HttpError, readJson } from "@/lib/cms/http";
import { deleteListing, getListing, saveListing, updateListingFlags } from "@/lib/cms/repository";
import { listingSchema, uuidSchema } from "@/lib/cms/validation";
import { z } from "zod";

const editSchema = z.object({ revision: z.number().int().positive(), listing: listingSchema });
const flagsSchema = z.object({ revision: z.number().int().positive(), changes: z.object({
  featured: z.boolean().optional(), status: z.enum(["draft", "published"]).optional(), availability: z.enum(["For sale", "Pending", "Sold"]).optional(),
}).strict().refine(value => Object.keys(value).length > 0) }).strict();
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await authorize(request, true);
    const id = uuidSchema.safeParse((await context.params).id);
    const parsed = flagsSchema.safeParse(await readJson(request));
    if (!id.success || !parsed.success) throw new HttpError(400, "Choose a valid listing status or featured setting.");
    const current = await getListing(id.data);
    if (!current || current.revision !== parsed.data.revision) throw new Error("CONFLICT");
    if (parsed.data.changes.status === "published" && !current.photos.length) throw new HttpError(400, "Add at least one photo in the editor before publishing.");
    return Response.json(await updateListingFlags(id.data, parsed.data.revision, parsed.data.changes));
  } catch (error) { return failure(error); }
}
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await authorize(request, true);
    const id = uuidSchema.safeParse((await context.params).id);
    const parsed = editSchema.safeParse(await readJson(request));
    if (!id.success || !parsed.success) throw new HttpError(400, parsed.success ? "Invalid listing ID." : parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(" "));
    return Response.json(await saveListing(id.data, parsed.data.listing, parsed.data.revision, session.user.id));
  } catch (error) { return failure(error); }
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await authorize(request, true);
    const id = uuidSchema.safeParse((await context.params).id);
    const parsed = z.object({ revision: z.number().int().positive() }).safeParse(await readJson(request));
    if (!id.success || !parsed.success) throw new HttpError(400, "Invalid listing.");
    if (!await deleteListing(id.data, parsed.data.revision)) throw new Error("CONFLICT");
    return new Response(null, { status: 204 });
  } catch (error) { return failure(error); }
}
