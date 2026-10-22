"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import styles from "./watermelon-seeds.module.css";

// Fixed placements keep hydration stable and leave the headline and controls clear.
const seeds = [
  [3, 18, 17, -30], [17, 5, 13, 32], [37, 7, 21, -42], [55, 5, 15, 24],
  [77, 7, 17, -20], [94, 13, 24, 36], [49, 31, 16, -32], [97, 42, 14, 21],
  [3, 71, 21, 28], [25, 87, 16, -24], [44, 78, 24, 38], [58, 93, 14, -12],
  [80, 92, 19, 45], [95, 78, 23, -24],
] as const;

export default function WatermelonSeeds() {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const hero = node.closest<HTMLElement>("[data-hero]");
    let visible = true;
    let frame = 0;
    const renderScroll = () => {
      frame = 0;
      if (!hero || paused || preference.matches || document.hidden || !visible) return;
      const progress = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
      node.style.setProperty("--scroll-distance", `${progress * -220}px`);
      hero.style.setProperty("--rind-scroll", `${progress * 95}px`);
      hero.style.setProperty("--rind-turn", `${progress * 12}deg`);
    };
    const scheduleScroll = () => {
      if (!frame && visible && !paused && !preference.matches && !document.hidden) frame = requestAnimationFrame(renderScroll);
    };
    const sync = () => {
      node.toggleAttribute("data-running", visible && !document.hidden && !preference.matches && !paused);
      if (preference.matches) {
        node.style.removeProperty("--scroll-distance");
        hero?.style.removeProperty("--rind-scroll");
        hero?.style.removeProperty("--rind-turn");
      }
      scheduleScroll();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      cancelAnimationFrame(frame);
      node.removeAttribute("data-running");
    };
  }, [paused]);

  return <>
    <div ref={ref} className={styles.field} data-seed-field aria-hidden="true">
      {seeds.map(([x, y, size, angle], index) => <span key={index} className={styles.seed} style={{
        "--seed-x": `${x}%`, "--seed-y": `${y}%`, "--seed-size": `${size}px`,
        "--seed-angle": `${angle}deg`, "--seed-time": `${4.5 + index % 4}s`, "--seed-delay": `${-index * 1.7}s`,
        "--seed-depth": .45 + (index % 4) * .25,
      } as CSSProperties} />)}
    </div>
    <button className={styles.toggle} type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Resume seed animation" : "Pause seed animation"}>
      {paused ? <PlayIcon weight="fill" aria-hidden="true" /> : <PauseIcon weight="fill" aria-hidden="true" />}
      <span>{paused ? "Motion paused" : "Pause motion"}</span>
    </button>
  </>;
}
