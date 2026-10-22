"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { BuildingsIcon } from "@phosphor-icons/react/dist/ssr/Buildings";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import SignOut from "./SignOut";
import styles from "@/app/admin/admin.module.css";

const navigation = [
  { href: "/admin", label: "Overview", Icon: SquaresFourIcon },
  { href: "/admin/listings", label: "Listings", Icon: BuildingsIcon },
  { href: "/admin/listings/new", label: "New listing", Icon: PlusIcon },
  { href: "/admin/password", label: "Account", Icon: GearSixIcon },
];
export default function AdminShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } | null }) {
  const path = usePathname();
  const isLogin = path === "/admin/login";
  const current = path === "/admin/listings/new" ? "New listing" : path.startsWith("/admin/listings/") ? "Edit listing" : navigation.find(item => item.href === path)?.label ?? "Workspace";
  const initials = (user?.name ?? "Mellon Admin").split(/\s+/).map(word => word[0]).slice(0, 2).join("");
  return <div className={`${styles.cms} ${isLogin ? styles.authShell : ""}`}>
    <a className={styles.skipLink} href="#admin-content">Skip to content</a>
    {isLogin ? <header className={styles.authHeader}><Link href="/" className={styles.brand}>mellon<span>REAL ESTATE</span></Link><Link href="/" className={styles.websiteLink}>Back to website <ArrowUpRightIcon aria-hidden="true" /></Link></header> : <>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand} aria-label="Mellon workspace">mellon<span>THE WORKSPACE</span></Link>
        <p className={styles.navLabel}>MANAGE YOUR SPACE</p>
        <nav className={styles.navigation} aria-label="Admin navigation">
          {navigation.map(({ href, label, Icon }) => {
            const active = href === "/admin/listings" ? path.startsWith(href) && path !== "/admin/listings/new" : path === href;
            return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon weight={active ? "fill" : "regular"} aria-hidden="true" /><span>{label}</span>{active && <span className={styles.activeDot} aria-hidden="true" />}</Link>;
          })}
        </nav>
        <div className={styles.sidebarBottom}><div className={styles.sidebarNote}><span className={styles.seedMark} aria-hidden="true" /><strong>A little care.<br />A fresh beginning.</strong><p>Your properties, thoughtfully presented.</p><Link href="/" className={styles.websiteLink}>View website <ArrowUpRightIcon aria-hidden="true" /></Link></div><SignOut /></div>
      </aside>
      <header className={styles.topbar}><div><span className={styles.desktopOnly}>Workspace <span className={styles.crumbSlash}>/</span> </span><strong>{current}</strong></div><div className={styles.profile}><span className={styles.profileName}>{user?.name ?? "Administrator"}<small>Administrator</small></span><span className={styles.avatar} aria-hidden="true">{initials}</span></div></header>
    </>}
    <main id="admin-content" tabIndex={-1} className={styles.main}>{children}</main>
  </div>;
}
