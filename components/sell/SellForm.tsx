"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";
import {
  createSellRequest,
  MAX_SELL_IMAGES,
  MAX_SELL_IMAGE_BYTES,
  type DeviceCondition,
} from "@/lib/sell-api";
import { fetchProfile, type Profile } from "@/lib/auth/client";
import { ChevronLeftIcon, CloseIcon } from "@/components/icons";

const field =
  "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring";

/**
 * Submit a sell request: device details, condition, and 1–4 photos (the AI estimate and the
 * team's quote both price from what they show). Contact details ride along server-side
 * from the account. On success we land on the request's own page, where the delivery
 * choice — and the arriving AI estimate — live.
 */
export function SellForm() {
  const { t } = useI18n();
  const f = t.sell.form;
  const router = useRouter();
  const { status } = useAuth();

  const [condition, setCondition] = useState<DeviceCondition>("GOOD");
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "guest") router.replace("/login?next=/sell/new");
  }, [status, router]);
  const uid = user?.uid ?? null;
  useEffect(() => {
    if (status !== "authed" || !uid) return;
    let cancelled = false;
    fetchProfile(uid)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        /* the create call enforces the gate server-side anyway */
      });
    return () => {
      cancelled = true;
    };
  }, [status, uid]);
  // Unmount-only: per-change cleanup would revoke URLs that survive a single-thumbnail
  // removal. Discard-site revokes (pick/remove) handle everything else.
  const previewsRef = useRef<string[]>([]);
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => () => previewsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  // Selling ends with us paying the customer in person — email AND phone must be on file.
  if (status === "authed" && profile && (!profile.email || !profile.phoneNumber)) {
    const g = t.sell.gate;
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">{g.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{g.body}</p>
        <Link
          href="/account"
          className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
        >
          {g.completeProfile}
        </Link>
      </div>
    );
  }

  if (status !== "authed") {
    return (
      <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" aria-busy />
    );
  }

  function pick(list: FileList | null) {
    if (!list) return;
    setError(null);
    const merged = [
      ...files,
      ...Array.from(list).filter(
        (x) => x.type.startsWith("image/") && x.size <= MAX_SELL_IMAGE_BYTES,
      ),
    ].slice(0, MAX_SELL_IMAGES);
    setFiles(merged);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews(merged.map((x) => URL.createObjectURL(x)));
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    if (files.length === 0) {
      setError(f.imagesRequired);
      return;
    }
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const created = await createSellRequest({
        deviceCondition: condition,
        productName: String(fd.get("productName") ?? "").trim(),
        brand: String(fd.get("brand") ?? "").trim(),
        model: String(fd.get("model") ?? "").trim(),
        purchaseDate: String(fd.get("purchaseDate") ?? "").trim() || undefined,
        description: String(fd.get("description") ?? "").trim(),
        images: files,
      });
      router.replace(`/sell/${created.id}`);
    } catch (err) {
      setError(
        err instanceof AuthError && err.status === 400 && err.message ? err.message : f.error,
      );
      setBusy(false);
    }
  }

  return (
    <div>
      <Link href="/sell" className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground">
        <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
        {t.sell.landing.heroTitle}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {f.title}
      </h1>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-foreground">{f.productName}</span>
            <input name="productName" required placeholder={f.productNamePlaceholder} className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">{f.brand}</span>
            <input name="brand" required placeholder={f.brandPlaceholder} className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">{f.model}</span>
            <input name="model" required placeholder={f.modelPlaceholder} className={field} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-foreground">{f.purchaseDate}</span>
            <input name="purchaseDate" type="date" className={field} />
          </label>
        </div>

        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-foreground">{f.conditionTitle}</legend>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={f.conditionTitle}>
            {(["LIKE_NEW", "GOOD", "FAIR", "POOR"] as const).map((c) => (
              <label
                key={c}
                className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors ${
                  condition === c ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  checked={condition === c}
                  onChange={() => setCondition(c)}
                  className="mt-0.5 h-4 w-4 accent-brand"
                />
                <span className="text-sm">
                  <span className="font-semibold text-foreground">{t.sell.conditions[c]}</span>
                  <span className="mt-0.5 block text-muted">{t.sell.conditionHints[c]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">{f.description}</span>
          <textarea name="description" required rows={4} placeholder={f.descriptionPlaceholder} className={field} />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">{f.uploadHintRequired}</span>
          <input
            ref={inputRef}
            id="sell-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => pick(e.target.files)}
            className="hidden"
          />
          <label
            htmlFor="sell-photos"
            className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2 px-4 py-8 text-sm font-medium text-muted transition-colors hover:border-brand hover:text-foreground"
          >
            {f.uploadCta} ({files.length}/{MAX_SELL_IMAGES})
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
          {busy ? f.submitting : f.submit}
        </button>
      </form>
    </div>
  );
}
