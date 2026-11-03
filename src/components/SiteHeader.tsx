"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import BrandLogo from "./BrandLogo";
import { specialties } from "@/lib/specialties";
import styles from "./site-header.module.css";

export default function SiteHeader({ home = false, contactHref, activePage }: { home?: boolean; contactHref?: string; activePage?: "ian" }) {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const dropdown = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const href = (anchor: string) => `${home ? "" : "/"}#${anchor}`;
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) { setOpen(false); if (dropdown.current) dropdown.current.open = false; }
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);
  return <header ref={header} className={styles.header} data-open={open} onKeyDown={event => {
    if (event.key === "Escape") {
      if (dropdown.current?.open) { dropdown.current.open = false; dropdown.current.querySelector("summary")?.focus(); }
      else { setOpen(false); toggle.current?.focus(); }
      event.stopPropagation();
    }
  }}>
    <Link href={home ? "#home" : "/"} className={styles.brand} aria-label="Mellon Real Estate home"><BrandLogo priority /></Link>
    <nav id="main-navigation" aria-label="Main navigation" className={styles.navigation} onClick={event => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (!link) return;
      setOpen(false); if (dropdown.current) dropdown.current.open = false;
      const target = link.getAttribute("href");
      if (target?.startsWith("#")) document.getElementById(target.slice(1))?.focus({ preventScroll: true });
    }}>
      <a href={href("mellon-properties")}>Buy</a><a href={href("seller-support")}>Sell</a>
      <details ref={dropdown} className={styles.specialties}><summary>Specialties<CaretDownIcon aria-hidden="true" /></summary>
        <div className={styles.dropdown}><p>SUPPORT FOR YOUR NEXT CHAPTER</p>{specialties.map(item => <Link key={item.slug} href={`/${item.slug}`}>{item.label}<ArrowUpRightIcon aria-hidden="true" /></Link>)}</div>
      </details>
      <a href={href("development")}>Development</a><Link href="/about-ian" aria-current={activePage === "ian" ? "page" : undefined}>Meet Ian</Link><a href={href("home-value")}>Home value</a>
    </nav>
    <a href={contactHref ?? (home ? "#contact" : "#specialty-contact")} className={styles.contact}>Let’s talk<ArrowUpRightIcon aria-hidden="true" /></a>
    <button ref={toggle} type="button" className={styles.toggle} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}><span /><span /></button>
  </header>;
}
