import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SpecialtyContactForm from "@/components/SpecialtyContactForm";
import StructuredData from "@/components/StructuredData";
import { specialties, getSpecialty } from "@/lib/specialties";
import { absoluteUrl, site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import styles from "@/components/specialty.module.css";

export const dynamicParams = false;
export const generateStaticParams = () => specialties.map(item => ({ specialty: item.slug }));
type Props = { params: Promise<{ specialty: string }> };
export async function generateMetadata({ params }: Props) {
  const item = getSpecialty((await params).specialty); if (!item) notFound();
  return pageMetadata(item.title, item.description, `/${item.slug}`, `/images/specialties/${item.image}.webp`);
}
export default async function SpecialtyPage({ params }: Props) {
  const item = getSpecialty((await params).specialty); if (!item) notFound();
  const url = absoluteUrl(`/${item.slug}`);
  return <div id="home" className={styles.page}>
    <a href="#specialty-title" className={styles.skip}>Skip to content</a><SiteHeader />
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "Service", "@id": `${url}#service`, name: item.heading, description: item.description, url, provider: { "@id": `${site.url}/#business` }, areaServed: { "@type": "AdministrativeArea", name: "Kern County, California" }, serviceType: item.label },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: site.url }, { "@type": "ListItem", position: 2, name: item.label, item: url }] },
      { "@type": "FAQPage", mainEntity: item.faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
    ] }} />
    <main>
      <section className={styles.hero} aria-labelledby="specialty-title"><div className={styles.wrap}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span aria-hidden="true">/</span><span>{item.label}</span></nav>
        <div className={styles.heroGrid}><div><p className={styles.eyebrow}>SPECIALTY REAL ESTATE · KERN COUNTY</p><h1 id="specialty-title" tabIndex={-1}>{item.heading}</h1><p className={styles.promise}>{item.promise}</p><p className={styles.intro}>{item.intro}</p><div className={styles.actions}><a className={styles.button} href="#specialty-contact">Talk with Ian<ArrowUpRightIcon aria-hidden="true" /></a><a className={styles.call} href={site.phoneHref}>{site.phone}</a></div></div>
          <figure className={styles.heroImage}><Image src={`/images/specialties/${item.image}.webp`} alt={item.imageAlt} width={1536} height={1024} priority sizes="(max-width: 767px) 90vw, 47vw" /><figcaption>A fresh perspective. A local guide.</figcaption></figure>
        </div><p className={styles.imageNote}>AI-generated illustrative imagery, not a property listing or a client home.</p>
      </div></section>
      <div className={styles.trust}><span>Ian Mellon · California Real Estate Broker</span><span>DRE #{site.license}</span><span>Bakersfield & Kern County</span></div>
      <section className={`${styles.section} ${styles.wrap}`} aria-labelledby="overview-title"><div className={styles.overview}><div><p className={styles.eyebrow}>REAL ESTATE. WITH A REAL PERSON.</p><h2 id="overview-title">{item.overviewTitle}</h2></div><p>{item.overview}</p></div>
        <div className={styles.services}>{item.services.map(service => <article key={service.title}><CheckCircleIcon aria-hidden="true" /><h3>{service.title}</h3><p>{service.text}</p></article>)}</div>
      </section>
      <section className={styles.process} aria-labelledby="process-title"><div className={`${styles.wrap} ${styles.processGrid}`}><div><p className={styles.eyebrow}>ONE CONVERSATION AT A TIME</p><h2 id="process-title">A little clarity.<br /><em>A next step.</em></h2><p>You bring your questions. Ian helps you organize the real estate decisions ahead.</p><a href="#specialty-contact" className={styles.goldButton}>Start a conversation<ArrowUpRightIcon aria-hidden="true" /></a></div><ol>{item.steps.map((step, index) => <li key={step.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></div></section>
      <section className={`${styles.section} ${styles.wrap} ${styles.prepare}`} aria-labelledby="prepare-title"><div><p className={styles.eyebrow}>A GOOD PLACE TO START</p><h2 id="prepare-title">Bring what you have.<br />We’ll start there.</h2><p>You do not need every document for an initial conversation. These details can help make it useful.</p></div><ul>{item.checklist.map(text => <li key={text}><CheckCircleIcon aria-hidden="true" />{text}</li>)}</ul></section>
      <section className={`${styles.wrap} ${styles.faq}`} aria-labelledby="faq-title"><div><p className={styles.eyebrow}>YOUR QUESTIONS, ANSWERED</p><h2 id="faq-title">Let’s make it clearer.</h2></div><div>{item.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<PlusIcon aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}<p className={styles.resource}>Helpful resource: <a href={item.resource.href} target="_blank" rel="noreferrer">{item.resource.label} ↗</a></p><p className={styles.note}>{item.note}</p></div></section>
      <section id="specialty-contact" className={styles.contactSection} aria-labelledby="contact-title" tabIndex={-1}><div className={`${styles.wrap} ${styles.contactGrid}`}><div><p className={styles.eyebrow}>LET’S TALK ABOUT YOUR OPTIONS</p><h2 id="contact-title">Your next chapter<br />starts with a<br /><em>conversation.</em></h2><p>Tell Ian a little about your property and what you are hoping to do next.</p><a href={site.phoneHref}>{site.phone}<ArrowUpRightIcon aria-hidden="true" /></a><a href={`mailto:${site.email}`}>{site.email}<ArrowUpRightIcon aria-hidden="true" /></a></div><SpecialtyContactForm specialty={item.slug} /></div></section>
      <section className={`${styles.wrap} ${styles.related}`} aria-label="Related specialties"><p className={styles.eyebrow}>SUPPORT FOR OTHER SITUATIONS</p><div>{specialties.filter(other => other.slug !== item.slug).map(other => <Link key={other.slug} href={`/${other.slug}`}>{other.label}<ArrowUpRightIcon aria-hidden="true" /></Link>)}</div></section>
    </main><SiteFooter />
  </div>;
}
