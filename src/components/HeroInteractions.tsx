"use client";
import { useEffect } from "react";

export default function HeroInteractions() {
  useEffect(() => {
    const button = document.querySelector("[data-mascot-demo]");
    const demo = () => window.dispatchEvent(new Event("mellon:demo"));
    button?.addEventListener("click", demo);
    return () => button?.removeEventListener("click", demo);
  }, []);
  return null;
}
