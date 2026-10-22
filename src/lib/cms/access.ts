import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminSession } from "./auth";

export async function requireAdmin() {
  const session = await adminSession(await headers());
  if (!session) redirect("/admin/login");
  return session;
}
