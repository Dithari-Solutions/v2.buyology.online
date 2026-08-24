"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { formatInt } from "@/lib/format";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { useAccountData } from "@/components/account/account-data";
import { updateProfile, uploadAvatar, AuthError, forgotPassword, resetPassword } from "@/lib/auth/client";
import { useAuth } from "@/components/auth/auth-provider";
import { GiveawayProfileCard } from "@/components/account/GiveawayBadge";
import { PhoneVerification } from "@/components/account/PhoneVerification";
import {
  cancelOrder,
  deleteAddress,
  fetchAddresses,
  fetchOrders,
  isCancellable,
  saveAddress,
  setDefaultAddress,
  type Address,
  type AddressLabel,
  type OrderStatus,
  type OrderSummary,
  requestAccountDeletion,
  recoverAccount,
} from "@/lib/account-api";
import { OtpInput } from "@/components/auth/OtpInput";
import { reverseGeocode, countryFieldValue } from "@/lib/geocode";
import { Field, Panel, SectionHead, Toggle } from "@/components/account/account-ui";
import { PhoneField } from "@/components/account/PhoneField";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { TabbyLogo, TamaraLogo } from "@/components/cart/payment-logos";
import {
  CheckIcon,
  CreditCardIcon,
  EyeIcon,
  EyeOffIcon,
  MapPinIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@/components/icons";

/* -------------------------------------------------------------- Profile -- */

export function ProfileSection() {
  const { t } = useI18n();
  const p = t.account.profile;
  const { profile, uid, reload } = useAccountData();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await updateProfile(uid, {
        firstName: String(fd.get("firstName") ?? "").trim(),
        lastName: String(fd.get("lastName") ?? "").trim(),
        phoneNumber: String(fd.get("phone") ?? "").trim() || undefined,
      });
      if (avatarFile) {
        await uploadAvatar(uid, avatarFile);
        setAvatarFile(null);
      }
      await reload();
      setSaved(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err instanceof AuthError && err.message ? err.message : t.auth.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <SectionHead title={p.title} subtitle={p.subtitle} />
      <form onSubmit={onSubmit} className="space-y-4">
        <AvatarUpload
          label={p.photo}
          hint={p.photoHint}
          chooseLabel={p.photoChoose}
          changeLabel={p.photoChange}
          removeLabel={p.photoRemove}
          initials={
            `${(profile?.firstName ?? "").charAt(0)}${(profile?.lastName ?? "").charAt(0)}`.toUpperCase() || "•"
          }
          onFile={setAvatarFile}
          currentUrl={profile?.avatarUrl}
          name="avatar"
          notAnImageLabel={p.photoNotImage}
          tooLargeLabel={p.photoTooLarge}
          previewAltLabel={p.photoPreviewAlt}
          selectedLabel={p.photoSelected}
          removedLabel={p.photoRemoved}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field key={`fn-${profile?.firstName ?? ""}`} label={p.firstName} name="firstName" defaultValue={profile?.firstName ?? ""} />
          <Field key={`ln-${profile?.lastName ?? ""}`} label={p.lastName} name="lastName" defaultValue={profile?.lastName ?? ""} />
        </div>
        {/* Email is the sign-in identity; the profile PATCH deliberately has no email field. */}
        <Field label={p.email} type="email" name="email" defaultValue={profile?.email ?? ""} readOnly disabled />
        <PhoneField
          label={p.phone}
          name="phone"
          key={`ph-${profile?.phoneNumber ?? ""}`}
          defaultValue={profile?.phoneNumber ?? ""}
          searchLabel={p.phoneSearch}
          noResultsLabel={p.phoneNoResults}
          resultsLabel={p.phoneResults}
          resultOneLabel={p.phoneResultOne}
        />
        <PhoneVerification />
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? t.auth.loading : t.account.common.save}
          </button>
          {saved && (
            <span
              role="status"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400"
            >
              <CheckIcon className="buyo-pop h-4 w-4" />
              {t.account.common.saved}
            </span>
          )}
        </div>
      </form>
      <GiveawayProfileCard />
    </Panel>
  );
}

