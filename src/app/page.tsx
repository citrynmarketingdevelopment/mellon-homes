import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { PlayIcon } from "@phosphor-icons/react/dist/ssr/Play";
import MascotScene from "@/components/MascotScene";
import HeroInteractions from "@/components/HeroInteractions";
import LandingSections from "@/components/LandingSections";
import WatermelonSeeds from "@/components/WatermelonSeeds";
import HomeVersions from "@/components/HomeVersions";
import styles from "@/components/hero.module.css";

// Listings reflect publishing and unpublishing immediately, without a redeploy.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main>
    <section className={styles.hero} id="home" data-hero aria-label="Welcome to Mellon">
      <a className={styles.skipLink} href="#hero-title">Skip to content</a>
      <header className={styles.header}>
        <a href="#home" className={styles.wordmark} aria-label="Mellon Real Estate home">
          <span>mellon<span className={styles.wordmarkSub}>REAL ESTATE</span></span>
        </a>
        <nav className={styles.navigation} id="main-navigation" aria-label="Main navigation">
          <a href="#mellon-properties">Buy</a>
          <a href="#seller-support">Sell</a>
          <a href="#development">Development</a>
          <a href="#ian">Meet Ian</a>
          <HomeVersions current="/" />
        </nav>
        <a href="#contact" className={styles.headerContact}>Let’s talk <ArrowUpRightIcon aria-hidden="true" /></a>
        <button type="button" className={styles.menuButton} data-menu-toggle aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><span /><span /></button>
      </header>

      <section className={styles.composition} aria-labelledby="hero-title">
        <WatermelonSeeds />
        <div className={styles.intro}>
          <p className={styles.eyebrow}>BAKERSFIELD + SHAFTER REAL ESTATE</p>
          <h1 id="hero-title" tabIndex={-1}>A FRESH<br />SLICE OF<br />HOME.</h1>
          <p className={styles.description}>Fresh possibilities. Local guidance.<br />A place to call your own.</p>
          <div className={styles.actions}>
            <a className={`${styles.heroButton} ${styles.primaryButton}`} href="#mellon-properties">Find your home <ArrowRightIcon aria-hidden="true" /></a>
            <button type="button" className={`${styles.heroButton} ${styles.glassButton}`} data-mascot-demo>Meet Mellon <PlayIcon weight="fill" aria-hidden="true" /></button>
          </div>
        </div>
        <div className={styles.rindBackdrop} aria-hidden="true" />
        <MascotScene />
        <p className={styles.heroSignoff}>PEOPLE. PROPERTIES. SOLUTIONS.</p>
      </section>
      <HeroInteractions />
    </section>
    <LandingSections />
    </main>
  );
}
