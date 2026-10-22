import Link from "next/link";
import { requireAdmin } from "@/lib/cms/access";
import ChangePassword from "@/components/cms/ChangePassword";
import styles from "../admin.module.css";
import SignOut from "@/components/cms/SignOut";

export default async function PasswordPage() {
  await requireAdmin();
  return <section className={styles.login}><Link href="/admin" className={styles.back}>← Overview</Link><p className={styles.eyebrow}>YOUR ACCOUNT</p><h1>Change password</h1><p>Keep your workspace securely yours.</p><ChangePassword /><div className={styles.mobileOnly}><SignOut /></div></section>;
}
