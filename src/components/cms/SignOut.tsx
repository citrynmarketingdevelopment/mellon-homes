"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/admin/admin.module.css";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
export default function SignOut() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <div><button className={styles.signOut} disabled={busy} onClick={async () => {
    setBusy(true); setError("");
    try { const response = await fetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); if (!response.ok) throw new Error(); router.replace("/admin/login"); router.refresh(); }
    catch { setError("Could not sign out. Try again."); } finally { setBusy(false); }
  }}><SignOutIcon aria-hidden="true" />{busy ? "Signing out…" : "Sign out"}</button>{error && <p role="alert">{error}</p>}</div>;
}
