import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import styles from "./landing.module.css";
import { HammerIcon } from "@phosphor-icons/react/dist/ssr/Hammer";
import { HouseLineIcon } from "@phosphor-icons/react/dist/ssr/HouseLine";
import { FilesIcon } from "@phosphor-icons/react/dist/ssr/Files";
import heritage from "./development.module.css";

const icons = [HammerIcon, HouseLineIcon, FilesIcon];

// Names and stages are transcribed from the supplied development flyer.
export const stages = [
  { id: "construction", name: "Under construction", projects: [["1806 Williams Street", "Fourplex"], ["2209 Palm Street", "Fourplex"], ["Rodriguez Street, Shafter", "Duplex"]] },
  { id: "ready", name: "Ready to build", projects: [["1307 Grace Street", "Triplex"], ["Martinez Street, Shafter", "Duplex"]] },
  { id: "planning", name: "In plan check", projects: [["215 Clifton Street", "Duplex"], ["1311 Eureka Street", "Triplex"], ["1231 Quincy Street", "Duplex"]] },
];

export default function DevelopmentPipeline({ expanded = false }: { expanded?: boolean }) {
  if (expanded) return <div className={heritage.pipeline}>
    {stages.map((stage, index) => {
      const Icon = icons[index];
      return <article id={`stage-${stage.id}`} className={heritage.stage} key={stage.id}>
        <div className={heritage.stageHeading}><Icon aria-hidden="true" /><h3>{stage.name}</h3><span>{stage.projects.length} projects</span></div>
        {stage.id === "planning" && <p className={heritage.reviewNote}>Submitted for review. Approval timing remains subject to agency review.</p>}
        <ul>{stage.projects.map(([address, type]) => <li key={address}><span>{address}</span><span>{type}</span><a href="#contact" aria-label={`Ask Ian about ${address}`}><ArrowUpRightIcon aria-hidden="true" /></a></li>)}</ul>
        <a className={heritage.stageLink} href="#contact" aria-label={`Ask Ian about projects ${stage.name.toLowerCase()}`}>Discuss these opportunities <ArrowUpRightIcon aria-hidden="true" /></a>
      </article>;
    })}
  </div>;
  return <div className={styles.pipeline}>
    {stages.map((stage, index) => {
      const Icon = icons[index];
      return <article key={stage.id} id={`stage-${stage.id}`} className={styles.stage}>
      <Icon className={styles.stageIcon} aria-hidden="true" />
      <p className={styles.eyebrow}>STAGE 0{index + 1}</p>
      <h3>{stage.name}</h3>
      <ul>{stage.projects.map(([address, type]) => <li key={address}><span>{address}</span><span>{type}</span></li>)}</ul>
      <a href="#contact" className={styles.stageLink} aria-label={`Ask Ian about projects ${stage.name.toLowerCase()}`}><ArrowUpRightIcon aria-hidden="true" /></a>
    </article>; })}
  </div>;
}
