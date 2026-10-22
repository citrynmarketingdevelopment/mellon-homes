import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { HouseLineIcon } from "@phosphor-icons/react/dist/ssr/HouseLine";
import { FilesIcon } from "@phosphor-icons/react/dist/ssr/Files";
import { UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { HandshakeIcon } from "@phosphor-icons/react/dist/ssr/Handshake";
import DevelopmentPipeline from "./DevelopmentPipeline";
import Reveal from "./Reveal";
import styles from "./landing.module.css";
import PublishedListings from "./PublishedListings";
import listingStyles from "./listings.module.css";

const specialties = [
  { title: "Pre-foreclosure & delinquency", description: "Behind on payments? Talk through your property, your timeline, and the questions to raise with your lender.", Icon: HouseLineIcon },
  { title: "Probate", description: "An inherited property brings decisions. Get practical support for the real estate side of the process.", Icon: FilesIcon },
  { title: "Divorce", description: "A balanced, professional approach to the property, with clear communication and respect for everyone involved.", Icon: UsersIcon },
  { title: "Short sales", description: "Explore a possible sale and understand the next steps to discuss with your lender.", Icon: HandshakeIcon },
];
const steps = [
  ["Start with your story.", "Your property, your timing, your priorities."],
  ["See the possibilities.", "Clear information to help you make an informed move."],
  ["Take the next step.", "A practical direction, with personal support."],
];

export default function LandingSections() {
  return <div className={styles.landing}>
    <div className={styles.brandRibbon} aria-label="People. Properties. Solutions. Fresh starts.">
      {["People", "Properties", "Solutions", "Fresh starts"].map(word => <span key={word}>{word}<span aria-hidden="true">✳</span></span>)}
    </div>
    <section id="mellon-properties" tabIndex={-1} className={`${styles.section} ${styles.properties} ${listingStyles.homeSection}`} aria-labelledby="properties-title">
      <div className={styles.wrap}>
        <Reveal className={listingStyles.sectionHeading}>
          <div><p className={listingStyles.eyebrow}>THE MELLON COLLECTION</p><h2 id="properties-title">Fresh spaces.<br /><span>New possibilities.</span></h2></div>
          <div><p>A place to put down roots.<br />Find your next chapter with Mellon.</p><Link href="/listings" className={listingStyles.headingLink}>Explore Mellon homes <ArrowUpRightIcon aria-hidden="true" /></Link></div>
        </Reveal>
        <PublishedListings />
      </div>
    </section>
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
          {specialties.map(({ title, description, Icon }) => <article key={title}>
            <a href="#contact" aria-label={`Talk with Ian about ${title.toLowerCase()}`}>
              <Icon weight="regular" aria-hidden="true" />
              <div><h3>{title}</h3><p>{description}</p></div>
              <ArrowUpRightIcon className={styles.serviceArrow} aria-hidden="true" />
            </a>
          </article>)}
        </div>
      </Reveal>
    </section>
    <section id="development" tabIndex={-1} className={`${styles.section} ${styles.development}`} aria-labelledby="development-title">
      <div className={styles.wrap}>
        <Reveal className={`${styles.sectionHeading} ${styles.developmentHeading}`}>
          <div><p className={styles.eyebrow}>WHAT’S GROWING</p>
          <h2 id="development-title">Good things<br />are growing.</h2></div>
          <p className={styles.lead}>Explore Mellon’s development pipeline in Bakersfield and Shafter.</p>
        </Reveal>
        <Reveal><DevelopmentPipeline /></Reveal>
        <a href="#contact" className={`${styles.button} ${styles.pipelineCta}`}>Let’s talk about what’s next <ArrowUpRightIcon aria-hidden="true" /></a>
        <p className={styles.disclosure}>Project stages are shown as provided in the development flyer. Contact Ian for current status and availability.</p>
      </div>
    </section>
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
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <a href="#home" className={styles.wordmark} aria-label="Mellon, back to top">mellon</a>
        <p>Ian Mellon · California Real Estate Broker<br />DRE #01921587</p>
        <a href="#home" className={styles.backTop}>Back to top <ArrowUpRightIcon aria-hidden="true" /></a>
      </div>
    </footer>
  </div>;
}
