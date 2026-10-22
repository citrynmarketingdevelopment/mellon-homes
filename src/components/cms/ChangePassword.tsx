"use client";
import { useState, type FormEvent } from "react";
import styles from "@/app/admin/admin.module.css";

export default function ChangePassword() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(""); setMessage("");
    if (data.get("newPassword") !== data.get("confirmPassword")) { setError("The new passwords don’t match."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.get("currentPassword"), newPassword: data.get("newPassword"), revokeOtherSessions: true }),
      });
      if (!response.ok) throw new Error(response.status === 429 ? "Too many attempts. Please wait a minute." : "Unable to update your password. Check your current password, or sign in again.");
      form.reset(); setMessage("Password updated. Your other sessions have been signed out.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to connect. Try again."); }
    finally { setBusy(false); }
  }
  return <form className={styles.form} onSubmit={submit}>
    <label>Current password<input type="password" name="currentPassword" autoComplete="current-password" required maxLength={128} disabled={busy} /></label>
    <label>New password<input type="password" name="newPassword" autoComplete="new-password" required minLength={12} maxLength={128} disabled={busy} /></label>
    <label>Confirm new password<input type="password" name="confirmPassword" autoComplete="new-password" required minLength={12} maxLength={128} disabled={busy} /></label>
    <p className={styles.hint}>Use at least 12 characters and a password you don’t use elsewhere.</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {message && <p role="status" className={styles.success}>{message}</p>}
    <button className={styles.button} disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
  </form>;
}
