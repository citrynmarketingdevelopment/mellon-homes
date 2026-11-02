"use client";
import { useRef, useState, type FormEvent } from "react";
import { showingConsent } from "@/lib/showings/types";
import styles from "./showing.module.css";

export default function ShowingForm({ listingId, minDate, maxDate }: { listingId: string; minDate: string; maxDate: string }) {
  const requestId = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/showings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        requestId: requestId.current, listingId, name: form.get("name"), email: form.get("email"), phone: form.get("phone"),
        date: form.get("date"), time: form.get("time"), notes: form.get("notes"), website: form.get("website"), consent: form.get("consent") === "on",
      }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setSent(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }
  return <section id="schedule-showing" className={styles.section} aria-labelledby="showing-title" tabIndex={-1}>
    <h2 id="showing-title">Schedule a Showing</h2>
    {sent ? <p role="status">Your showing request has been saved. Ian will contact you to confirm availability and the appointment time.</p> : <>
      <p>Choose your preferred date and time. Ian will follow up to confirm your appointment. All times are Pacific time.</p>
      <form onSubmit={submit} onChange={() => { requestId.current = null; }}>
        <fieldset disabled={busy}><legend className={styles.srOnly}>Showing request details</legend>
          <div className={styles.grid}>
            <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
            <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
            <label>Phone<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} /></label>
            <label>Preferred date<input name="date" type="date" required min={minDate} max={maxDate} /></label>
            <label>Preferred time (Pacific)<input name="time" type="time" required /></label>
          </div>
          <label>Anything you’d like Ian to know? (optional)<textarea name="notes" rows={3} maxLength={2000} /></label>
          <label className={styles.trap} aria-hidden="true">Website<input name="website" autoComplete="off" tabIndex={-1} /></label>
          <label className={styles.consent}><input name="consent" type="checkbox" required />{showingConsent}</label>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button type="submit">{busy ? "Sending request…" : "Request showing"}</button>
        </fieldset>
      </form>
    </>}
    <p className={styles.direct}>Prefer to talk? <a href="tel:+16618052481">Call (661) 805-2481</a> or <a href="mailto:ianmellon@yahoo.com">email Ian</a>.</p>
  </section>;
}
