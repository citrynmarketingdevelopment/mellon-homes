"use client";
import { useEffect, useRef } from "react";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import styles from "@/app/admin/admin.module.css";

export default function ConfirmDelete({ title, busy, error, onCancel, onConfirm }: { title: string; busy: boolean; error?: string; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current!;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node.showModal();
    return () => { node.close(); if (opener?.isConnected) opener.focus(); };
  }, []);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={event => { event.preventDefault(); if (!busy) onCancel(); }}>
    <span className={styles.dangerIcon}><TrashIcon aria-hidden="true" /></span><h2 id="delete-title">Delete this listing?</h2><p id="delete-description"><strong>{title}</strong> will be permanently removed from your listings and the website. This can’t be undone.</p>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.actions}><button type="button" className={styles.secondary} disabled={busy} onClick={onCancel}>Keep listing</button><button type="button" className={styles.danger} disabled={busy} onClick={onConfirm}>{busy ? "Deleting…" : "Yes, delete listing"}</button></div>
  </dialog>;
}
