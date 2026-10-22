import { requireAdmin } from "@/lib/cms/access";
import ListingEditor from "@/components/cms/ListingEditor";
export default async function NewListing() { await requireAdmin(); return <ListingEditor />; }
