"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { BuildingsIcon } from "@phosphor-icons/react/dist/ssr/Buildings";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import type { Listing } from "@/lib/cms/validation";
import ConfirmDelete from "./ConfirmDelete";
import styles from "@/app/admin/admin.module.css";

const filters = ["all", "published", "draft", "featured"] as const;
type Filter = typeof filters[number];
export default function ListingManager({ initial, initialFilter }: { initial: Listing[]; initialFilter?: string }) {
  const router = useRouter();
  const [listings, setListings] = useState(initial);
  const [filter, setFilter] = useState<Filter>(filters.includes(initialFilter as Filter) ? initialFilter as Filter : "all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Listing | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const count = (tab: Filter) => listings.filter(item => tab === "all" || (tab === "featured" ? item.featured : item.status === tab)).length;
  const filtered = listings.filter(item => (filter === "all" || (filter === "featured" ? item.featured : item.status === filter)) && `${item.title} ${item.address} ${item.city} ${item.zip}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : b.updatedAt.localeCompare(a.updatedAt));
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  async function update(item: Listing, changes: Partial<Pick<Listing, "featured" | "status" | "availability">>) {
    setPending(item.id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/listings/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: item.revision, changes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update this listing.");
      setListings(previous => previous.map(listing => listing.id === item.id ? result : listing));
      setNotice(`${item.title} updated.`); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to connect. Try again."); }
    finally { setPending(null); }
  }
  async function remove() {
    if (!deleting) return;
    setPending(deleting.id); setError("");
    try {
      const response = await fetch(`/api/admin/listings/${deleting.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: deleting.revision }) });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error ?? "Unable to delete this listing."); }
      setListings(previous => previous.filter(item => item.id !== deleting.id));
      setNotice(`${deleting.title} deleted.`); setDeleting(null); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to connect. Try again."); }
    finally { setPending(null); }
  }
  async function refresh() {
    setPending("refresh"); setError("");
    try { const response = await fetch("/api/admin/listings"); if (!response.ok) throw new Error(); setListings(await response.json()); setNotice("Listings refreshed."); }
    catch { setError("Could not refresh your listings. Try again."); } finally { setPending(null); }
  }
  return <>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>YOUR PROPERTY COLLECTION</p><h1>Listings <span className={styles.headingCount}>{listings.length}</span></h1><p>A home for every property. A clear view of what’s next.</p></div><Link href="/admin/listings/new" className={styles.button}><PlusIcon aria-hidden="true" />New listing</Link></div>
    <section className={`${styles.surface} ${styles.manager}`} aria-label="Listings manager">
      <div className={styles.filterTabs} aria-label="Filter listings">{filters.map(tab => <button key={tab} type="button" aria-pressed={filter === tab} onClick={() => { setFilter(tab); setPage(1); }}>{tab === "all" ? "All listings" : tab === "draft" ? "Drafts" : tab[0].toUpperCase() + tab.slice(1)}<span>{count(tab)}</span></button>)}</div>
      <div className={styles.managerToolbar}><label className={styles.search}><MagnifyingGlassIcon aria-hidden="true" /><span className={styles.srOnly}>Search listings</span><input type="search" placeholder="Search by property, address, or city" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label><label className={styles.sort}><span>Sort by</span><select value={sort} onChange={event => { setSort(event.target.value); setPage(1); }}><option value="updated">Last updated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
      {error && !deleting && <div role="alert" className={styles.error}>{error}<button type="button" className={styles.secondary} disabled={!!pending} onClick={refresh}>Refresh listings</button></div>}
      <p role="status" className={notice ? styles.managerNotice : styles.srOnly}>{notice}</p>
      {visible.length ? <table className={styles.listingTable}><caption className={styles.srOnly}>Manage your properties, publication status, and featured placement</caption><thead><tr><th scope="col">Property</th><th scope="col">Price</th><th scope="col">Visibility</th><th scope="col">Featured</th><th scope="col">Actions</th></tr></thead><tbody>{visible.map(item => <tr key={item.id} data-listing-id={item.id}>
        <td className={styles.propertyCell}><div className={styles.propertySummary}>{item.photos[0] ? <Image unoptimized src={`/api/photos/${item.photos[0]}`} width={88} height={72} alt="" /> : <span className={styles.propertyPlaceholder}><BuildingsIcon aria-hidden="true" /></span>}<div><Link href={`/admin/listings/${item.id}`}>{item.title}</Link><p>{item.address}, {item.city}</p><small>{item.propertyType} <span>·</span> {item.beds} bd <span>·</span> {item.baths} ba</small></div></div></td>
        <td className={styles.priceCell}><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(item.price)}</strong><small>{item.availability}</small></td>
        <td className={styles.statusCell}><select aria-label={`Publication status for ${item.title}`} value={item.status} disabled={!!pending} data-status={item.status} onChange={event => update(item, { status: event.target.value as Listing["status"] })}><option value="draft">Draft</option><option value="published">Published</option></select></td>
        <td className={styles.featureCell}><button type="button" className={styles.featureToggle} role="switch" aria-checked={item.featured} aria-label={`Feature ${item.title}`} disabled={!!pending} onClick={() => update(item, { featured: !item.featured })}><StarIcon weight={item.featured ? "fill" : "regular"} aria-hidden="true" /><span>{item.featured ? "Featured" : "Feature"}</span></button></td>
        <td className={styles.actionCell}><div><Link href={`/admin/listings/${item.id}`} className={styles.iconButton} aria-label={`Edit ${item.title}`}><PencilSimpleIcon aria-hidden="true" /></Link><button className={`${styles.iconButton} ${styles.deleteButton}`} type="button" aria-label={`Delete ${item.title}`} disabled={!!pending} onClick={() => { setError(""); setDeleting(item); }}><TrashIcon aria-hidden="true" /></button></div></td>
      </tr>)}</tbody></table> : <div className={styles.managerEmpty}><span><BuildingsIcon aria-hidden="true" /></span><h2>{listings.length ? "No matches just yet." : "Your next listing starts here."}</h2><p>{listings.length ? "Try another search or choose a different filter." : "Add the details, choose your photos, and make it feel like home."}</p>{listings.length ? <button className={styles.secondary} onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</button> : <Link href="/admin/listings/new" className={styles.button}><PlusIcon aria-hidden="true" />Create a listing</Link>}</div>}
      <footer className={styles.pagination}><span>{filtered.length ? `${(currentPage - 1) * 10 + 1}–${Math.min(currentPage * 10, filtered.length)} of ${filtered.length} listings` : "0 listings"}</span><div><button type="button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><CaretLeftIcon aria-hidden="true" /></button><span>{currentPage} / {pages}</span><button type="button" aria-label="Next page" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}><CaretRightIcon aria-hidden="true" /></button></div></footer>
    </section>
    <p className={styles.managerHint}><StarIcon aria-hidden="true" />Featured listings appear first. Drafts stay private until you publish them.</p>
    {deleting && <ConfirmDelete title={deleting.title} busy={!!pending} error={error} onCancel={() => { setDeleting(null); setError(""); }} onConfirm={remove} />}
  </>;
}
