"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./alternate-home.module.css";

/** Animated WebP keeps the original video alpha transparent across browsers. */
export default function AnimatedMascot() {
  const host = useRef<HTMLButtonElement>(null);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;
    const sync = () => setActive(visible && !document.hidden && !motion.matches && !connection?.saveData);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(node);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const playing = active && !paused && !failed;
  return <button ref={host} className={styles.animatedMascot}
    type="button" aria-label={paused ? "Play mascot animation" : "Pause mascot animation"}
    aria-pressed={paused} title={paused ? "Play Mellon" : "Pause Mellon"}
    onClick={() => setPaused(value => !value)} data-playing={playing}>
    <Image unoptimized width={320} height={320} alt="Mellon, our watermelon mascot holding a set of keys"
      src={playing ? "/images/mascot-motion/mascot-loop-224.webp" : "/images/mascot-motion/mascot-poster.png"}
      onError={() => setFailed(true)} />
  </button>;
}
