import type { Metadata } from "next";
import Link from "next/link";
import styles from "./admin.module.css";

export const metadata: Metadata = { title: "Mellon | Listing manager", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.cms}><header className={styles.header}><Link href="/admin" className={styles.brand}>mellon <span>LISTING MANAGER</span></Link><Link href="/">View website ↗</Link></header><main className={styles.main}>{children}</main></div>;
}
