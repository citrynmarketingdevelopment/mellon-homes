"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./hero.module.css";

// Coordinates are in the original 1312 × 1199 artwork. The source image stays intact.
const eyes = [
  {
    x: 569, y: 567, irisY: 568, rx: 66, ry: 66, rotation: 0, travelX: 16, travelY: 12,
    aperture: "M 493 565 C 494 529 521 500 559 497 C 600 492 633 517 640 554 C 647 586 632 614 610 632 C 584 613 550 610 516 620 C 501 607 492 586 493 565 Z",
    iris: "M 504 565 C 503 534 528 506 559 503 C 594 500 624 521 633 554 C 640 583 626 612 605 627 C 580 613 550 610 521 619 C 509 605 503 585 504 565 Z",
  },
  {
    x: 873, y: 538, irisY: 538, rx: 47, ry: 61, rotation: -16, travelX: 13, travelY: 11,
    aperture: "M 824 533 C 823 501 842 477 866 473 C 896 468 922 490 934 519 C 944 546 936 570 928 581 C 904 579 891 588 879 599 C 862 604 846 593 834 573 C 827 561 824 547 824 533 Z",
    iris: "M 826 531 C 824 505 839 486 859 482 C 885 476 909 495 917 521 C 927 549 916 580 896 593 C 885 597 875 600 863 597 C 840 589 827 562 826 531 Z",
  },
] as const;

