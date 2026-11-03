import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StructuredData from "@/components/StructuredData";
import { ian } from "@/lib/ian";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import styles from "./about-ian.module.css";

const description = "Meet Ian Mellon, founder of MELLON Real Estate. Personal guidance for homes, investment property, multifamily, and development in Bakersfield and Kern County.";

export const metadata = pageMetadata("About Ian Mellon | MELLON Real Estate", description, ian.path, ian.portrait);

const profileSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": `${absoluteUrl(ian.path)}#profile`,
      url: absoluteUrl(ian.path),
      name: "About Ian Mellon",
      description,
      mainEntity: {
        "@type": "Person",
        "@id": `${site.url}/#ian-mellon`,
        name: site.broker,
        jobTitle: "California Real Estate Broker",
        image: absoluteUrl(ian.portrait),
        description: ian.biography[0],
        identifier: `DRE #${site.license}`,
        worksFor: { "@id": `${site.url}/#business` },
        telephone: site.phone,
        email: site.email,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
        { "@type": "ListItem", position: 2, name: "About Ian", item: absoluteUrl(ian.path) },
      ],
    },
  ],
};

export default function AboutIan() {
  return <div className={styles.page} id="home">
    <a className={styles.skipLink} href="#about-title">Skip to content</a>
    <SiteHeader contactHref="#about-contact" activePage="ian" />
    <StructuredData data={profileSchema} />
    <main>
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>ABOUT IAN</p>
            <h1 id="about-title" tabIndex={-1}>Hi, I’m<br />Ian Mellon.</h1>
            <p className={styles.introduction}>{ian.introduction}</p>
            <a className={styles.button} href="#about-contact">Let’s talk <ArrowUpRightIcon aria-hidden="true" /></a>
          </div>
          <div className={styles.portraitFrame}>
            <Image src={ian.portrait} alt="Ian Mellon, founder of MELLON Real Estate" width={768} height={768} sizes="(max-width: 767px) 70vw, (max-width: 1100px) 40vw, 442px" loading="eager" fetchPriority="high" className={styles.portrait} />
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.biography}`} aria-labelledby="bio-title">
        <div className={styles.profileDetails}>
          <strong>{site.broker}</strong>
          <span>Founder, MELLON Real Estate</span>
          <span>California Real Estate Broker</span>
          <span>DRE #{site.license}</span>
        </div>
        <h2 id="bio-title">A broader perspective.<br />A personal approach.</h2>
        <div className={styles.bioColumns}>
          <p className={styles.bioLead}>{ian.biography[0]}</p>
          <div>{ian.biography.slice(1).map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </section>

      <section className={styles.investment} aria-labelledby="investment-title">
        <div className={`${styles.wrap} ${styles.investmentGrid}`}>
          <figure className={styles.planningPhoto}>
            <Image src="/images/ian/property-planning.webp" alt="Architectural scale model of a small multifamily property resting on floor plans" width={1536} height={1024} sizes="(max-width: 767px) 90vw, 45vw" />
            <figcaption>An illustrative look at property planning and potential.</figcaption>
          </figure>
          <div className={styles.investmentCopy}>
            <h2 id="investment-title">Seeing the possibilities<br />in a property.</h2>
            <p>{ian.investmentIntroduction}</p>
            <dl className={styles.experience}>
              {ian.experience.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}
            </dl>
            <Link className={styles.textLink} href="/#development">Explore development <ArrowUpRightIcon aria-hidden="true" /></Link>
          </div>
        </div>
        <p className={`${styles.wrap} ${styles.perspective}`}>{ian.investmentPerspective}</p>
      </section>

      <section className={`${styles.wrap} ${styles.approach}`} aria-labelledby="approach-title">
        <h2 id="approach-title">What working together feels like.</h2>
        <p className={styles.sectionIntro}>Professional, analytical, and personable. Ian believes the way you are represented should reflect the importance of the decision you are making.</p>
        <div className={styles.principles}>
          {ian.approach.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}
        </div>
      </section>

      <section className={styles.questions} aria-labelledby="questions-title">
        <div className={`${styles.wrap} ${styles.questionsGrid}`}>
          <div><h2 id="questions-title">A little more<br />about Ian.</h2><p>A few answers before<br />your first conversation.</p></div>
          <div className={styles.answers}>{ian.questions.map(item => <details key={item.question}><summary>{item.question}<PlusIcon aria-hidden="true" /></summary><p>{item.answer}</p></details>)}</div>
        </div>
      </section>

      <section id="about-contact" tabIndex={-1} className={styles.contact} aria-labelledby="contact-title">
        <div className={`${styles.wrap} ${styles.contactGrid}`}>
          <div><h2 id="contact-title">Your plans.<br />Let’s talk.</h2><p>Buying, selling, or considering an investment? Tell Ian what you have in mind. A conversation is a good place to begin.</p><div className={styles.contactLinks}><a href={site.phoneHref}>{site.phone}<ArrowUpRightIcon aria-hidden="true" /></a><a href={`mailto:${site.email}`}>{site.email}<ArrowUpRightIcon aria-hidden="true" /></a></div></div>
          <Image className={styles.contactMelon} src="/images/watermelon-slice.png" alt="" width={1040} height={548} sizes="(max-width: 767px) 160px, 280px" />
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
