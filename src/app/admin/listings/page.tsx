import { requireAdmin } from "@/lib/cms/access";
import { getListings } from "@/lib/cms/repository";
import ListingManager from "@/components/cms/ListingManager";

export default async function ListingsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireAdmin();
  const [listings, params] = await Promise.all([getListings(), searchParams]);
  return <ListingManager initial={listings} initialFilter={params.filter} />;
}
