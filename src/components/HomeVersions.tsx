"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr/CaretDown";
import styles from "./home-versions.module.css";

export type HomeVersion = "/" | "/home2" | "/home3";
const versions = [
  { href: "/", title: "Home 1", description: "A fresh slice of home" },
  { href: "/home2", title: "Home 2", description: "Big plans. Fresh starts." },
  { href: "/home3", title: "Home 3", description: "A fresh place to call home" },
] as const;

export default function HomeVersions({ current }: { current: HomeVersion }) {
  const details = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const node = details.current;
    if (!node) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !node.contains(event.target)) node.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && node.open) {
        event.stopPropagation();
        node.open = false;
        node.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    node.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      node.removeEventListener("keydown", escape);
    };
  }, []);

  return <details ref={details} className={styles.switcher}>
    <summary>Home versions <CaretDownIcon aria-hidden="true" /></summary>
    <div className={styles.options}>
      {versions.map(version => <Link
        key={version.href}
        href={version.href}
        className={styles.option}
        aria-current={current === version.href ? "page" : undefined}
        onClick={() => { if (details.current) details.current.open = false; }}
      ><strong>{version.title}</strong><span>{version.description}</span></Link>)}
    </div>
  </details>;
}
