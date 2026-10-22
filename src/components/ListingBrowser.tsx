"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { BedIcon } from "@phosphor-icons/react/dist/ssr/Bed";
import { BathtubIcon } from "@phosphor-icons/react/dist/ssr/Bathtub";
import { RulerIcon } from "@phosphor-icons/react/dist/ssr/Ruler";
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star";
import { HouseLineIcon } from "@phosphor-icons/react/dist/ssr/HouseLine";
import type { Listing } from "@/lib/cms/validation";
import ListingPreview from "./ListingPreview";
import styles from "./listings.module.css";

export type PublicListing = Pick<Listing, "id" | "title" | "address" | "city" | "state" | "zip" | "price" | "beds" | "baths" | "sqft" | "propertyType" | "availability" | "featured" | "createdAt" | "description" | "photos"> & { cover: string };
const availabilityFilters = ["All homes", "For sale", "Pending", "Sold"] as const;
export default function ListingBrowser({ listings, all = false }: { listings: PublicListing[]; all?: boolean }) {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<string>("All homes");
  const [sort, setSort] = useState("featured");
  const [limit, setLimit] = useState(all ? 12 : 6);
  const [selected, setSelected] = useState<PublicListing | null>(null);
  const matches = listings.filter(item => (availability === "All homes" || item.availability === availability) && `${item.title} ${item.address} ${item.city} ${item.zip}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt));
  const visible = matches.slice(0, limit);
  return <div className={styles.browser}>
    <div className={styles.browseToolbar}><div className={styles.filters} aria-label="Filter homes by availability">{availabilityFilters.map(value => <button key={value} type="button" aria-pressed={availability === value} onClick={() => { setAvailability(value); setLimit(all ? 12 : 6); }}>{value === "All homes" && <HouseLineIcon aria-hidden="true" />}{value}</button>)}</div><label className={styles.search}><MagnifyingGlassIcon aria-hidden="true" /><span className={styles.srOnly}>Search homes</span><input type="search" placeholder="Search a city or address" value={query} onChange={event => { setQuery(event.target.value); setLimit(all ? 12 : 6); }} /></label></div>
    <div className={styles.resultBar}><p aria-live="polite">{matches.length ? <><strong>{matches.length}</strong> {matches.length === 1 ? "property" : "properties"} to explore</> : listings.length ? "No matching properties" : "Your next chapter starts here"}</p><label><span className={styles.srOnly}>Sort homes</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
    {visible.length ? <div className={styles.grid}>{visible.map(item => <Link href={`/listings/${item.id}`} prefetch={false} className={styles.card} key={item.id} aria-haspopup="dialog" onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) event.currentTarget.focus({ preventScroll: true }); }} onNavigate={event => { event.preventDefault(); setSelected(item); }}>
      <div className={styles.photo}><Image unoptimized src={`/api/photos/${item.cover}`} alt={item.title} width={700} height={470} /><span className={styles.availability}>{item.availability}</span>{item.featured && <span className={styles.featured}><StarIcon weight="fill" aria-hidden="true" /><span>Mellon pick</span></span>}</div>
      <div className={styles.copy}><div className={styles.priceLine}><p className={styles.price}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(item.price)}</p><span>{item.propertyType}</span></div><h3>{item.title}</h3><p className={styles.address}><MapPinIcon aria-hidden="true" /><span>{item.address}<br />{item.city}, {item.state} {item.zip}</span></p><div className={styles.facts}><span><BedIcon aria-hidden="true" />{item.beds} <span>beds</span></span><span><BathtubIcon aria-hidden="true" />{item.baths} <span>baths</span></span><span><RulerIcon aria-hidden="true" />{item.sqft.toLocaleString("en-US")} <span>sq ft</span></span></div><div className={styles.cardFooter}><span>Take a closer look</span><span className={styles.cardArrow}><ArrowUpRightIcon aria-hidden="true" /></span></div></div>
    </Link>)}</div> : <div className={styles.empty}><span className={styles.emptyIcon}><HouseLineIcon aria-hidden="true" /></span><div><h3>{listings.length ? "A fresh search might do it." : "Let’s find your kind of home."}</h3><p>{listings.length ? "Try a different address, city, or availability." : "More possibilities are on the way. Talk with Ian about what you’re looking for and what’s available now."}</p></div>{listings.length ? <button onClick={() => { setQuery(""); setAvailability("All homes"); }} className={styles.outlineButton}>Clear filters</button> : <Link className={styles.outlineButton} href="/#contact">Talk with Ian <ArrowUpRightIcon aria-hidden="true" /></Link>}</div>}
    {matches.length > visible.length && <div className={styles.loadMore}><button type="button" className={styles.outlineButton} onClick={() => setLimit(previous => previous + 12)}>Show more homes <span>+{Math.min(12, matches.length - visible.length)}</span></button></div>}
    <div className={styles.browseFooter}><span><span className={styles.brandDot} aria-hidden="true" />Listed with Mellon. Guided by Ian.</span>{!all && <Link href="/listings">Explore all properties <ArrowUpRightIcon aria-hidden="true" /></Link>}</div>
    {selected && <ListingPreview key={selected.id} listing={selected} onClose={() => setSelected(null)} />}
  </div>;
}
