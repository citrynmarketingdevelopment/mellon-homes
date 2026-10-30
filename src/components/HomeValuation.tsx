"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { HouseLineIcon } from "@phosphor-icons/react/dist/csr/HouseLine";
import { LockSimpleIcon } from "@phosphor-icons/react/dist/csr/LockSimple";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { consentText, type ValuationResponse, type ValuationReport } from "@/lib/valuation/types";
import styles from "./valuation.module.css";

const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function Report({ report }: { report: ValuationReport }) {
  const facts = [["Property type", report.propertyType], ["Beds / baths", report.beds !== undefined && report.baths !== undefined ? `${report.beds} / ${report.baths}` : undefined], ["Square feet", report.sqft?.toLocaleString("en-US")], ["Year built", report.yearBuilt], ["Lot size", report.lotSize === undefined ? undefined : `${report.lotSize.toLocaleString("en-US")} sq ft`]];
  return <>
    <div className={styles.reportAddress}><HouseLineIcon aria-hidden="true" /><div><span>YOUR PROPERTY SNAPSHOT</span><h3>{report.address}</h3></div></div>
    <div className={styles.values}><div><span>Estimated home value</span><strong>{dollars(report.value)}</strong>{report.low !== undefined && report.high !== undefined && <small>Estimated range: {dollars(report.low)} to {dollars(report.high)}</small>}</div><div><span>Estimated equity</span>{report.equity === undefined ? <><strong className={styles.unavailable}>Balance needed</strong><small>A loan balance is needed to estimate equity.</small></> : <><strong>{dollars(report.equity)}</strong><small>Based on your {dollars(report.loanBalance!)} total loan balance.</small></>}</div></div>
    <dl className={styles.facts}>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? "Not available"}</dd></div>)}</dl>
    <p className={styles.reportNote}>Source: {report.source} automated valuation, retrieved {new Date(report.asOf).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })}. This is an estimate, not an appraisal or an offer. Equity is estimated value less the loan balance you provided, before selling costs and any unreported liens.</p>
    <a className={styles.submit} href="#contact">Review my options with Ian <ArrowRightIcon aria-hidden="true" /></a>
  </>;
}

