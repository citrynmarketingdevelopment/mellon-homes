import EmailDeliveryStatus from "@/components/cms/EmailDeliveryStatus";
import { requireAdmin } from "@/lib/cms/access";
import { database } from "@/lib/cms/db";
import type { SavedShowing } from "@/lib/showings/types";
import styles from "../admin.module.css";
import leadStyles from "../leads/leads.module.css";

export default async function ShowingsPage() {
  await requireAdmin();
  const { rows } = await database().query<{ id: string; data: SavedShowing; email_status: string; confirmation_status: string; created_at: Date }>("SELECT id, data, email_status, confirmation_status, created_at FROM mellon_showing_requests ORDER BY created_at DESC LIMIT 200");
  return <><div className={styles.pageHeading}><div><p className={styles.eyebrow}>MEET YOUR NEXT BUYER</p><h1>Showing requests</h1><p>Contact each visitor to confirm availability. Preferred times are Pacific time.</p></div></div>
    <section className={styles.surface}><div className={styles.surfaceHeading}><h2>{rows.length ? "Recent requests" : "No showing requests yet."}</h2><p>Up to 200 recent requests, saved even if email delivery fails.</p></div>
      <div className={leadStyles.list}>{rows.map(({ id, data, email_status, confirmation_status, created_at }) => <article key={id} className={leadStyles.lead}>
        <div className={leadStyles.heading}><h3>{data.name}</h3><time dateTime={created_at.toISOString()}>{created_at.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })}</time></div>
        <p className={leadStyles.address}>{data.address}</p><p><strong>Preferred showing: {data.date} at {data.time} Pacific</strong> · Needs confirmation</p>
        <div className={leadStyles.contact}><a href={`mailto:${data.email}`}>{data.email}</a><a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`}>{data.phone}</a></div>
        {data.notes && <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{data.notes}</p>}
        <EmailDeliveryStatus broker={email_status} customer={confirmation_status} />
        <p className={leadStyles.consent}>{data.consentText}</p>
      </article>)}</div>
    </section></>;
}
