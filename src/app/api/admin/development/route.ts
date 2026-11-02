import { authorize, failure, HttpError, readJson } from "@/lib/cms/http";
import { pipelineSchema } from "@/lib/cms/development-data";
import { savePipeline } from "@/lib/cms/development";

export async function PUT(request: Request) {
  try {
    await authorize(request, true);
    const parsed = pipelineSchema.safeParse(await readJson(request, 1_000_000));
    if (!parsed.success) throw new HttpError(400, "Check each project's address, city, property type, and description (up to 2,000 characters). Use up to 100 projects.");
    const saved = await savePipeline(parsed.data);
    if (!saved) throw new HttpError(409, "The pipeline changed in another session. Reload before saving again.");
    return Response.json(saved);
  } catch (error) { return failure(error); }
}
