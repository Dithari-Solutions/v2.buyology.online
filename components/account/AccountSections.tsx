"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { formatInt } from "@/lib/format";
import { lockBodyScroll } from "@/lib/scroll-lock";
import {
  account,
  addresses as seedAddresses,
  cards as seedCards,
  orders,
  type Address,
  type Card,
  type OrderStatus,
} from "@/lib/account";
import { useAccountData } from "@/components/account/account-data";
import { updateProfile, uploadAvatar, AuthError } from "@/lib/auth/client";
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

const statusStyle: Record<OrderStatus, string> = {
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  shipped: "bg-brand-soft text-brand-icon",
  processing: "bg-gold/15 text-warn dark:text-gold",
  cancelled: "bg-surface-2 text-muted",
};

export function OrdersSection() {
  const { t } = useI18n();
  return <ComingSoonPanel title={t.account.orders.title} subtitle={t.account.orders.subtitle} />;
}

/* ------------------------------------------------------------ Addresses -- */

export function AddressesSection() {
  const { t } = useI18n();
  return <ComingSoonPanel title={t.account.addresses.title} subtitle={t.account.addresses.subtitle} />;
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
  return <ComingSoonPanel title={t.account.security.title} subtitle={t.account.security.subtitle} />;
}

/* --------------------------------------------------------------- Delete -- */

export function DeleteAccountSection() {
  const { t } = useI18n();
  return <ComingSoonPanel title={t.account.danger.title} subtitle={t.account.danger.subtitle} />;
}

