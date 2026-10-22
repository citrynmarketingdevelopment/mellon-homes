import { database } from "./db";
import type { Listing, ListingData } from "./validation";

type Row = { id: string; data: ListingData; revision: number; created_at: Date; updated_at: Date };
function listing(row: Row): Listing {
  return { ...row.data, id: row.id, revision: row.revision, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString() };
}
export async function getListings(publishedOnly = false, limit = 200) {
  const result = await database().query<Row>(`SELECT * FROM mellon_listings
    WHERE ($1::boolean = false OR data->>'status' = 'published')
    ORDER BY (data->>'featured')::boolean DESC, created_at DESC LIMIT $2`, [publishedOnly, limit]);
  return result.rows.map(listing);
}
export async function getListing(id: string, publishedOnly = false) {
  const result = await database().query<Row>(`SELECT * FROM mellon_listings WHERE id=$1
    AND ($2::boolean=false OR data->>'status'='published')`, [id, publishedOnly]);
  return result.rows[0] ? listing(result.rows[0]) : null;
}
export async function saveListing(id: string | null, data: ListingData, revision: number, userId: string) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    // Serialize saves so the revision check and photo ownership check are one transaction.
    const current = id ? (await client.query<Row>("SELECT * FROM mellon_listings WHERE id=$1 FOR UPDATE", [id])).rows[0] : null;
    if (id && (!current || current.revision !== revision)) throw new Error("CONFLICT");
    if (data.photos.length) {
      const photos = await client.query<{ id: string }>(`SELECT id FROM mellon_photos WHERE id=ANY($1::uuid[])
        AND (uploaded_by=$2 OR id=ANY($3::uuid[]))`, [data.photos, userId, current?.data.photos ?? []]);
      if (new Set(data.photos).size !== data.photos.length || photos.rowCount !== data.photos.length) throw new Error("PHOTOS");
    }
    const result = id
      ? await client.query<Row>("UPDATE mellon_listings SET data=$1, revision=revision+1, updated_at=now() WHERE id=$2 RETURNING *", [JSON.stringify(data), id])
      : await client.query<Row>("INSERT INTO mellon_listings(data) VALUES($1) RETURNING *", [JSON.stringify(data)]);
    await client.query("COMMIT");
    return listing(result.rows[0]);
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
export async function deleteListing(id: string, revision: number) {
  const result = await database().query("DELETE FROM mellon_listings WHERE id=$1 AND revision=$2 RETURNING id", [id, revision]);
  return result.rowCount === 1;
}
