import styles from "./admin.module.css";
export default function AdminLoading() {
  return <div className={styles.loading} role="status" aria-live="polite"><span className={styles.eyebrow}>MELLON WORKSPACE</span><h1>Getting things ready…</h1><p>Your properties are on their way.</p><div className={styles.loadingBars} aria-hidden="true"><span /><span /><span /></div></div>;
}
