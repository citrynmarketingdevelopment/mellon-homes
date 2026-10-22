import Link from "next/link";
import PublishedListings from "@/components/PublishedListings";
import styles from "@/components/listings.module.css";
export const dynamic = "force-dynamic";
export default function AllListings() {
  return <main className={styles.detail}><div><Link href="/">← Back to Mellon</Link><h1>Find your fresh start.</h1><p style={{ marginBottom: 36 }}>Homes and properties listed by Mellon Real Estate.</p><PublishedListings all fallback={<div className={styles.empty}><h2>Let’s talk about your next move.</h2><p>Contact Ian for current property availability.</p><Link href="/#contact">Talk with Ian ↗</Link></div>} /></div></main>;
}
