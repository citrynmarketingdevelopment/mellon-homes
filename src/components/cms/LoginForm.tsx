"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/admin/admin.module.css";

export default function LoginForm({ enabled }: { enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/sign-in/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), rememberMe: false }) });
      if (!response.ok) throw new Error(response.status === 429 ? "Too many attempts. Please wait a minute and try again." : "Unable to sign in. Check your email and password, or contact the site administrator.");
      const access = await fetch("/api/admin/listings");
      if (!access.ok) { await fetch("/api/auth/sign-out", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); throw new Error("This account does not have admin access."); }
      router.replace("/admin"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to connect. Try again."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className={styles.form}>
    <label>Email<input name="email" type="email" autoComplete="username" required disabled={!enabled || busy} /></label>
    <label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={128} disabled={!enabled || busy} /></label>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <button className={styles.button} disabled={!enabled || busy}>{busy ? "Signing in…" : "Sign in"}</button>
    <p className={styles.hint}>Admin access only. Accounts are created by the site administrator.</p>
  </form>;
}
