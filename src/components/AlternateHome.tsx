import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import HomeVersions from "./HomeVersions";
import HeroInteractions from "./HeroInteractions";
import AnimatedMascot from "./AnimatedMascot";
import LandingSections from "./LandingSections";
import styles from "./alternate-home.module.css";

function SeedAccents() {
  return <span className={styles.seeds} aria-hidden="true">{[0,1,2,3,4].map(seed => <i key={seed} />)}</span>;
}

function WatermelonPhoto({ src, alt, wide = false }: { src: string; alt: string; wide?: boolean }) {
  return <div className={`${styles.photoFrame} ${wide ? styles.widePhoto : ""}`}>
    <span className={styles.outerRind} aria-hidden="true" />
    <span className={styles.innerRind} aria-hidden="true" />
    <div className={styles.photoCrop}><Image src={src} alt={alt} fill sizes={wide ? "(max-width: 767px) 85vw, (max-width: 1440px) 44vw, 620px" : "(max-width: 767px) 40vw, (max-width: 1440px) 24vw, 335px"} loading="eager" /></div>
    <SeedAccents />
    {wide && <div className={styles.photoMascot}><AnimatedMascot /></div>}
  </div>;
}

export default function AlternateHome({ version }: { version: 2 | 3 }) {
  const bigPlans = version === 2;
  return <main className={`${styles.page} ${bigPlans ? styles.home2 : styles.home3}`}>
    <section className={styles.hero} data-hero id="home" aria-label="Welcome to Mellon">
      <a className={styles.skipLink} href="#hero-title">Skip to content</a>
      <header className={styles.header}>
        <a href={`/${bigPlans ? "home2" : "home3"}`} className={styles.wordmark} aria-label="Mellon Real Estate home">mellon<span>REAL ESTATE</span></a>
        <nav className={styles.navigation} id="main-navigation" aria-label="Main navigation">
          <a href="#mellon-properties">New listings</a>
          <a href="#seller-support">{bigPlans ? "Seller support" : "Selling"}</a>
          <a href="#development">Development</a>
          <a href="#ian">{bigPlans ? "Meet Ian" : "About Ian"}</a>
          <HomeVersions current={bigPlans ? "/home2" : "/home3"} />
        </nav>
        <a href="#contact" className={styles.headerContact}>{bigPlans ? "Let’s talk" : "Contact Ian"}<ArrowUpRightIcon aria-hidden="true" /></a>
        <button type="button" className={styles.menuButton} data-menu-toggle aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><span /><span /></button>
      </header>

      {bigPlans ? <div className={styles.chapterHero}>
        <p className={styles.chapterEyebrow}>BAKERSFIELD + SHAFTER. YOUR KIND OF PLACE.</p>
        <div className={styles.triptych}>
          <figure className={styles.sidePhoto}><WatermelonPhoto src="/images/properties/hero-kitchen.png" alt="A sunlit kitchen with an oak island, white cabinetry and brass pendants" /><figcaption>01 ROOM TO MAKE IT YOURS</figcaption></figure>
          <div className={styles.chapterMessage}>
            <h1 id="hero-title" tabIndex={-1}>BIG PLANS.<br />FRESH<br />STARTS.</h1>
            <p>A new home. A new direction.<br />A local guide for whatever comes next.</p>
            <div className={styles.chapterActions}><a className={styles.button} href="#mellon-properties">Find your next home<ArrowUpRightIcon aria-hidden="true" /></a><AnimatedMascot /></div>
          </div>
          <figure className={styles.sidePhoto}><WatermelonPhoto src="/images/properties/hero-exterior.png" alt="A welcoming California home with a landscaped walkway and warm entryway" /><figcaption>02 A PLACE TO PUT DOWN ROOTS</figcaption></figure>
        </div>
        <div className={styles.signoff}><span>PEOPLE FIRST.</span><span>POSSIBILITIES AHEAD.</span><span>MELLON BY YOUR SIDE.</span></div>
      </div> : <div className={styles.welcomeHero}>
        <div className={styles.welcomeMessage}>
          <p className={styles.eyebrow}>BAKERSFIELD + SHAFTER REAL ESTATE</p>
          <h1 id="hero-title" tabIndex={-1}>A fresh place<br />to call home.</h1>
          <p className={styles.description}>Find your next home with local guidance from Ian Mellon.</p>
          <a className={styles.button} href="#mellon-properties">Explore homes<ArrowUpRightIcon aria-hidden="true" /></a>
        </div>
        <WatermelonPhoto wide src="/images/generated.png" alt="A welcoming single-story home with a landscaped front yard" />
      </div>}
      <HeroInteractions />
    </section>

    <div className={styles.shortcuts} aria-label="Choose your next step">
      <a href="#mellon-properties"><span>{bigPlans ? "I’m buying." : "Buying"}{bigPlans && <small>Let’s find your place.</small>}</span>{!bigPlans && <small>Explore homes</small>}<ArrowUpRightIcon aria-hidden="true" /></a>
      <a href={bigPlans ? "#seller-support" : "#contact"}><span>{bigPlans ? "I’m selling." : "Selling"}{bigPlans && <small>Let’s see your options.</small>}</span>{!bigPlans && <small>Contact Ian</small>}<ArrowUpRightIcon aria-hidden="true" /></a>
      <a href="#development"><span>{bigPlans ? "I’m looking ahead." : "Development"}{bigPlans && <small>Let’s explore what’s next.</small>}</span>{!bigPlans && <small>View development</small>}<ArrowUpRightIcon aria-hidden="true" /></a>
    </div>
    <LandingSections variant={bigPlans ? "home2" : "home3"} />
  </main>;
}
