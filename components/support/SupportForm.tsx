"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";
import {
  createSupportTicket,
  MAX_SUPPORT_IMAGES,
  MAX_SUPPORT_IMAGE_BYTES,
  SUPPORT_CATEGORIES,
  type SupportCategory,
} from "@/lib/support-api";
import { CloseIcon, LifeBuoyIcon } from "@/components/icons";

const field =
  "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring";

/**
 * Open a support ticket: what went wrong (a software bug, a stuck flow, an order/payment/account
 * problem), where, and optional screenshots. Contact details ride along server-side from the
 * account. On success we land on the ticket's own page, where the conversation lives.
 */
export function SupportForm() {
  const { t } = useI18n();
  const s = t.support;
  const router = useRouter();
  const { status } = useAuth();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "guest") router.replace("/login?next=/support");
  }, [status, router]);
  // Unmount-only: per-change cleanup would revoke URLs that survive a single-thumbnail
  // removal. Discard-site revokes (pick/remove) handle everything else.
  const previewsRef = useRef<string[]>([]);
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => () => previewsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  if (status !== "authed") {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" aria-busy />
    );
  }

  function pick(list: FileList | null) {
    if (!list) return;
    setError(null);
    const usable = Array.from(list).filter(
      (x) => x.type.startsWith("image/") && x.size <= MAX_SUPPORT_IMAGE_BYTES,
    );
    const merged = [...files, ...usable].slice(0, MAX_SUPPORT_IMAGES);
    // Dropping a too-big / non-image / over-the-limit file silently reads as a broken picker.
    if (merged.length < files.length + list.length) setError(s.form.uploadRejected);
    setFiles(merged);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews(merged.map((x) => URL.createObjectURL(x)));
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const ticket = await createSupportTicket({
        category: String(fd.get("category") ?? "OTHER") as SupportCategory,
        subject: String(fd.get("subject") ?? "").trim(),
        description: String(fd.get("description") ?? "").trim(),
        pageUrl: String(fd.get("pageUrl") ?? "").trim() || undefined,
        images: files,
      });
      router.replace(`/support/${ticket.id}`);
    } catch (err) {
      setError(
        err instanceof AuthError && err.status === 400 && err.message ? err.message : s.form.error,
      );
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-icon">
            <LifeBuoyIcon className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {s.form.title}
          </h1>
        </div>
        <Link
          href="/support/my"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {s.list.title}
        </Link>
      </div>
      <p className="mt-3 max-w-2xl text-sm text-muted">{s.form.intro}</p>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">{s.form.category}</span>
            <select name="category" required defaultValue="SOFTWARE_BUG" className={field}>
              {SUPPORT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {s.categories[c] ?? c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">{s.form.subject}</span>
            <input name="subject" required maxLength={150} placeholder={s.form.subjectPlaceholder} className={field} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">{s.form.description}</span>
          <textarea
            name="description"
            required
            rows={5}
            maxLength={4000}
            placeholder={s.form.descriptionPlaceholder}
            className={field}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">{s.form.pageUrl}</span>
          <input name="pageUrl" dir="ltr" placeholder={s.form.pageUrlPlaceholder} className={field} />
          <span className="mt-1 block text-xs text-muted">{s.form.pageUrlHint}</span>
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">{s.form.uploadHint}</span>
          <input
            ref={inputRef}
            id="support-screenshots"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => pick(e.target.files)}
            className="hidden"
          />
          <label
            htmlFor="support-screenshots"
            className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-4 py-8 text-sm font-medium text-muted transition-colors hover:border-brand hover:text-foreground"
          >
            {s.form.uploadCta} ({files.length}/{MAX_SUPPORT_IMAGES})
          </label>
          {previews.length > 0 && (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {previews.map((src, i) => (
                <li key={src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-20 w-full rounded-xl border border-border object-cover" />
                  <button
                    type="button"
                    aria-label={t.cart.remove}
                    onClick={() => {
                      URL.revokeObjectURL(previews[i]);
                      setFiles(files.filter((_, k) => k !== i));
                      setPreviews(previews.filter((_, k) => k !== i));
                    }}
                    className="absolute end-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? s.form.submitting : s.form.submit}
        </button>
      </form>
    </div>
  );
}
