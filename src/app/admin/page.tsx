import Link from "next/link";
import Image from "next/image";
import { BuildingsIcon } from "@phosphor-icons/react/dist/ssr/Buildings";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { FileTextIcon } from "@phosphor-icons/react/dist/ssr/FileText";
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { requireAdmin } from "@/lib/cms/access";
import { getListings } from "@/lib/cms/repository";
import styles from "./admin.module.css";

export default async function Dashboard() {
  await requireAdmin();
  const listings = await getListings();
  const published = listings.filter(item => item.status === "published").length;
  const featured = listings.filter(item => item.featured).length;
  const recent = [...listings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const stats = [
    { label: "Total listings", value: listings.length, caption: "Your property collection", Icon: BuildingsIcon, filter: "all" },
    { label: "Published", value: published, caption: "Visible on the website", Icon: EyeIcon, filter: "published" },
    { label: "Drafts", value: listings.length - published, caption: "Ready when you are", Icon: FileTextIcon, filter: "draft" },
    { label: "Featured", value: featured, caption: "First in the collection", Icon: StarIcon, filter: "featured" },
  ];
  return <>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>A FRESH PERSPECTIVE</p><h1>Overview</h1><p>Everything you need to keep your properties moving.</p></div><Link className={styles.button} href="/admin/listings/new"><PlusIcon aria-hidden="true" />New listing</Link></div>
    <div className={styles.stats}>{stats.map(({ label, value, caption, Icon, filter }) => <Link href={`/admin/listings?filter=${filter}`} className={styles.stat} key={label}><div><span>{label}</span><Icon aria-hidden="true" /></div><strong>{value}</strong><p>{caption}</p></Link>)}</div>
    <section className={styles.surface}><div className={styles.surfaceHeading}><div><h2>Recently updated</h2><p>Your latest property edits.</p></div><Link href="/admin/listings">View all <ArrowRightIcon aria-hidden="true" /></Link></div>
      {recent.length ? <div className={styles.recentList}>{recent.map(item => <Link href={`/admin/listings/${item.id}`} key={item.id} className={styles.recentItem}>{item.photos[0] ? <Image unoptimized src={`/api/photos/${item.photos[0]}`} alt="" width={80} height={64} /> : <span className={styles.recentPlaceholder}><BuildingsIcon aria-hidden="true" /></span>}<span><strong>{item.title}</strong><small>{item.city} · {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(item.price)}</small></span><span className={styles.badge} data-status={item.status}>{item.status}</span></Link>)}</div> : <div className={styles.overviewEmpty}><BuildingsIcon aria-hidden="true" /><h3>A little space for something new.</h3><p>Your listings will appear here as you add them.</p><Link href="/admin/listings/new">Add your first property <ArrowRightIcon aria-hidden="true" /></Link></div>}
    </section>
  </>;
}
