"use client";
import styles from "./admin.module.css";
export default function AdminError({ reset }: { reset: () => void }) {
  return <section className={styles.empty}><h1>We couldn’t load your workspace.</h1><p>Check the database connection and CMS setup, then try again. Your saved listings are unchanged.</p><button className={styles.button} onClick={reset}>Try again</button></section>;
}
