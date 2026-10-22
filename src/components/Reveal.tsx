"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./landing.module.css";

/** Content is visible without JS. Only offscreen sections get an entrance. */
export default function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const show = () => { node.removeAttribute("data-awaiting"); };
    if (motion.matches || node.getBoundingClientRect().top < innerHeight || !("IntersectionObserver" in window)) return;
    node.setAttribute("data-awaiting", "");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { show(); observer.disconnect(); }
    }, { rootMargin: "0px 0px -30px 0px", threshold: 0.02 });
    observer.observe(node);
    const preference = () => { if (motion.matches) { show(); observer.disconnect(); } };
    motion.addEventListener("change", preference);
    return () => { show(); observer.disconnect(); motion.removeEventListener("change", preference); };
  }, []);
  return <div ref={ref} className={`${styles.reveal} ${className}`}>{children}</div>;
}
