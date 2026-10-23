"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/ssr/Envelope";
import { LockKeyIcon } from "@phosphor-icons/react/dist/ssr/LockKey";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr/CircleNotch";
import styles from "@/app/admin/admin.module.css";

export default function LoginForm({ enabled }: { enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  return <form onSubmit={submit} className={`${styles.form} ${styles.loginForm}`} aria-busy={busy}>
    <div className={styles.loginField}>
      <label htmlFor="login-email">Email</label>
      <div className={styles.loginInput}>
        <EnvelopeIcon aria-hidden="true" />
        <input id="login-email" name="email" type="email" autoComplete="username" placeholder="you@example.com" required disabled={!enabled || busy} />
      </div>
    </div>
    <div className={styles.loginField}>
      <label htmlFor="login-password">Password</label>
      <div className={styles.loginInput}>
        <LockKeyIcon aria-hidden="true" />
        <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required maxLength={128} disabled={!enabled || busy} />
        <button type="button" className={styles.passwordToggle} aria-label={showPassword ? "Hide password" : "Show password"} aria-controls="login-password" disabled={!enabled || busy} onClick={() => setShowPassword(value => !value)}>
          {showPassword ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
        </button>
      </div>
    </div>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <button type="submit" className={`${styles.button} ${styles.loginSubmit}`} disabled={!enabled || busy}>
      <span>{busy ? "Signing in…" : "Sign in"}</span>
      {busy ? <CircleNotchIcon className={styles.loginSpinner} aria-hidden="true" /> : <ArrowRightIcon aria-hidden="true" />}
    </button>
    <p className={styles.loginHint}>Mellon workspace <span aria-hidden="true">·</span> Admin access only</p>
  </form>;
}
