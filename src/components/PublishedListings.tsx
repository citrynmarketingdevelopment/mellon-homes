import Image from "next/image";
import Link from "next/link";
import { getListings } from "@/lib/cms/repository";
import { databaseConfigured } from "@/lib/cms/config";
import styles from "./listings.module.css";

export default async function PublishedListings({ fallback, all = false }: { fallback: React.ReactNode; all?: boolean }) {
  if (!databaseConfigured()) return fallback;
  let listings;
  try { listings = await getListings(true, all ? 200 : 6); }
  catch { console.error("Published listings unavailable"); return <div className={styles.empty}><h3>Let’s find your next home.</h3><p>Contact Ian for current listings and availability.</p><a href="#contact">Talk with Ian ↗</a></div>; }
  if (!listings.length) return fallback;
  return <div className={styles.grid}>{listings.map(item => <Link key={item.id} href={`/listings/${item.id}`} className={styles.card}>
    <div className={styles.photo}><Image unoptimized src={`/api/photos/${item.photos[0]}`} alt={item.title} width={700} height={470} /><span>{item.availability}</span></div>
    <div className={styles.copy}><p className={styles.price}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(item.price)}</p><h3>{item.title}</h3><p>{item.address}<br />{item.city}, {item.state} {item.zip}</p><div className={styles.facts}><span>{item.beds} beds</span><span>{item.baths} baths</span><span>{item.sqft.toLocaleString("en-US")} sq ft</span></div><span className={styles.more}>Take a closer look <span aria-hidden="true">↗</span></span></div>
  </Link>)}</div>;
}
