import sharp from "sharp";
import { authorize, failure, HttpError, limitedBody } from "@/lib/cms/http";
import { database } from "@/lib/cms/db";

export async function POST(request: Request) {
  try {
    const session = await authorize(request, true);
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.startsWith("multipart/form-data")) throw new HttpError(400, "Choose an image to upload.");
    const bytes = await limitedBody(request, 3 * 1024 * 1024);
    const form = await new Response(bytes, { headers: { "Content-Type": contentType } }).formData();
    const file = form.get("photo");
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024)
      throw new HttpError(400, "Choose a JPG, PNG, or WebP image under 2 MB.");
    const source = Buffer.from(await file.arrayBuffer());
    const jpeg = source[0] === 0xff && source[1] === 0xd8 && source[2] === 0xff;
    const png = source.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const webp = source.toString("ascii", 0, 4) === "RIFF" && source.toString("ascii", 8, 12) === "WEBP";
    if (!jpeg && !png && !webp) throw new HttpError(400, "This file is not a supported image.");
    let optimized: Buffer;
    try { optimized = await sharp(source, { limitInputPixels: 24_000_000 }).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(); }
    catch { throw new HttpError(400, "This image could not be read. Try another photo."); }
    if (optimized.length > 2 * 1024 * 1024) throw new HttpError(400, "Try a smaller photo.");
    const count = await database().query("SELECT count(*)::int AS count FROM mellon_photos WHERE uploaded_by=$1 AND created_at > now()-interval '1 hour'", [session.user.id]);
    if (count.rows[0].count >= 100) throw new HttpError(429, "Upload limit reached. Please try again in an hour.");
    const result = await database().query("INSERT INTO mellon_photos(bytes,uploaded_by) VALUES($1,$2) RETURNING id", [optimized, session.user.id]);
    return Response.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) { return failure(error); }
}
