"use client";

import { useEffect } from "react";

/** The header navigates to real page sections; the mobile menu is enhanced here. */
export default function HeroInteractions() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const menu = hero?.querySelector<HTMLButtonElement>("[data-menu-toggle]");
    if (!hero || !menu) return;
    const closeMenu = () => {
      hero.removeAttribute("data-menu-open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Open navigation");
    };
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("button, a") : null;
      if (!target) return;
      if (target.hasAttribute("data-menu-toggle")) {
        const open = !hero.hasAttribute("data-menu-open");
        hero.toggleAttribute("data-menu-open", open);
        menu.setAttribute("aria-expanded", String(open));
        menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      } else if (target.hasAttribute("data-mascot-demo")) {
        window.dispatchEvent(new Event("mellon:demo"));
      } else if (target.getAttribute("href")?.startsWith("#")) {
        closeMenu();
        document.getElementById(target.getAttribute("href")!.slice(1))?.focus({ preventScroll: true });
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && hero.hasAttribute("data-menu-open")) { closeMenu(); menu.focus(); }
    };
    hero.addEventListener("click", click);
    document.addEventListener("keydown", keydown);
    return () => {
      hero.removeEventListener("click", click);
      document.removeEventListener("keydown", keydown);
      closeMenu();
    };
  }, []);
  return null;
}
