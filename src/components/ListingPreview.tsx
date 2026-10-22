"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import { BedIcon } from "@phosphor-icons/react/dist/ssr/Bed";
import { BathtubIcon } from "@phosphor-icons/react/dist/ssr/Bathtub";
import { RulerIcon } from "@phosphor-icons/react/dist/ssr/Ruler";
import { StarIcon } from "@phosphor-icons/react/dist/ssr/Star";
import type { PublicListing } from "./ListingBrowser";
import styles from "./listing-preview.module.css";

export default function ListingPreview({ listing, onClose }: { listing: PublicListing; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dragStart = useRef<number | null>(null);
  const backdropPress = useRef(false);
  const [photo, setPhoto] = useState(0);
  const titleId = useId();
  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(listing.price);

  useEffect(() => {
    const node = dialog.current!;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollY = window.scrollY;
    const previousStyle = document.body.style.cssText;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    // Fix the body as well as locking overflow so iOS preserves the browse position.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbar}px`;
    node.showModal();
    return () => {
      node.close();
      document.body.style.cssText = previousStyle;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      trigger?.focus({ preventScroll: true });
    };
  }, []);

  function changePhoto(direction: number) {
    setPhoto(current => (current + direction + listing.photos.length) % listing.photos.length);
  }

  return createPortal(
    <dialog
      ref={dialog}
      className={styles.sheet}
      aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onKeyDown={event => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], summary"));
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onPointerDown={event => { backdropPress.current = event.target === event.currentTarget; }}
      onClick={event => { if (backdropPress.current && event.target === event.currentTarget) onClose(); }}
    >
      <div className={styles.shell}>
        <header className={styles.header}>
          <div
            className={styles.sheetHandle}
            aria-hidden="true"
            onPointerDown={event => {
              if (event.pointerType === "mouse") return;
              dragStart.current = event.clientY;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={event => {
              if (dragStart.current === null) return;
              dialog.current?.style.setProperty("--drag", `${Math.max(0, event.clientY - dragStart.current)}px`);
            }}
            onPointerUp={event => {
              if (dragStart.current !== null && event.clientY - dragStart.current > 80) onClose();
              dragStart.current = null;
              dialog.current?.style.removeProperty("--drag");
            }}
            onPointerCancel={() => { dragStart.current = null; dialog.current?.style.removeProperty("--drag"); }}
          ><span /></div>
          <span className={styles.headerLabel}>A CLOSER LOOK</span>
          <button type="button" autoFocus className={styles.iconButton} aria-label="Close property preview" onClick={onClose}><XIcon aria-hidden="true" /></button>
        </header>

        <div className={styles.scrollArea}>
          <div className={styles.hero} role="region" aria-label="Property photos" aria-roledescription="carousel">
            <Image unoptimized src={`/api/photos/${listing.photos[photo]}`} alt={`${listing.title}, photo ${photo + 1}`} width={960} height={720} className={styles.image} />
            <div className={styles.badges}><span>{listing.availability}</span>{listing.featured && <span className={styles.pick}><StarIcon weight="fill" aria-hidden="true" />Mellon pick</span>}</div>
            <div className={styles.photoControls}>
              {listing.photos.length > 1 && <button type="button" className={styles.iconButton} aria-label="Previous property photo" onClick={() => changePhoto(-1)}><CaretLeftIcon aria-hidden="true" /></button>}
              <span className={styles.photoCount} aria-live="polite" aria-atomic="true">{photo + 1} / {listing.photos.length}<span className={styles.srOnly}> photos</span></span>
              {listing.photos.length > 1 && <button type="button" className={styles.iconButton} aria-label="Next property photo" onClick={() => changePhoto(1)}><CaretRightIcon aria-hidden="true" /></button>}
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.priceRow}><p className={styles.price}>{price}</p><span className={styles.propertyType}>{listing.propertyType}</span></div>
            <h2 id={titleId} className={styles.title}>{listing.title}</h2>
            <p className={styles.address}><MapPinIcon aria-hidden="true" /><span>{listing.address}<br />{listing.city}, {listing.state} {listing.zip}</span></p>
            <dl className={styles.facts}>
              <div><BedIcon aria-hidden="true" /><dt>Bedrooms</dt><dd>{listing.beds}</dd></div>
              <div><BathtubIcon aria-hidden="true" /><dt>Bathrooms</dt><dd>{listing.baths}</dd></div>
              <div><RulerIcon aria-hidden="true" /><dt>Sq ft</dt><dd>{listing.sqft.toLocaleString("en-US")}</dd></div>
            </dl>
            <details className={styles.about}><summary>About this home<CaretRightIcon aria-hidden="true" /></summary><p>{listing.description}</p></details>
            <Link href={`/listings/${listing.id}`} className={styles.fullListing}>View full listing<ArrowUpRightIcon aria-hidden="true" /></Link>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.broker}><span className={styles.avatar} aria-hidden="true">IM</span><div><strong>Ian Mellon</strong><span>Broker · DRE #01921587</span></div></div>
          <a className={styles.contact} href={`mailto:ianmellon@yahoo.com?subject=${encodeURIComponent(`Property inquiry: ${listing.address}`)}`}>Ask Ian about this home<ArrowUpRightIcon aria-hidden="true" /></a>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