/**
 * The honest placeholder for tabs whose feature has not migrated off the old site yet. A real
 * visitor sits behind this page now — showing them fabricated orders or cards would be worse
 * than saying so.
 */
function ComingSoonPanel({ title, subtitle }: { title: string; subtitle: string }) {
  const { t } = useI18n();
  return (
    <Panel>
      <SectionHead title={title} subtitle={subtitle} />
      <p
        role="status"
        className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted"
      >
        {t.account.comingSoon}
      </p>
    </Panel>
  );
}

/* --------------------------------------------------------------- Orders -- */


/** Buckets the 14 backend statuses into four visual tones; labels come from the dictionary. */
function statusTone(status: OrderStatus): string {
  if (status === "DELIVERED") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (status === "CANCELLED" || status === "FAILED") return "bg-surface-2 text-muted";
  if (status === "PENDING_PAYMENT") return "bg-gold/15 text-warn dark:text-gold";
  return "bg-brand-soft text-brand-icon";
}

export function OrdersSection() {
  const { t, locale } = useI18n();
  const o = t.account.orders;
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (nextPage: number) => {
    const data = await fetchOrders(nextPage, 10);
    setOrders((prev) => (nextPage === 0 || !prev ? data.content : [...prev, ...data.content]));
    setPage(data.number);
    setHasMore(data.number + 1 < data.totalPages);
  };

  useEffect(() => {
    load(0).catch(() => setError(t.auth.errors.generic));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCancel(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await cancelOrder(id);
      await load(0);
    } catch (err) {
      // The backend may refuse for a customer-readable reason — the courier already collected
      // the parcel, or it could not be reached to stop the delivery. Show its words.
      setError(
        err instanceof AuthError && err.message && err.status !== 0
          ? `${o.failed}: ${err.message}`
          : t.auth.errors.generic,
      );
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <Panel>
      <SectionHead title={o.title} subtitle={o.subtitle} />

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {orders === null ? (
        <div className="space-y-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-surface-2 motion-reduce:animate-none" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface-2 px-4 py-6 text-center text-sm text-muted">
          {o.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const shortId = order.id.slice(0, 8).toUpperCase();
            const statusLabel = o.statuses[order.status] ?? o.statuses.PAID ?? order.status;
            return (
              <li key={order.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="font-semibold text-foreground hover:text-brand-icon hover:underline"
                      dir="ltr"
                    >
                      {o.order} BUY-{shortId}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {o.placedOn} {dateFmt.format(new Date(order.createdAt))}
                      {order.city ? ` · ${order.city}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusTone(order.status)}`}>
                    {statusLabel}
                  </span>
                  <span className="text-sm font-bold text-foreground" dir="ltr">
                    {order.currency ?? ""} {order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {(order.trackingCode || isCancellable(order.status)) && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
                    {order.trackingCode &&
                      (order.trackingCode.startsWith("http") ? (
                        <a
                          href={order.trackingCode}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-brand-icon hover:underline"
                        >
                          {o.track}
                        </a>
                      ) : (
                        <span className="break-all text-sm text-muted" dir="ltr">
                          {order.carrierName ? `${order.carrierName}: ` : ""}
                          {order.trackingCode}
                        </span>
                      ))}
                    {isCancellable(order.status) &&
                      (confirmId === order.id ? (
                        <span className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-muted">{o.cancelConfirm}</span>
                          <button
                            type="button"
                            disabled={busyId === order.id}
                            onClick={() => onCancel(order.id)}
                            className="font-semibold text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
                          >
                            {busyId === order.id ? t.auth.loading : o.cancelOrder}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="font-medium text-muted hover:text-foreground"
                          >
                            {o.cancelKeep}
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(order.id)}
                          className="ms-auto text-sm font-medium text-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
                        >
                          {o.cancelOrder}
                        </button>
                      ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={() => load(page + 1).catch(() => setError(t.auth.errors.generic))}
          className="mt-4 w-full rounded-full border border-border bg-surface py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
        >
          {o.loadMore}
        </button>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------ Addresses -- */

export function AddressesSection() {
  const { t } = useI18n();
  const ad = t.account.addresses;
  const { uid, profile } = useAccountData();
  const [rows, setRows] = useState<Address[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [label, setLabel] = useState<AddressLabel>("HOME");
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  // Detected coordinates ride along with the save — they also power the 30-minute
  // delivery-radius check at checkout, which needs the ADDRESS's position, not the device's.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [prefill, setPrefill] = useState<{
    line1?: string; city?: string; state?: string; postalCode?: string; country?: string;
  }>({});

  const load = async () => setRows(await fetchAddresses(uid));

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationNote(ad.locationFailed);
      return;
    }
    setLocating(true);
    setLocationNote(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        const g = await reverseGeocode(latitude, longitude);
        if (g) {
          setPrefill({
            line1: g.line || undefined,
            city: g.city ?? undefined,
            state: g.state ?? undefined,
            postalCode: g.postalCode ?? undefined,
            country: countryFieldValue(g) || undefined,
          });
        } else {
          // Coordinates still count — the form just stays manual.
          setLocationNote(ad.locationFailed);
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationNote(ad.locationFailed);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  useEffect(() => {
    load().catch(() => setError(t.auth.errors.generic));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      // Recipient identity rides along from the account profile — the form only asks
      // for what the profile cannot know: where.
      await saveAddress(uid, {
        firstName: (profile?.firstName ?? "").trim(),
        lastName: (profile?.lastName ?? "").trim(),
        phoneNumber: (profile?.phoneNumber ?? "").trim() || undefined,
        label,
        customLabel: label === "OTHER"
            ? String(fd.get("customLabel") ?? "").trim() || undefined
            : undefined,
        latitude: coords?.lat,
        longitude: coords?.lng,
        addressLine1: String(fd.get("line1") ?? "").trim(),
        addressLine2: String(fd.get("line2") ?? "").trim() || undefined,
        city: String(fd.get("city") ?? "").trim() || undefined,
        state: String(fd.get("state") ?? "").trim() || undefined,
        country: String(fd.get("country") ?? "").trim(),
        postalCode: String(fd.get("postalCode") ?? "").trim() || undefined,
        isDefault: fd.get("isDefault") === "on",
      });
      setAdding(false);
      await load();
    } catch (err) {
      setError(err instanceof AuthError && err.message ? err.message : t.auth.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
    } catch {
      setError(t.auth.errors.generic);
    } finally {
      setBusy(false);
      setConfirmDelete(null);
    }
  }

  return (
    <Panel>
      <SectionHead title={ad.title} subtitle={ad.subtitle} />

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {rows === null ? (
        <div className="space-y-3" aria-busy>
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface-2 motion-reduce:animate-none" />
          ))}
        </div>
      ) : (
        <>
          {rows.length === 0 && !adding && (
            <p className="mb-4 rounded-xl border border-border bg-surface-2 px-4 py-6 text-center text-sm text-muted">
              {ad.empty}
            </p>
          )}

          <ul className="space-y-3">
            {rows.map((addr) => (
              <li key={addr.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {addr.customLabel || ad.labels[addr.label ?? "OTHER"]}
                      {addr.isDefault && (
                        <span className="ms-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-icon">
                          {t.account.common.default}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {[addr.firstName, addr.lastName].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-sm text-muted">
                      {[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {addr.phoneNumber && (
                      <p className="text-sm text-muted" dir="ltr">{addr.phoneNumber}</p>
                    )}
                  </div>
                  <div className="flex w-full shrink-0 items-center gap-3 text-sm sm:w-auto">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(() => setDefaultAddress(uid, addr.id))}
                        className="font-medium text-brand-icon hover:underline disabled:opacity-60"
                      >
                        {t.account.common.setDefault}
                      </button>
                    )}
                    {confirmDelete === addr.id ? (
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-muted">{ad.deleteConfirm}</span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => run(() => deleteAddress(uid, addr.id))}
                          className="font-semibold text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
                        >
                          {t.account.common.remove}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="font-medium text-muted hover:text-foreground"
                        >
                          {t.account.common.cancel}
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(addr.id)}
                        className="font-medium text-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
                      >
                        {t.account.common.remove}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {adding ? (
            <form onSubmit={onAdd} className="mt-4 space-y-4 rounded-2xl border border-border bg-surface-2 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={locating}
                  onClick={useMyLocation}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:opacity-60"
                >
                  <MapPinIcon className="h-4 w-4 text-brand-icon" />
                  {locating ? ad.locating : ad.useMyLocation}
                </button>
                {locationNote && <span className="text-xs text-muted">{locationNote}</span>}
              </div>

              <Field key={`l1-${prefill.line1 ?? ""}`} label={ad.street} name="line1" defaultValue={prefill.line1} required />
              <Field label={ad.line2} name="line2" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field key={`c-${prefill.city ?? ""}`} label={ad.city} name="city" defaultValue={prefill.city} required />
                <Field key={`s-${prefill.state ?? ""}`} label={ad.state} name="state" defaultValue={prefill.state} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field key={`co-${prefill.country ?? "UAE"}`} label={ad.country} name="country" defaultValue={prefill.country ?? "UAE"} required />
                <Field key={`p-${prefill.postalCode ?? ""}`} label={ad.postalCode} name="postalCode" defaultValue={prefill.postalCode} />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">{ad.name}</span>
                  <select
                    name="label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value as AddressLabel)}
                    className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {(Object.keys(ad.labels) as AddressLabel[]).map((k) => (
                      <option key={k} value={k}>{ad.labels[k]}</option>
                    ))}
                  </select>
                </label>
                {label === "OTHER" && (
                  <Field label={ad.customName} name="customLabel" maxLength={60} required />
                )}
                <label className="mt-6 flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-border accent-brand" />
                  {t.account.common.setDefault}
                </label>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {busy ? t.auth.loading : t.account.common.save}
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="text-sm font-medium text-muted hover:text-foreground"
                >
                  {t.account.common.cancel}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
              >
                {ad.addNew}
              </button>
              {/* There is no edit endpoint — say so instead of faking one. */}
              <span className="text-xs text-muted">{ad.noEditNote}</span>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------- Payments -- */

export function PaymentsSection() {
  const { t } = useI18n();
  return <ComingSoonPanel title={t.account.payments.title} subtitle={t.account.payments.subtitle} />;
}

/* ---------------------------------------------------------- Preferences -- */

const LOCALES = [
  { code: "en", label: "English" },
  { code: "az", label: "Azərbaycanca" },
  { code: "ar", label: "العربية" },
] as const;

export function PreferencesSection() {
  const { t, locale, setLocale } = useI18n();
  const pf = t.account.preferences;
  const [currency, setCurrency] = useState("AED");
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    push: true,
    newsletter: true,
  });

  return (
    <Panel>
      <SectionHead title={pf.title} subtitle={pf.subtitle} />

      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">{pf.language}</p>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLocale(l.code)}
                aria-pressed={locale === l.code}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  locale === l.code
                    ? "border-brand bg-brand-soft text-brand-icon"
                    : "border-border text-foreground hover:border-border-strong"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">{pf.currency}</p>
          <div className="flex flex-wrap gap-2">
            {["AED", "USD"].map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setCurrency(cur)}
                aria-pressed={currency === cur}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  currency === cur
                    ? "border-brand bg-brand-soft text-brand-icon"
                    : "border-border text-foreground hover:border-border-strong"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <p className="mb-3 text-sm font-medium text-foreground">
            {pf.notifications}
          </p>
          <div className="space-y-4">
            <Toggle
              label={pf.channelEmail}
              checked={prefs.email}
              onChange={(v) => setPrefs((s) => ({ ...s, email: v }))}
            />
            <Toggle
              label={pf.channelSms}
              checked={prefs.sms}
              onChange={(v) => setPrefs((s) => ({ ...s, sms: v }))}
            />
            <Toggle
              label={pf.channelPush}
              checked={prefs.push}
              onChange={(v) => setPrefs((s) => ({ ...s, push: v }))}
            />
            <Toggle
              label={pf.newsletter}
              checked={prefs.newsletter}
              onChange={(v) => setPrefs((s) => ({ ...s, newsletter: v }))}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------- Security -- */

function PasswordField({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  const { t } = useI18n();
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          autoComplete="off"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pe-11 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? t.gate.hide : t.gate.show}
          className="absolute inset-y-0 end-2 my-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

export function SecuritySection() {
  const { t } = useI18n();
  const sec = t.account.security;
  const { profile } = useAccountData();
  const email = profile?.email ?? "";
  const [step, setStep] = useState<"idle" | "code" | "done">("idle");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function errorFor(err: unknown): string {
    if (!(err instanceof AuthError)) return t.auth.errors.generic;
    switch (err.status) {
      case 401: return t.auth.otp.wrong;
      case 410: return t.auth.otp.expired;
      case 429: return t.auth.errors.tooManyAttempts;
      case 400: return err.message || t.auth.errors.generic;
      case 0:   return t.auth.errors.network;
      default:  return t.auth.errors.generic;
    }
  }

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      await forgotPassword(email);
      setOtp("");
      setStep("code");
    } catch (err) {
      setError(errorFor(err));
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = String(fd.get("newPass") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (next.length < 8) return setError(sec.tooShort);
    if (next !== confirm) return setError(sec.mismatch);
    setBusy(true);
    setError(null);
    try {
      await resetPassword({ email, otpCode: otp, newPassword: next, repeatPassword: confirm });
      setStep("done");
    } catch (err) {
      setError(errorFor(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <SectionHead title={sec.title} subtitle={sec.subtitle} />

      {step === "done" ? (
        <p role="status" className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {sec.updated}
        </p>
      ) : step === "idle" ? (
        <div className="space-y-4">
          {/* The backend has no change-with-current-password endpoint — the emailed code IS the
              mechanism, so the UI says exactly that instead of asking for a current password it
              could never verify. */}
          <p className="text-sm text-muted">{sec.viaEmailIntro}</p>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="button"
            disabled={busy || !email}
            onClick={sendCode}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {busy ? t.auth.loading : sec.sendCode}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="max-w-sm space-y-4">
          <p className="text-sm text-muted">
            {sec.codeSentTo} <span className="break-all font-medium text-foreground">{email}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          <Field label={sec.newPass} name="newPass" type="password" autoComplete="new-password" required />
          <Field label={sec.confirm} name="confirm" type="password" autoComplete="new-password" required />
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy || otp.length !== 6}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {busy ? t.auth.loading : sec.update}
          </button>
        </form>
      )}
    </Panel>
  );
}

/* --------------------------------------------------------------- Delete -- */

export function DeleteAccountSection() {
  const { t } = useI18n();
  const d = t.account.danger;
  const { uid, profile, reload } = useAccountData();
  const [confirming, setConfirming] = useState(false);
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await reload();
      setConfirming(false);
      setWord("");
    } catch {
      setError(t.auth.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  if (profile?.pendingDeletion) {
    return (
      <Panel>
        <SectionHead title={d.pendingTitle} subtitle={d.pendingBody} />
        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => recoverAccount(uid))}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? t.auth.loading : d.recover}
        </button>
      </Panel>
    );
  }

  return (
    <Panel>
      <SectionHead title={d.title} subtitle={d.subtitle} />
      <p className="mb-5 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
        {d.warning}
      </p>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      {confirming ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">{d.modalBody}</p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">{d.confirmHint}</span>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              autoComplete="off"
              className="w-full max-w-xs rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || word.trim() !== d.confirmWord}
              onClick={() => run(() => requestAccountDeletion(uid))}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? t.auth.loading : d.confirm}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                setWord("");
              }}
              className="font-medium text-muted hover:text-foreground"
            >
              {t.account.orders.cancelKeep}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {d.delete}
        </button>
      )}
    </Panel>
  );
}

