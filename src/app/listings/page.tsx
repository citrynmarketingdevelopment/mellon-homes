import Link from "next/link";
import PublishedListings from "@/components/PublishedListings";
import styles from "@/components/listings.module.css";
export const dynamic = "force-dynamic";
export default function AllListings() {
  return <main className={`${styles.detail} ${styles.collectionPage}`}><div><header className={styles.collectionHeader}><Link href="/" className={styles.wordmark}>mellon<span>REAL ESTATE</span></Link><Link href="/">Back to home ↗</Link></header><div className={styles.collectionIntro}><p className={styles.eyebrow}>THE MELLON COLLECTION</p><h1>A fresh slice of home.</h1><p>Find a space that feels like your next chapter.</p></div><PublishedListings all /></div></main>;
}
