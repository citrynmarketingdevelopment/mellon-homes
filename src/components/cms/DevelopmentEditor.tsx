"use client";
import { useEffect, useState, type FormEvent } from "react";
import { stageNames, type DevelopmentProject, type Pipeline } from "@/lib/cms/development-data";
import styles from "@/app/admin/admin.module.css";

export default function DevelopmentEditor({ initial }: { initial: Pipeline }) {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    const navigate = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (dirty && link && link.target !== "_blank" && !window.confirm("Leave without saving your pipeline changes?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", warn); document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", navigate, true); };
  }, [dirty]);
  function update(projects: DevelopmentProject[]) { setData({ ...data, projects }); setDirty(true); setMessage(""); }
  function change(id: string, changes: Partial<DevelopmentProject>) { update(data.projects.map(project => project.id === id ? { ...project, ...changes } : project)); }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/development", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      setData(result); setDirty(false); setMessage("Pipeline saved. Your changes are now visible on the website.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save. Try again."); }
    finally { setBusy(false); }
  }
  return <><div className={styles.pageHeading}><div><p className={styles.eyebrow}>SEE WHAT’S TAKING SHAPE</p><h1>Development pipeline</h1><p>Add projects, change their stage, and share more about each address. Save to update the website.</p></div></div>
    <form onSubmit={save} className={styles.pipelineEditor}>
      <fieldset disabled={busy} className={styles.fields}><legend>Projects</legend>
        {data.projects.map((project, index) => <fieldset key={project.id} className={styles.fields}><legend>Project {index + 1}</legend>
          <div className={styles.grid}><label>Address<input required minLength={3} maxLength={180} value={project.address} onChange={event => change(project.id, { address: event.target.value })} /></label><label>City<input required minLength={2} maxLength={80} value={project.city} onChange={event => change(project.id, { city: event.target.value })} /></label></div>
          <div className={styles.grid}><label>Property type<input required minLength={2} maxLength={80} value={project.type} onChange={event => change(project.id, { type: event.target.value })} /></label><label>Stage<select aria-label="Stage" value={project.stage} onChange={event => change(project.id, { stage: event.target.value as DevelopmentProject["stage"] })}>{Object.entries(stageNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label></div>
          <label>Project description<textarea rows={4} maxLength={2000} value={project.description} onChange={event => change(project.id, { description: event.target.value })} /></label>
          <button type="button" className={styles.danger} onClick={() => { if (window.confirm(`Remove ${project.address || "this project"} from the pipeline? Save to apply this change.`)) update(data.projects.filter(item => item.id !== project.id)); }}>Remove project {index + 1}</button>
        </fieldset>)}
        {!data.projects.length && <p>No projects. Add one below, or save to clear the public pipeline.</p>}
        <button type="button" className={styles.secondary} disabled={data.projects.length >= 100} onClick={() => update([...data.projects, { id: crypto.randomUUID(), address: "", city: "Bakersfield", type: "", stage: "construction", description: "" }])}>Add project</button>
      </fieldset>
      {error && <p role="alert" className={styles.error}>{error}</p>}{message && <p role="status" className={styles.success}>{message}</p>}
      <button className={styles.button} disabled={busy}>{busy ? "Saving…" : "Save pipeline"}</button>
    </form></>;
}
