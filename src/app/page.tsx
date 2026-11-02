import SiteHeader from "@/components/SiteHeader";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { PlayIcon } from "@phosphor-icons/react/dist/ssr/Play";
import MascotScene from "@/components/MascotScene";
import HeroInteractions from "@/components/HeroInteractions";
import LandingSections from "@/components/LandingSections";
import WatermelonSeeds from "@/components/WatermelonSeeds";
import styles from "@/components/hero.module.css";

// Listings reflect publishing and unpublishing immediately, without a redeploy.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
    <section className={styles.hero} id="home" data-hero aria-label="Welcome to Mellon">
      <a className={styles.skipLink} href="#hero-title">Skip to content</a>
      <SiteHeader home />

      <section className={styles.composition} aria-labelledby="hero-title">
        <WatermelonSeeds />
        <div className={styles.intro}>
          <p className={styles.eyebrow}>BAKERSFIELD & KERN COUNTY REAL ESTATE</p>
          <h1 id="hero-title" tabIndex={-1}>A FRESH<br />SLICE OF<br />HOME.</h1>
          <p className={styles.description}>Bakersfield homes. Local guidance.<br />A fresh place to call your own.</p>
          <div className={styles.actions}>
            <a className={`${styles.heroButton} ${styles.primaryButton}`} href="#mellon-properties">Find your home <ArrowRightIcon aria-hidden="true" /></a>
            <button type="button" className={`${styles.heroButton} ${styles.glassButton}`} data-mascot-demo>Meet Mellon <PlayIcon weight="fill" aria-hidden="true" /></button>
          </div>
        </div>
        <div className={styles.rindBackdrop} aria-hidden="true" />
        <MascotScene />
        <p className={styles.heroSignoff}>INVESTMENTS. PROPERTIES. SOLUTIONS.</p>
      </section>
      <HeroInteractions />
    </section>
    <LandingSections />
    </main>
  );
}