export default function HomeValuation({ instantAvailable }: { instantAvailable: boolean }) {
  const [result, setResult] = useState<ValuationResponse | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const requestId = useRef("");
  const submittedPayload = useRef("");
  const resultHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (result) resultHeading.current?.focus();
  }, [result]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = new FormData(event.currentTarget);
    const loan = String(form.get("loanBalance") ?? "").trim();
    const payload = {
      name: String(form.get("name") ?? ""), address: String(form.get("address") ?? ""),
      email: String(form.get("email") ?? ""), phone: String(form.get("phone") ?? ""),
      loanBalance: loan === "" ? undefined : Number(loan), consent: form.get("consent") === "on",
      website: String(form.get("website") ?? ""),
    };
    const serialized = JSON.stringify(payload);
    if (!requestId.current || submittedPayload.current !== serialized) requestId.current = crypto.randomUUID();
    submittedPayload.current = serialized;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/valuation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestId: requestId.current }),
        signal: AbortSignal.timeout(60_000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn’t complete your request. Please try again.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "TimeoutError" && cause.name !== "TypeError" ? cause.message : "We couldn’t connect. Please try again or contact Ian directly.");
    } finally { setPending(false); }
  }

  return <section id="home-value" tabIndex={-1} className={styles.section} aria-labelledby="valuation-title">
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>A FRESH LOOK AT YOUR HOME’S VALUE</p>
        <h2 id="valuation-title">Thinking<br />about selling?<br /><em>Start here.</em></h2>
        <p>There’s more to your home than an online number. Get a clearer picture of its value, your potential equity, and what comes next.</p>
        <div className={styles.promise}><HouseLineIcon aria-hidden="true" /><div><strong>Your home. Your possibilities.</strong><span>{instantAvailable ? "A free estimate, with local guidance from Ian." : "A free, personal home review from Ian."}</span></div></div>
        <p className={styles.introNote}>{instantAvailable ? "Estimates use nearby comparable listings. When an automated estimate isn’t available, Ian can help you take a closer look." : "Share your address and Ian will follow up with a local perspective on your property."}</p>
      </div>
      <div className={styles.panel} aria-busy={pending}>
        {result ? <div className={styles.result}>
          <p className={styles.formEyebrow}><CheckCircleIcon aria-hidden="true" /> REQUEST RECEIVED</p>
          <h3 ref={resultHeading} tabIndex={-1} className={styles.resultHeading}>{result.status === "estimate" ? "Here’s your starting point." : "Let’s take a closer look."}</h3>
          {result.status === "estimate" ? <Report report={result.report} /> : <><p className={styles.received}>Your details are saved for Ian to review. {instantAvailable ? "An instant estimate isn’t available for this request. Ian can follow up with a personal review of your property." : "Ian can follow up about your home’s value and your next steps."}</p><a className={styles.submit} href="#contact">Connect with Ian <ArrowRightIcon aria-hidden="true" /></a></>}
          <button className={styles.reset} type="button" onClick={() => { setResult(null); requestId.current = ""; }}>Check another property</button>
        </div> : <form onSubmit={submit}>
          <p className={styles.formEyebrow}>COMPLIMENTARY HOME REVIEW</p>
          <h3>{instantAvailable ? "What could your home be worth?" : "Let’s talk about your home."}</h3>
          <p className={styles.formDescription}>{instantAvailable ? "Enter your details to unlock your estimate." : "Tell us where to look and how to reach you."}</p>
          <div className={styles.fields}>
            <label className={styles.full}>Full name<input autoComplete="name" name="name" required minLength={2} maxLength={100} placeholder="Your first and last name" /></label>
            <label className={styles.full}><span id="property-address-label">Property address</span><input autoComplete="street-address" name="address" required minLength={10} maxLength={250} placeholder="123 Main St, Bakersfield, CA 93301" aria-labelledby="property-address-label" aria-describedby="address-hint" /><small id="address-hint">Include the street, city, state, and ZIP code.</small></label>
            <label>Email address<input type="email" autoComplete="email" name="email" required maxLength={254} placeholder="you@example.com" /></label>
            <label>Phone number<input type="tel" autoComplete="tel" name="phone" required minLength={10} maxLength={30} placeholder="(661) 555-0123" /></label>
            <div className={styles.full}><label htmlFor="loan-balance">Total outstanding loan balance <span className={styles.optional}>(optional)</span></label><div className={styles.moneyInput}><span aria-hidden="true">$</span><input id="loan-balance" type="number" inputMode="decimal" name="loanBalance" min="0" max="100000000" step="0.01" placeholder="Enter balance for an equity estimate" aria-describedby="balance-hint" /></div><small id="balance-hint">Include your mortgage, HELOC, and other property loans. Enter 0 if paid off; leave blank if unsure.</small></div>
          </div>
          <div className={styles.honeypot} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className={styles.consent}><input type="checkbox" name="consent" required /><span>{consentText}</span></label>
          <p className={styles.privacy}>Your details are used to respond to this request. The property address is shared with our valuation provider when an automated estimate is requested.</p>
          {error && <p className={styles.error} role="alert">{error} <a href="#contact">Contact Ian</a></p>}
          <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Preparing your home review…" : instantAvailable ? "Get my free estimate" : "Request my free home review"}<ArrowRightIcon aria-hidden="true" /></button>
          <p className={styles.formFooter}><LockSimpleIcon aria-hidden="true" /> No cost. No obligation. A real person to help.</p>
          <noscript><p>To request a review without JavaScript, <a href="mailto:ianmellon@yahoo.com">email Ian</a> with your property address and contact details.</p></noscript>
        </form>}
      </div>
    </div>
  </section>;
}
