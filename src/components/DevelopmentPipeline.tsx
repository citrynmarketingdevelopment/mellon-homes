import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import styles from "./landing.module.css";
import { HammerIcon } from "@phosphor-icons/react/dist/ssr/Hammer";
import { HouseLineIcon } from "@phosphor-icons/react/dist/ssr/HouseLine";
import { FilesIcon } from "@phosphor-icons/react/dist/ssr/Files";

const icons = [HammerIcon, HouseLineIcon, FilesIcon];

// Names and stages are transcribed from the supplied development flyer.
const stages = [
  { id: "construction", name: "Under construction", projects: [["1806 Williams Street", "Fourplex"], ["2209 Palm Street", "Fourplex"], ["Rodriguez Street, Shafter", "Duplex"]] },
  { id: "ready", name: "Ready to build", projects: [["1307 Grace Street", "Triplex"], ["Martinez Street, Shafter", "Duplex"]] },
  { id: "planning", name: "In plan check", projects: [["215 Clifton Street", "Duplex"], ["1311 Eureka Street", "Triplex"], ["1231 Quincy Street", "Duplex"]] },
];

export default function DevelopmentPipeline() {
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
