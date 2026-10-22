import type { Metadata } from "next";
import AdminShell from "@/components/cms/AdminShell";
import { currentAdmin } from "@/lib/cms/access";

export const metadata: Metadata = { title: "Mellon | Listing manager", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await currentAdmin();
  return <AdminShell user={session ? { name: session.user.name, email: session.user.email } : null}>{children}</AdminShell>;
}
