import Link from "next/link";
import { getListings } from "@/lib/cms/repository";
import { databaseConfigured } from "@/lib/cms/config";
import ListingBrowser from "./ListingBrowser";
import styles from "./listings.module.css";

export default async function PublishedListings({ all = false, contactHref = "/#contact" }: { all?: boolean; contactHref?: string }) {
  let listings: Awaited<ReturnType<typeof getListings>> = [];
  try { if (databaseConfigured()) listings = await getListings(true); }
  catch { console.error("Published listings unavailable"); return <div className={styles.empty}><div><h3>Let’s find your next home.</h3><p>Our listings are temporarily unavailable. Contact Ian for current properties.</p></div><Link className={styles.outlineButton} href={contactHref}>Talk with Ian ↗</Link></div>; }
  // Whitelist published preview content; keep publication and admin metadata on the server.
  return <ListingBrowser all={all} contactHref={contactHref} listings={listings.map(item => ({ id: item.id, title: item.title, address: item.address, city: item.city, state: item.state, zip: item.zip, price: item.price, beds: item.beds, baths: item.baths, sqft: item.sqft, propertyType: item.propertyType, availability: item.availability, featured: item.featured, createdAt: item.createdAt, description: item.description, photos: item.photos, cover: item.photos[0] }))} />;
}
