import { requireAdmin } from "@/lib/cms/access";
import { getPipeline } from "@/lib/cms/development";
import DevelopmentEditor from "@/components/cms/DevelopmentEditor";

export default async function DevelopmentPage() {
  await requireAdmin();
  return <DevelopmentEditor initial={await getPipeline()} />;
}
