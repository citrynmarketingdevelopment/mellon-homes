"use client";
import { useRef, useState, type FormEvent } from "react";
import { contactConsent } from "@/lib/contact/types";
import styles from "./specialty.module.css";

export default function SpecialtyContactForm({ specialty }: { specialty: string }) {
  const id = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget); id.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        requestId: id.current, specialty, name: form.get("name"), email: form.get("email"), phone: form.get("phone"), address: form.get("address"),
        message: form.get("message"), consent: form.get("consent") === "on", website: form.get("website"),
      }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setSent(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }
  if (sent) return <div className={styles.thanks} role="status"><h3>Thank you for reaching out.</h3><p>Your inquiry is saved. Ian will follow up to discuss your property and next steps.</p><p>For anything time-sensitive, call <a href="tel:+16618052481">(661) 805-2481</a>.</p></div>;
  return <form className={styles.form} onSubmit={submit} onChange={() => { id.current = null; }}>
    <fieldset disabled={busy}><legend>Tell Ian a little about your situation.</legend>
      <div className={styles.formGrid}><label>Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label><label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label><label>Phone<input name="phone" type="tel" required minLength={7} maxLength={30} autoComplete="tel" /></label><label>Property address (optional)<input name="address" maxLength={250} autoComplete="street-address" /></label></div>
      <label>How can Ian help?<textarea name="message" required minLength={10} maxLength={2000} rows={4} /></label>
      <p className={styles.formHint}>Please leave out account numbers, legal documents, and other sensitive details.</p>
      <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className={styles.consent}><input name="consent" type="checkbox" required />{contactConsent}</label>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <button className={styles.button} type="submit">{busy ? "Sending inquiry…" : "Send my inquiry"}<span aria-hidden="true">↗</span></button>
    </fieldset>
  </form>;
}
