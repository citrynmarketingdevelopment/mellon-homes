import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { specialties } from "@/lib/specialties";
import { databaseConfigured } from "@/lib/cms/config";
import { database } from "@/lib/cms/db";
import { ian } from "@/lib/ian";

// Reflect publication changes immediately and never expose drafts.
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/listings"), changeFrequency: "daily", priority: .9 },
    { url: absoluteUrl(ian.path), changeFrequency: "monthly", priority: .8, images: [absoluteUrl(ian.portrait)] },
    ...specialties.map(item => ({ url: absoluteUrl(`/${item.slug}`), changeFrequency: "monthly" as const, priority: .8, images: [absoluteUrl(`/images/specialties/${item.image}.webp`)] })),
  ];
  if (databaseConfigured()) {
    // Do not silently cache a partial sitemap if the database is temporarily unavailable.
    const { rows } = await database().query<{ id: string; updated_at: Date }>("SELECT id, updated_at FROM mellon_listings WHERE data->>'status'='published' ORDER BY id LIMIT 49000");
    entries.push(...rows.map(item => ({ url: absoluteUrl(`/listings/${item.id}`), lastModified: item.updated_at, changeFrequency: "weekly" as const, priority: .7 })));
  }
  return entries;
}
