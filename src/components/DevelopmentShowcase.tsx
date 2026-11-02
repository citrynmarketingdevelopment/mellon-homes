import { getPipeline } from "@/lib/cms/development";
import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { BuildingsIcon } from "@phosphor-icons/react/dist/ssr/Buildings";
import { KeyIcon } from "@phosphor-icons/react/dist/ssr/Key";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr/MapPin";
import DevelopmentPipeline from "./DevelopmentPipeline";
import Reveal from "./Reveal";
import styles from "./development.module.css";

export default async function DevelopmentShowcase() {
  let pipeline;
  try { pipeline = await getPipeline(); } catch { return <section id="development" className={styles.section}><div className={styles.wrap}><h2>Development pipeline</h2><p>Project updates are temporarily unavailable. <a href="#contact">Contact Ian for current opportunities.</a></p></div></section>; }
  const projects = pipeline.projects;
  return <section id="development" tabIndex={-1} className={styles.section} aria-labelledby="development-title">
    <div className={styles.wrap}>
      <Reveal className={styles.intro}>
        <p className={styles.eyebrow}>NEW CONSTRUCTION · KERN COUNTY</p>
        <h2 id="development-title">Good things<br />are <em>growing.</em></h2>
        <p className={styles.lead}>Explore our growing portfolio of newly built multifamily properties available for sale, with opportunities for investors and owner-occupants alike.</p>
      </Reveal>
      <Reveal className={styles.showcase}>
        <figure className={styles.exterior}>
          <Image src="/images/home/front.webp" alt="White stucco home with dark roof trim and a landscaped front entrance at sunset." width={1280} height={470} sizes="(max-width: 767px) 90vw, 75vw" />
          <figcaption>Room to live. Room to invest.</figcaption>
        </figure>
        <div className={styles.interiors}>
          {[
            ["patio", "Covered patio beside the white stucco home at sunset.", "Space to unwind"],
            ["entry", "Front entrance and driveway framed by drought-tolerant landscaping.", "A welcoming arrival"],
            ["covered-patio", "Sheltered outdoor seating area with dark roof trim.", "Indoor-outdoor living"],
            ["side", "Side walkway and exterior of the home in warm evening light.", "A closer look"],
          ].map(([photo, alt, caption]) => <figure key={photo}><Image src={`/images/home/${photo}.webp`} alt={alt} width={600} height={400} sizes="(max-width: 767px) 44vw, 20vw" /><figcaption>{caption}</figcaption></figure>)}
        </div>
      </Reveal>
      <p className={styles.imageNote}>Individual plans, finishes, and availability vary by property.</p>
      <div className={styles.benefits}>
        <div><BuildingsIcon aria-hidden="true" /><span>Purpose-built<br /><strong>Multifamily opportunities</strong></span></div>
        <div><KeyIcon aria-hidden="true" /><span>A place of your own<br /><strong>Owner-occupant potential</strong></span></div>
        <div><MapPinIcon aria-hidden="true" /><span>Locally rooted<br /><strong>Kern County locations</strong></span></div>
      </div>
      <Reveal className={styles.pipelineOverview}>
        <div><p className={styles.eyebrow}>THE DEVELOPMENT PIPELINE</p><h3>See what’s taking shape.</h3><p>From plans on paper to homes under construction. Find your opportunity at every stage.</p></div>
        <dl className={styles.stats}><div><dt>Total projects</dt><dd>{projects.length}</dd></div><div><dt>Fourplexes</dt><dd>{projects.filter(project => project.type.toLowerCase() === "fourplex").length}</dd></div><div><dt>Cities</dt><dd>{new Set(projects.map(project => project.city.trim().toLowerCase())).size}</dd></div></dl>
      </Reveal>
      <Reveal><DevelopmentPipeline expanded projects={projects} /></Reveal>
      <div className={styles.closing}><p>Let’s find the right fit for your next investment.</p><a href="#contact">Ask about available properties <ArrowUpRightIcon aria-hidden="true" /></a></div>
      <p className={styles.disclosure}>Bakersfield & Shafter · Project stages supplied by Mellon. Contact Ian for current status, pricing, and availability.</p>
    </div>
  </section>;
}
