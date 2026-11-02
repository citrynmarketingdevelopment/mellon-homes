import { requireAdmin } from "@/lib/cms/access";
import { database } from "@/lib/cms/db";
import { getSpecialty } from "@/lib/specialties";
import type { ContactRequest } from "@/lib/contact/types";
import EmailDeliveryStatus from "@/components/cms/EmailDeliveryStatus";
import styles from "../admin.module.css";
import leadStyles from "../leads/leads.module.css";

export default async function InquiriesPage() {
  await requireAdmin();
  const { rows } = await database().query<{ id: string; data: ContactRequest; email_status: string; confirmation_status: string; created_at: Date }>("SELECT * FROM mellon_contact_requests ORDER BY created_at DESC LIMIT 200");
  return <><div className={styles.pageHeading}><div><p className={styles.eyebrow}>SPECIALTY REAL ESTATE</p><h1>Specialty inquiries</h1><p>Website conversations, saved before email delivery. Times are Pacific.</p></div></div><section className={styles.surface}><div className={styles.surfaceHeading}><h2>{rows.length ? "Recent inquiries" : "No inquiries yet."}</h2></div><div className={leadStyles.list}>{rows.map(({ id, data, email_status, confirmation_status, created_at }) => <article key={id} className={leadStyles.lead}>
    <div className={leadStyles.heading}><h3>{data.name}</h3><time dateTime={created_at.toISOString()}>{created_at.toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "medium", timeStyle: "short" })}</time></div>
    <p>{getSpecialty(data.specialty)?.label}</p>{data.address && <p className={leadStyles.address}>{data.address}</p>}
    <div className={leadStyles.contact}><a href={`mailto:${data.email}`}>{data.email}</a><a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`}>{data.phone}</a></div>
    <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{data.message}</p><EmailDeliveryStatus broker={email_status} customer={confirmation_status} />
    <p className={leadStyles.consent}>Contact consent recorded with this inquiry.</p>
  </article>)}</div></section></>;
}
