import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { site } from "@/lib/site";
import { specialties } from "@/lib/specialties";
import { ian } from "@/lib/ian";
import styles from "./site-footer.module.css";

export default function SiteFooter() {
  return <footer className={styles.footer}><div className={styles.grid}>
    <div><Link href="/" aria-label="Mellon Real Estate home"><BrandLogo /></Link><p>Local guidance.<br />A fresh place to begin.</p><p>{site.broker} · California Real Estate Broker<br />DRE #{site.license}</p><Link href={ian.path}>Get to know Ian ↗</Link></div>
    <nav aria-label="Specialty services"><h2>Specialties</h2>{specialties.map(item => <Link key={item.slug} href={`/${item.slug}`}>{item.label}</Link>)}</nav>
    <div><h2>Let’s talk</h2><a href={site.phoneHref}>{site.phone}</a><a href={`mailto:${site.email}`}>{site.email}</a><p>Bakersfield & Kern County, California</p><Link href="/listings">Explore Mellon homes ↗</Link></div>
  </div><div className={styles.bottom}><span>Mellon Real Estate · Investments. Properties. Solutions.</span><a href="#home">Back to top ↑</a></div></footer>;
}
