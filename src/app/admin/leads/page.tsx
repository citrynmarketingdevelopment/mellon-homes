import { requireAdmin } from "@/lib/cms/access";
import { database } from "@/lib/cms/db";
import type { ValuationLead, ValuationResponse } from "@/lib/valuation/types";
import styles from "../admin.module.css";
import leadStyles from "./leads.module.css";

export default async function LeadsPage() {
  await requireAdmin();
  const { rows } = await database().query<{ id: string; data: ValuationLead; result: ValuationResponse | null; email_status: string; created_at: Date }>(
    "SELECT id, data, result, email_status, created_at FROM mellon_valuation_leads ORDER BY created_at DESC LIMIT 200");
  return <>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>HOME VALUATION REQUESTS</p><h1>Home value leads</h1><p>Contact details and property requests, saved before email delivery.</p></div></div>
    <section className={styles.surface}>
      <div className={styles.surfaceHeading}><div><h2>{rows.length ? "Recent requests" : "Your next conversation starts here."}</h2><p>Showing up to 200 recent requests. Times are Pacific time.</p></div></div>
      {!rows.length && <div className={styles.overviewEmpty}><p>Homeowners who complete the home-value form will appear here.</p></div>}
      <div className={leadStyles.list}>{rows.map(({ id, data, result, email_status, created_at }) => <article key={id} className={leadStyles.lead}>
        <div className={leadStyles.heading}><h3>{data.name}</h3><time dateTime={created_at.toISOString()}>{created_at.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })}</time></div>
        <p className={leadStyles.address}>{data.address}</p>
        <div className={leadStyles.contact}><a href={`mailto:${data.email}`}>{data.email}</a><a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`}>{data.phone}</a></div>
        <dl><div><dt>Requested review</dt><dd>{result?.status === "estimate" ? `RentCast estimate: $${result.report.value.toLocaleString("en-US")}` : "Personal review needed"}</dd></div><div><dt>Homeowner-provided loan balance</dt><dd>{data.loanBalance === undefined ? "Not provided" : `$${data.loanBalance.toLocaleString("en-US")}`}</dd></div><div><dt>Email notification</dt><dd>{email_status === "sent" ? "Sent" : email_status === "unconfigured" ? "SMTP not configured; follow up from this inbox" : email_status === "failed" ? "Delivery failed; follow up from this inbox" : "Pending; check this inbox for follow-up"}</dd></div></dl>
        <p className={leadStyles.consent}>Contact consent recorded with this request.</p>
      </article>)}</div>
    </section>
  </>;
}