/** Original artwork with independently moving, clipped iris layers. */
export default function MascotScene() {
  const id = useId().replaceAll(":", "");
  const hostRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pupilRefs = useRef<(SVGGElement | null)[]>([]);
  const eyeRefs = useRef<(SVGGElement | null)[]>([]);
  const [status, setStatus] = useState("loading");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const host = hostRef.current;
    const artwork = artworkRef.current;
    const hero = host?.closest<HTMLElement>("[data-hero]");
    const ring = ringRef.current;
    if (!host || !artwork || !hero || !ring) return;

    // The retired video renderer inserted nodes outside React's tree. Clear any
    // that survived a development refresh from the video version of this hero.
    hero.querySelectorAll<HTMLVideoElement>("video[data-scrub-source]").forEach(video => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
    });
    hero.querySelectorAll("canvas[data-video-mascot]").forEach(canvas => canvas.remove());
    host.dataset.renderer = "logo";
    for (const attribute of [...host.attributes]) {
      if (attribute.name === "data-video-status" || attribute.name.startsWith("data-scrub-")) {
        host.removeAttribute(attribute.name);
      }
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const poses = eyes.map(() => ({ x: 0, y: 0, targetX: 0, targetY: 0 }));
    let frame = 0;
    let lastTime = 0;
    let alive = true;
    let inView = true;
    let pointerPosition: { x: number; y: number } | null = null;
    let demoStart: number | null = null;
    let touchTimer: ReturnType<typeof setTimeout> | undefined;

    const hideCursor = () => {
      ring.removeAttribute("data-visible");
      hero.removeAttribute("data-custom-cursor");
    };
    const paint = () => {
      poses.forEach((pose, index) => {
        pupilRefs.current[index]?.setAttribute("transform", `translate(${pose.x.toFixed(3)} ${pose.y.toFixed(3)})`);
        // Switch the entire socket together so no stationary iris fragments remain
        // beneath a partially transparent moving cutout.
        eyeRefs.current[index]?.setAttribute("opacity", Math.hypot(pose.x, pose.y) > .01 ? "1" : "0");
      });
    };
    const setTargets = (clientX: number, clientY: number) => {
      const rect = artwork.getBoundingClientRect();
      const scale = rect.width / 1312;
      const artworkY = rect.top + (rect.height - 1199 * scale) / 2;
      eyes.forEach((eye, index) => {
        const dx = clientX - (rect.left + eye.x * scale);
        const dy = clientY - (artworkY + eye.y * scale);
        // Each eye aims from its own center, including after scrolling or resizing.
        const distance = Math.hypot(dx, dy, rect.width * .21);
        poses[index].targetX = reducedMotion.matches ? 0 : dx / distance * eye.travelX;
        poses[index].targetY = reducedMotion.matches ? 0 : dy / distance * eye.travelY;
      });
    };
    const tick = (now: number) => {
      frame = 0;
      if (!alive || !inView || document.hidden) return;
      const delta = Math.min((now - lastTime) / 1000 || 1 / 60, .05);
      lastTime = now;
      if (demoStart !== null) {
        const progress = Math.min((now - demoStart) / 2400, 1);
        poses.forEach((pose, index) => {
          pose.targetX = Math.sin(progress * Math.PI * 2) * eyes[index].travelX;
          pose.targetY = Math.sin(progress * Math.PI * 4) * eyes[index].travelY * .55;
        });
        if (progress >= 1) {
          demoStart = null;
          poses.forEach(pose => { pose.targetX = 0; pose.targetY = 0; });
        }
      }
      const damping = 1 - Math.exp(-12 * delta);
      let moving = demoStart !== null;
      poses.forEach(pose => {
        pose.x += (pose.targetX - pose.x) * damping;
        pose.y += (pose.targetY - pose.y) * damping;
        if (Math.abs(pose.targetX - pose.x) + Math.abs(pose.targetY - pose.y) > .015) moving = true;
        else { pose.x = pose.targetX; pose.y = pose.targetY; }
      });
      paint();
      host.dataset.motion = moving ? "moving" : "idle";
      if (moving) frame = requestAnimationFrame(tick);
    };
    const invalidate = () => {
      if (!frame && alive && inView && !document.hidden) {
        host.dataset.motion = "moving";
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const reset = () => {
      pointerPosition = null;
      demoStart = null;
      poses.forEach(pose => { pose.targetX = 0; pose.targetY = 0; });
      hideCursor();
      invalidate();
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" && event.type === "pointermove") return;
      if ((event.target as Element)?.closest("dialog")) { reset(); return; }
      clearTimeout(touchTimer);
      demoStart = null;
      pointerPosition = { x: event.clientX, y: event.clientY };
      if (event.pointerType === "mouse" && finePointer.matches && !reducedMotion.matches) {
        // Fixed viewport coordinates: no parent/header offset and no trailing animation.
        ring.style.setProperty("--pointer-x", `${event.clientX}px`);
        ring.style.setProperty("--pointer-y", `${event.clientY}px`);
        ring.setAttribute("data-visible", "");
        ring.toggleAttribute("data-interactive", Boolean((event.target as Element)?.closest("button, a")));
        hero.setAttribute("data-custom-cursor", "");
      }
      if (!reducedMotion.matches) {
        setTargets(event.clientX, event.clientY);
        invalidate();
      }
      if (event.pointerType === "touch") touchTimer = setTimeout(reset, 1500);
    };
    const leave = (event: PointerEvent) => { if (event.pointerType !== "touch") reset(); };
    const layoutChanged = () => {
      if (pointerPosition) {
        const bounds = hero.getBoundingClientRect();
        if (pointerPosition.y < bounds.top || pointerPosition.y > bounds.bottom) { reset(); return; }
        setTargets(pointerPosition.x, pointerPosition.y);
        invalidate();
      }
    };
    const stop = () => {
      reset();
      cancelAnimationFrame(frame);
      frame = 0;
      poses.forEach(pose => { pose.x = 0; pose.y = 0; });
      paint();
      host.dataset.motion = "idle";
    };
    const visibility = () => { if (document.hidden) stop(); };
    const motionPreferenceChanged = () => { if (reducedMotion.matches) stop(); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Tab" || event.key === "Escape") reset(); };
    const demo = () => {
      setAnnouncement(reducedMotion.matches ? "Hello from Mellon! Motion is paused to respect your preferences." : "Mellon says hello! Move your cursor around and watch his eyes follow.");
      if (!reducedMotion.matches) {
        pointerPosition = null;
        clearTimeout(touchTimer);
        demoStart = performance.now();
        invalidate();
      }
    };
    const resize = new ResizeObserver(layoutChanged);
    resize.observe(artwork);
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) stop();
    });
    intersection.observe(host);
    hero.addEventListener("pointermove", pointer, { passive: true });
    hero.addEventListener("pointerdown", pointer, { passive: true });
    hero.addEventListener("pointerleave", leave);
    hero.addEventListener("pointercancel", reset);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", reset);
    window.addEventListener("scroll", layoutChanged, { passive: true });
    window.addEventListener("mellon:demo", demo);
    reducedMotion.addEventListener("change", motionPreferenceChanged);
    finePointer.addEventListener("change", hideCursor);
    return () => {
      alive = false;
      clearTimeout(touchTimer);
      cancelAnimationFrame(frame);
      hideCursor();
      resize.disconnect(); intersection.disconnect();
      hero.removeEventListener("pointermove", pointer);
      hero.removeEventListener("pointerdown", pointer);
      hero.removeEventListener("pointerleave", leave);
      hero.removeEventListener("pointercancel", reset);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", reset);
      window.removeEventListener("scroll", layoutChanged);
      window.removeEventListener("mellon:demo", demo);
      reducedMotion.removeEventListener("change", motionPreferenceChanged);
      finePointer.removeEventListener("change", hideCursor);
    };
  }, []);

  return <>
    <div ref={hostRef} className={styles.mascotStage} data-status={status} data-renderer="logo" data-motion="idle" role="img" aria-label="Mellon, the watermelon mascot looking toward your cursor.">
      <div ref={artworkRef} className={styles.mascotArtwork} data-mascot-body>
        <Image className={styles.mascotImage} src="/images/mellon-mascot.png" alt="" width={1312} height={1199} priority unoptimized onLoad={() => setStatus("ready")} onError={() => setStatus("fallback")} />
        <svg className={styles.eyeLayers} viewBox="0 0 1312 1199" aria-hidden="true">
          <defs>
            <radialGradient id={`${id}-white`} cx="56%" cy="60%" r="68%">
              <stop offset="0" stopColor="#fffef8" />
              <stop offset=".6" stopColor="#fffdf0" />
              <stop offset="1" stopColor="#9b916f" />
            </radialGradient>
            {eyes.map((eye, index) => <g key={index}>
              <clipPath id={`${id}-socket-${index}`}><path d={eye.aperture} /></clipPath>
              <clipPath id={`${id}-iris-${index}`}><path d={eye.iris} /></clipPath>
              <radialGradient id={`${id}-green-${index}`} cx="48%" cy="40%" r="64%">
                <stop offset="0" stopColor="#092c16" />
                <stop offset=".65" stopColor="#245e14" />
                <stop offset=".85" stopColor="#5a920b" />
                <stop offset="1" stopColor="#07150b" />
              </radialGradient>
            </g>)}
          </defs>
          {eyes.map((eye, index) => <g key={index} ref={node => { eyeRefs.current[index] = node; }} opacity="0" clipPath={`url(#${id}-socket-${index})`}>
            <path d={eye.aperture} fill={`url(#${id}-white)`} />
            <g ref={node => { pupilRefs.current[index] = node; }} data-pupil={index} transform="translate(0 0)">
              <ellipse cx={eye.x} cy={eye.irisY} rx={eye.rx} ry={eye.ry} transform={`rotate(${eye.rotation} ${eye.x} ${eye.irisY})`} fill={`url(#${id}-green-${index})`} />
              <g clipPath={`url(#${id}-iris-${index})`}>
                <image href="/images/mellon-mascot.png" width="1312" height="1199" />
              </g>
            </g>
          </g>)}
        </svg>
      </div>
    </div>
    <div ref={ringRef} className={styles.cursorRing} data-cursor-ring aria-hidden="true"><span /></div>
    <p className={styles.srOnly} role="status">{announcement}</p>
  </>;
}
