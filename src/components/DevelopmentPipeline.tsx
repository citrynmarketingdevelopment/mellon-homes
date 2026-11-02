import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import styles from "./landing.module.css";
import { HammerIcon } from "@phosphor-icons/react/dist/ssr/Hammer";
import { HouseLineIcon } from "@phosphor-icons/react/dist/ssr/HouseLine";
import { FilesIcon } from "@phosphor-icons/react/dist/ssr/Files";
import heritage from "./development.module.css";

import { getPipeline } from "@/lib/cms/development";
import { stageNames, type DevelopmentProject } from "@/lib/cms/development-data";

const icons = [HammerIcon, HouseLineIcon, FilesIcon];

export default async function DevelopmentPipeline({ expanded = false, projects: supplied }: { expanded?: boolean; projects?: DevelopmentProject[] }) {
  let projects = supplied;
  try { projects ??= (await getPipeline()).projects; }
  catch { return <p>Project updates are temporarily unavailable. Contact Ian for current opportunities.</p>; }
  const stages = Object.entries(stageNames).map(([id, name]) => ({ id, name, projects: projects.filter(project => project.stage === id) }));
  if (expanded) return <div className={heritage.pipeline}>
    {stages.map((stage, index) => {
      const Icon = icons[index];
      return <article id={`stage-${stage.id}`} className={heritage.stage} key={stage.id}>
        <div className={heritage.stageHeading}><Icon aria-hidden="true" /><h3>{stage.name}</h3><span>{stage.projects.length} projects</span></div>
        {stage.id === "planning" && <p className={heritage.reviewNote}>Submitted for review. Approval timing remains subject to agency review.</p>}
        {!stage.projects.length && <p className={styles.pipelineEmpty}>No projects at this stage. Check back for updates.</p>}<ul>{stage.projects.map(project => <li key={project.id}><span>{project.address}</span><span>{project.type}</span><a href="#contact" aria-label={`Ask Ian about ${project.address}`}><ArrowUpRightIcon aria-hidden="true" /></a>{project.description && <p className={heritage.projectDescription}>{project.description}</p>}</li>)}</ul>
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
      {!stage.projects.length && <p className={styles.pipelineEmpty}>No projects at this stage. Check back for updates.</p>}<ul>{stage.projects.map(project => <li key={project.id}><span>{project.address}</span><span>{project.type}</span>{project.description && <p className={styles.projectDescription}>{project.description}</p>}</li>)}</ul>
      <a href="#contact" className={styles.stageLink} aria-label={`Ask Ian about projects ${stage.name.toLowerCase()}`}><ArrowUpRightIcon aria-hidden="true" /></a>
    </article>; })}
  </div>;
}
