import { z } from "zod";

export const listingSchema = z.object({
  title: z.string().trim().min(3).max(120),
  address: z.string().trim().min(3).max(180),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().regex(/^[A-Z]{2}$/, "Use a two-letter state code."),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code."),
  price: z.number().int().min(1).max(1_000_000_000),
  beds: z.number().int().min(0).max(100),
  baths: z.number().min(0).max(100).multipleOf(.5),
  sqft: z.number().int().min(1).max(10_000_000),
  propertyType: z.enum(["House", "Condo", "Townhome", "Multifamily", "Land", "Commercial"]),
  description: z.string().trim().min(10).max(8000),
  status: z.enum(["draft", "published"]),
  availability: z.enum(["For sale", "Pending", "Sold"]),
  featured: z.boolean(),
  photos: z.array(z.uuid()).max(12),
}).strict().refine(data => data.status !== "published" || data.photos.length > 0, {
  message: "Add at least one photo before publishing.", path: ["photos"],
});
export type ListingData = z.infer<typeof listingSchema>;
export type Listing = ListingData & { id: string; revision: number; createdAt: string; updatedAt: string };
export const uuidSchema = z.uuid();
