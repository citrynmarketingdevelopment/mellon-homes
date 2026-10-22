import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { databaseConfigured } from "@/lib/cms/config";
import { getListing } from "@/lib/cms/repository";
import { uuidSchema } from "@/lib/cms/validation";
import styles from "@/components/listings.module.css";

export const dynamic = "force-dynamic";
export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const id = uuidSchema.safeParse((await params).id);
  if (!id.success || !databaseConfigured()) notFound();
  const item = await getListing(id.data, true); if (!item) notFound();
  return <main className={styles.detail}><div><Link href="/#mellon-properties">← Mellon homes</Link><h1>{item.title}</h1><p>{item.address}, {item.city}, {item.state} {item.zip}</p><p className={styles.price}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(item.price)} · {item.availability}</p><div className={styles.facts}><span>{item.beds} bedrooms</span><span>{item.baths} bathrooms</span><span>{item.sqft.toLocaleString("en-US")} sq ft</span><span>{item.propertyType}</span></div><div className={styles.gallery}>{item.photos.map((photo, index) => <Image unoptimized key={photo} src={`/api/photos/${photo}`} alt={`${item.title}, photo ${index + 1}`} width={1600} height={1066} priority={index === 0} />)}</div><h2>A closer look.</h2><p className={styles.description}>{item.description}</p><a className={styles.contact} href={`mailto:ianmellon@yahoo.com?subject=${encodeURIComponent(`Property inquiry: ${item.address}`)}`}>Ask Ian about this home ↗</a><p style={{ marginTop: 22, fontSize: 12 }}>Ian Mellon · California Real Estate Broker · DRE #01921587</p></div></main>;
}
