import { adminSession } from "@/lib/cms/auth";
import { database } from "@/lib/cms/db";
import { databaseConfigured } from "@/lib/cms/config";
import { uuidSchema } from "@/lib/cms/validation";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = uuidSchema.safeParse((await context.params).id);
  if (!id.success || !databaseConfigured()) return new Response(null, { status: 404 });
  try {
    const published = await database().query("SELECT id FROM mellon_listings WHERE data->>'status'='published' AND data->'photos' ? $1 LIMIT 1", [id.data]);
    if (!published.rowCount && !await adminSession(request.headers)) return new Response(null, { status: 404 });
    const photo = await database().query("SELECT bytes FROM mellon_photos WHERE id=$1", [id.data]);
    if (!photo.rowCount) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(photo.rows[0].bytes), { headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 503 }); }
}
