"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import styles from "./landing.module.css";

const photos = [
  { src: "/images/properties/exterior.png", label: "A warm welcome.", name: "Exterior", alt: "Illustrative identical-build home with a white exterior and landscaped front garden.", width: 1280, height: 470 },
  { src: "/images/properties/living.png", label: "Space for everyday life.", name: "Living room", alt: "Illustrative open living room with wood-look flooring and large windows.", width: 319, height: 160 },
  { src: "/images/properties/kitchen.png", label: "The details make it home.", name: "Kitchen", alt: "Illustrative kitchen with white cabinetry and a light worktop.", width: 319, height: 160 },
];

export default function PropertyGallery() {
  const [active, setActive] = useState(0);
  return <div className={styles.gallery} aria-label="Mellon property photographs">
    <div className={styles.galleryMain}>
      {photos.map((photo, index) => <Image key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 767px) 90vw, (max-width: 1440px) 60vw, 840px" className={styles.galleryImage} hidden={active !== index} />)}
    </div>
    <div className={styles.galleryThumbnails} aria-label="Choose a photograph">
      {photos.map((photo, index) => <button key={photo.src} type="button" aria-label={`View ${photo.name.toLowerCase()}`} aria-pressed={index === active} onClick={() => setActive(index)} className={styles.thumbnail}>
        <span>{photo.name}<span aria-hidden="true">↗</span></span>
      </button>)}
    </div>
    <div className={styles.galleryCaption}>
      <div><p aria-live="polite" aria-atomic="true">{photos[active].label}</p><span className={styles.galleryContext}>Identical-build showcase</span></div>
      <div className={styles.galleryControls}>
        <span aria-hidden="true">{String(active + 1).padStart(2, "0")} / 03</span>
        <button type="button" aria-label="Previous photograph" onClick={() => setActive((active + photos.length - 1) % photos.length)}><ArrowLeftIcon aria-hidden="true" /></button>
        <button type="button" aria-label="Next photograph" onClick={() => setActive((active + 1) % photos.length)}><ArrowRightIcon aria-hidden="true" /></button>
      </div>
    </div>
  </div>;
}
