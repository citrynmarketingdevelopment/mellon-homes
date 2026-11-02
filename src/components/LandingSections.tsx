import SiteFooter from "./SiteFooter";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { HouseLineIcon } from "@phosphor-icons/react/dist/ssr/HouseLine";
import { FilesIcon } from "@phosphor-icons/react/dist/ssr/Files";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { HandshakeIcon } from "@phosphor-icons/react/dist/ssr/Handshake";
import Reveal from "./Reveal";
import styles from "./landing.module.css";
import PublishedListings from "./PublishedListings";
import listingStyles from "./listings.module.css";
import HomeValuation from "./HomeValuation";
import DevelopmentShowcase from "./DevelopmentShowcase";

const specialties = [
  { href: "/pre-foreclosure-real-estate-bakersfield", title: "Pre-foreclosure & delinquency", description: "Behind on payments? Talk through your property, your timeline, and the questions to raise with your lender.", Icon: HouseLineIcon },
  { href: "/probate-real-estate-bakersfield", title: "Probate", description: "An inherited property brings decisions. Get practical support for the real estate side of the process.", Icon: FilesIcon },
  { href: "/divorce-real-estate-bakersfield", title: "Divorce", description: "A balanced, professional approach to the property, with clear communication and respect for everyone involved.", Icon: UsersIcon },
  { href: "/foreclosure-property-solutions", title: "Foreclosure property solutions", description: "Received a notice or facing a complicated property decision? Explore the real estate sale path and your next steps.", Icon: HouseLineIcon },
  { href: "/short-sale-realtor-bakersfield", title: "Short sales", description: "Explore a possible sale and understand the next steps to discuss with your lender.", Icon: HandshakeIcon },
];
const steps = [
  ["Start with your story.", "Your property, your timing, your priorities."],
  ["See the possibilities.", "Clear information to help you make an informed move."],
  ["Take the next step.", "A practical direction, with personal support."],
];

export default function LandingSections() {
  return <div className={styles.landing} data-home-variant="original">
    <div className={styles.brandRibbon} aria-label="Investments. Properties. Solutions. Fresh starts.">
      {["Investments", "Properties", "Solutions", "Fresh starts"].map(word => <span key={word}>{word}<span aria-hidden="true">✳</span></span>)}
    </div>
    <section id="mellon-properties" tabIndex={-1} className={`${styles.section} ${styles.properties} ${listingStyles.homeSection}`} aria-labelledby="properties-title">
      <div className={styles.wrap}>
        <Reveal className={listingStyles.sectionHeading}>
          <div><h2 id="properties-title">Fresh spaces.<br /><span>New possibilities.</span></h2></div>
          <div><p>A place to put down roots.<br />Find your next chapter with Mellon.</p><Link href="/listings" className={listingStyles.headingLink}>Explore Mellon homes <ArrowUpRightIcon aria-hidden="true" /></Link></div>
        </Reveal>
        <div className={styles.collectionLabel}><h3>The Mellon Collection</h3><p>Our listings. Your next chapter.</p></div>
        <PublishedListings contactHref="#contact" valuationHref="#home-value" />
      </div>
    </section>
    <HomeValuation instantAvailable={Boolean(process.env.RENTCAST_API_KEY)} />
    <section id="seller-support" tabIndex={-1} className={`${styles.section} ${styles.support}`} aria-labelledby="support-title">
      <Reveal className={`${styles.wrap} ${styles.supportGrid}`}>
        <div className={styles.supportIntroduction}>
          <p className={styles.eyebrow}>SPECIALIST SELLER SUPPORT</p>
          <h2 id="support-title">Big life changes.<br />Clear next steps.</h2>
          <p className={styles.lead}>Some moves need a little more care. Get clear information and a neutral perspective for your property situation.</p>
          <a href="#contact" className={`${styles.button} ${styles.pinkButton}`}>Let’s talk <ArrowUpRightIcon aria-hidden="true" /></a>
          <Image className={styles.supportMelon} src="/images/watermelon-slice.png" alt="" width={1040} height={548} sizes="260px" />
        </div>
        <div className={styles.services}>
          {specialties.map(({ href, title, description, Icon }) => <article key={title}>
            <Link href={href} aria-label={`Learn about ${title.toLowerCase()}`}>
              <Icon weight="regular" aria-hidden="true" />
              <div><h3>{title}</h3><p>{description}</p></div>
              <ArrowUpRightIcon className={styles.serviceArrow} aria-hidden="true" />
            </Link>
          </article>)}
        </div>
      </Reveal>
    </section>
    <DevelopmentShowcase />
    <section id="ian" tabIndex={-1} className={`${styles.section} ${styles.broker}`} aria-labelledby="ian-title">
      <Reveal className={`${styles.wrap} ${styles.brokerGrid}`}>
        <div className={styles.brokerIntroduction}>
          <p className={styles.eyebrow}>MEET YOUR BROKER</p>
          <h2 id="ian-title">Real estate.<br />With a real person.</h2>
          <p className={styles.lead}>I’m Ian Mellon. Whether you’re finding a home or navigating a complicated sale, let’s talk through your options together.</p>
          <p className={styles.credentials}><strong>Ian Mellon</strong><br />California Real Estate Broker · DRE #01921587</p>
          <a href="#contact" className={styles.button}>Get to know Ian <ArrowUpRightIcon aria-hidden="true" /></a>
        </div>
        <ol className={styles.process}>
          {steps.map(([title, description], index) => <li key={title}><span aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}
        </ol>
      </Reveal>
    </section>
    <section id="contact" tabIndex={-1} className={styles.contact} aria-labelledby="contact-title">
      <Reveal className={`${styles.wrap} ${styles.contactGrid}`}>
        <div>
          <p className={styles.eyebrow}>LET’S TALK ABOUT YOUR OPTIONS</p>
          <h2 id="contact-title">Ready for your<br />fresh start?</h2>
          <p className={styles.lead}>A private conversation. No pressure. Just a place to begin.</p>
          <div className={styles.contactLinks}><a href="tel:+16618052481">(661) 805-2481 <ArrowUpRightIcon aria-hidden="true" /></a><a href="mailto:ianmellon@yahoo.com">ianmellon@yahoo.com <ArrowUpRightIcon aria-hidden="true" /></a></div>
        </div>
        <Image className={styles.contactMelon} src="/images/watermelon-slice.png" alt="" width={1040} height={548} sizes="(max-width: 767px) 200px, 32vw" />
      </Reveal>
    </section>
    <SiteFooter />
  </div>;
}
