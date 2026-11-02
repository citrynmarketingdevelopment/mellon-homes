import { pageMetadata } from "@/lib/seo";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import PublishedListings from "@/components/PublishedListings";
import styles from "@/components/listings.module.css";
export const metadata = pageMetadata("Homes for Sale in Bakersfield & Kern County | Mellon", "Browse published Mellon listings in Bakersfield and Kern County. Explore property photos and details, then request a showing with local broker Ian Mellon.", "/listings");
export const dynamic = "force-dynamic";
export default function AllListings() {
  return <main className={`${styles.detail} ${styles.collectionPage}`}><div><header className={styles.collectionHeader}><Link href="/" className={styles.wordmark} aria-label="Mellon Real Estate home"><BrandLogo /></Link><Link href="/">Back to home ↗</Link></header><div className={styles.collectionIntro}><p className={styles.eyebrow}>THE MELLON COLLECTION</p><h1>A fresh slice of home.</h1><p>Find a space that feels like your next chapter.</p></div><PublishedListings all /></div></main>;
}
