import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/cms/access";
import { getListing } from "@/lib/cms/repository";
import { uuidSchema } from "@/lib/cms/validation";
import ListingEditor from "@/components/cms/ListingEditor";
export default async function EditListing({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin(); const id = uuidSchema.safeParse((await params).id); if (!id.success) notFound();
  const listing = await getListing(id.data); if (!listing) notFound();
  return <ListingEditor initial={listing} />;
}
