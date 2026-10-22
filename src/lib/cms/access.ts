import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminSession } from "./auth";
import { cache } from "react";

export const currentAdmin = cache(async () => adminSession(await headers()));

export async function requireAdmin() {
  const session = await currentAdmin();
  if (!session) redirect("/admin/login");
  return session;
}
