import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/cms/access";
import { getListings } from "@/lib/cms/repository";
import SignOut from "@/components/cms/SignOut";
import styles from "./admin.module.css";

export default async function Dashboard() {
  const session = await requireAdmin();
  const listings = await getListings();
  return <><div className={styles.topline}><div><p className={styles.eyebrow}>WELCOME, {session.user.name}</p><h1>A place for every listing.</h1><p>Draft, publish, and keep your properties up to date.</p></div><SignOut /></div>
    <div className={styles.toolbar}><p>{listings.length} listings · {listings.filter(item => item.status === "published").length} published</p><Link className={styles.button} href="/admin/listings/new">+ New listing</Link></div>
    {!listings.length ? <div className={styles.empty}><h2>Your first listing starts here.</h2><p>Add the photos and details, then publish when you’re ready.</p><Link href="/admin/listings/new" className={styles.button}>Create a listing</Link></div> :
    <div className={styles.list}>{listings.map(item => <article key={item.id} className={styles.row}><div>{/* Authenticated photos use same-origin cookies. */}
      {item.photos[0] ? <Image unoptimized src={`/api/photos/${item.photos[0]}`} alt="" width={180} height={120} /> : <div className={styles.noPhoto}>No photo yet</div>}</div>
      <div><span className={styles.badge}>{item.status} · {item.availability}</span><h2>{item.title}</h2><p>{item.address}, {item.city}</p><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(item.price)}</strong></div>
      <Link className={styles.secondary} href={`/admin/listings/${item.id}`}>Edit listing<span className={styles.srOnly}>: {item.title}</span></Link></article>)}</div>}
  </>;
}
