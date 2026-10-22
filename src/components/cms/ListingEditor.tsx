"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Listing, ListingData } from "@/lib/cms/validation";
import styles from "@/app/admin/admin.module.css";
import ConfirmDelete from "./ConfirmDelete";

export default function ListingEditor({ initial }: { initial?: Listing }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [photos, setPhotos] = useState(initial?.photos ?? []);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    const navigate = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!dirty || !anchor || anchor.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || anchor.pathname === location.pathname) return;
      if (!window.confirm("Leave without saving your changes?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", warn); document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", navigate, true); };
  }, [dirty]);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(""); setMessage("");
    if (photos.length + files.length > 12) { setError("Use up to 12 photos per listing."); return; }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name}: choose a photo under 2 MB.`);
        const form = new FormData(); form.set("photo", file);
        const response = await fetch("/api/admin/photos", { method: "POST", body: form });
        const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Upload failed.");
        setPhotos(previous => [...previous, result.id]); setDirty(true);
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Upload failed. Try again."); }
    finally { setUploading(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");
    const data: ListingData = {
      title: text("title"), address: text("address"), city: text("city"), state: text("state").toUpperCase(), zip: text("zip"),
      price: Number(form.get("price")), beds: Number(form.get("beds")), baths: Number(form.get("baths")), sqft: Number(form.get("sqft")),
      description: text("description"), propertyType: text("propertyType") as ListingData["propertyType"],
      status: text("status") as ListingData["status"], availability: text("availability") as ListingData["availability"],
      featured: form.get("featured") === "on", photos,
    };
    try {
      const response = await fetch(saved ? `/api/admin/listings/${saved.id}` : "/api/admin/listings", { method: saved ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(saved ? { listing: data, revision: saved.revision } : data) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Could not save listing.");
      setSaved(result); setDirty(false); setMessage(data.status === "published" ? "Published. Your listing is now visible on the website." : "Draft saved. This listing is private.");
      if (!saved) { router.replace(`/admin/listings/${result.id}`); } else router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not connect. Try again."); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!saved) return; setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/listings/${saved.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: saved.revision }) });
      if (!response.ok) { const result = await response.json(); throw new Error(result.error); }
      setDirty(false); router.replace("/admin/listings"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to delete."); setBusy(false); }
  }
  const field = (name: keyof ListingData, label: string, type = "text", extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => <label>{label}<input name={name} type={type} defaultValue={String(initial?.[name] ?? (name === "state" ? "CA" : ""))} required {...extra} /></label>;
  return <><Link href="/admin/listings" className={styles.back}>← All listings</Link><div className={styles.pageHeading}><div><p className={styles.eyebrow}>MAKE ITS FIRST IMPRESSION COUNT</p><h1>{saved ? "Edit listing" : "New listing"}</h1><p>Add the essentials, show its best side, and publish when you’re ready.</p></div><span className={styles.badge} data-status={saved?.status ?? "draft"}>{saved?.status ?? "Unsaved draft"}</span></div>
    <form ref={formRef} className={styles.editor} onSubmit={save} onChange={() => setDirty(true)}>
      <div className={styles.editorMain}>
      <fieldset disabled={busy || uploading} className={styles.fields}><legend>Property details</legend>
        {field("title", "Listing title", "text", { minLength: 3, maxLength: 120 })}
        {field("address", "Street address", "text", { maxLength: 180 })}
        <div className={styles.grid}>{field("city", "City", "text", { maxLength: 80 })}{field("state", "State", "text", { maxLength: 2, minLength: 2 })}{field("zip", "ZIP code", "text", { pattern: "[0-9]{5}(-[0-9]{4})?" })}</div>
        <div className={styles.grid}>{field("price", "Price ($)", "number", { min: 1, max: 1000000000, step: 1 })}{field("beds", "Bedrooms", "number", { min: 0, max: 100, step: 1 })}{field("baths", "Bathrooms", "number", { min: 0, max: 100, step: .5 })}{field("sqft", "Area (sq ft)", "number", { min: 1, max: 10000000, step: 1 })}</div>
        <div className={styles.grid}><label>Property type<select name="propertyType" defaultValue={initial?.propertyType ?? "House"}>{["House", "Condo", "Townhome", "Multifamily", "Land", "Commercial"].map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Availability<select name="availability" defaultValue={initial?.availability ?? "For sale"}>{["For sale", "Pending", "Sold"].map(value => <option key={value}>{value}</option>)}</select></label></div>
        <label>Description<textarea name="description" required minLength={10} maxLength={8000} rows={7} defaultValue={initial?.description} /></label>
      </fieldset>
      <section className={styles.panel} aria-labelledby="photos-heading"><h2 id="photos-heading">Property photos</h2><p>Up to 12 JPG, PNG, or WebP photos, 2 MB each. The first photo is the cover.</p><label className={styles.upload}>Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || uploading} onChange={event => { void upload(event.target.files); event.target.value = ""; }} /></label>
        <div className={styles.photos}>{photos.map((id, index) => <div key={id}><Image unoptimized src={`/api/photos/${id}`} alt={`Listing photo ${index + 1}`} width={240} height={170} /><div><button type="button" disabled={busy || uploading || index === 0} onClick={() => { setPhotos([id, ...photos.filter(photo => photo !== id)]); setDirty(true); }}>{index === 0 ? "Cover photo" : "Make cover"}</button><button type="button" disabled={busy || uploading} aria-label={`Remove photo ${index + 1}`} onClick={() => { setPhotos(photos.filter(photo => photo !== id)); setDirty(true); }}>Remove</button></div></div>)}</div><p role="status">{uploading ? "Uploading and optimizing photos…" : ""}</p>
      </section>
      </div><aside className={styles.editorAside}>
      <fieldset className={styles.publish} disabled={busy || uploading}><legend>Visibility</legend><label>Publication status<select name="status" defaultValue={initial?.status ?? "draft"}><option value="draft">Draft — private</option><option value="published">Published — visible on website</option></select></label><label className={styles.check}><input type="checkbox" name="featured" defaultChecked={initial?.featured} />Feature this listing first</label><p className={styles.hint}>Switch a published listing to Draft to remove it from the public website.</p></fieldset>
      {error && <p role="alert" className={styles.error}>{error}</p>}{message && <p role="status" className={styles.success}>{message}</p>}
      <div className={styles.actions}><button className={styles.button} disabled={busy || uploading}>{busy ? "Saving…" : "Save listing"}</button>{saved?.status === "published" && <a className={styles.secondary} href={`/listings/${saved.id}`} target="_blank" rel="noreferrer">View public listing ↗</a>}{saved && <button type="button" className={styles.danger} disabled={busy || uploading} onClick={() => setConfirmDelete(true)}>Delete listing</button>}</div>
      </aside>
      {confirmDelete && <ConfirmDelete title={saved?.title ?? "This listing"} busy={busy} error={error} onConfirm={remove} onCancel={() => setConfirmDelete(false)} />}
    </form>
  </>;
}

