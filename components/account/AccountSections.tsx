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
import { Field, Panel, SectionHead, Toggle } from "@/components/account/account-ui";
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
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 2200);
  }

  return (
    <Panel>
      <SectionHead title={p.title} subtitle={p.subtitle} />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={p.firstName} defaultValue={account.firstName} />
          <Field label={p.lastName} defaultValue={account.lastName} />
        </div>
        <Field label={p.email} type="email" defaultValue={account.email} />
        <Field label={p.phone} type="tel" defaultValue={account.phone} />
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {t.account.common.save}
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

/* --------------------------------------------------------------- Orders -- */

const statusStyle: Record<OrderStatus, string> = {
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  shipped: "bg-brand-soft text-brand-icon",
  processing: "bg-gold/15 text-warn dark:text-gold",
  cancelled: "bg-surface-2 text-muted",
};

export function OrdersSection() {
  const { t } = useI18n();
  const o = t.account.orders;
  return (
    <Panel>
      <SectionHead title={o.title} subtitle={o.subtitle} />
      <ul className="divide-y divide-border">
        {orders.map((order) => (
          <li
            key={order.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4 first:pt-0 last:pb-0"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-icon">
              <PackageIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">
                {o.order} {order.id}
              </p>
              <p className="text-xs text-muted">
                {order.date} · {order.items} {o.items}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[order.status]}`}
            >
              {o.statuses[order.status]}
            </span>
            <span className="font-semibold text-foreground">
              ${formatInt(order.total)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {o.view}
              </button>
              <button
                type="button"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {o.reorder}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------------ Addresses -- */

export function AddressesSection() {
  const { t } = useI18n();
  const ad = t.account.addresses;
  const c = t.account.common;
  const [list, setList] = useState<Address[]>(seedAddresses);
  const [adding, setAdding] = useState(false);
  const nextId = useRef(100);

  function remove(id: string) {
    setList((l) => l.filter((x) => x.id !== id));
  }
  function makeDefault(id: string) {
    setList((l) => l.map((x) => ({ ...x, isDefault: x.id === id })));
  }
  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Address = {
      id: `a${nextId.current++}`,
      label: (fd.get("label") as string) || "New",
      name: (fd.get("name") as string) || account.firstName,
      line1: (fd.get("street") as string) || "",
      city: (fd.get("city") as string) || "",
      country: (fd.get("country") as string) || "",
      phone: (fd.get("phone") as string) || "",
      isDefault: list.length === 0,
    };
    setList((l) => [...l, next]);
    setAdding(false);
  }

  return (
    <Panel>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{ad.title}</h2>
          <p className="mt-0.5 text-sm text-muted">{ad.subtitle}</p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PlusIcon className="h-4 w-4" />
            {ad.addNew}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((a) => (
          <div key={a.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-brand-icon" />
                <span className="font-semibold text-foreground">{a.label}</span>
                {a.isDefault && (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-icon">
                    {c.default}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={c.edit}
                  className="rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  aria-label={c.remove}
                  className="rounded-md p-1 text-muted transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {a.name}
              <br />
              {a.line1}, {a.city}
              <br />
              {a.country} · {a.phone}
            </p>
            {!a.isDefault && (
              <button
                type="button"
                onClick={() => makeDefault(a.id)}
                className="mt-3 text-xs font-semibold text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {c.setDefault}
              </button>
            )}
          </div>
        ))}
      </div>

      {adding && (
        <form
          onSubmit={onAdd}
          className="mt-4 space-y-4 rounded-xl border border-border bg-surface-2 p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={ad.name} name="name" required />
            <Field label={c.default} name="label" placeholder="Home" />
          </div>
          <Field label={ad.street} name="street" required />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={ad.city} name="city" required />
            <Field label={ad.country} name="country" required />
            <Field label={ad.phone} name="phone" type="tel" />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {c.save}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {c.cancel}
            </button>
          </div>
        </form>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------- Payments -- */

export function PaymentsSection() {
  const { t } = useI18n();
  const pm = t.account.payments;
  const c = t.account.common;
  const [list, setList] = useState<Card[]>(seedCards);

  function remove(id: string) {
    setList((l) => l.filter((x) => x.id !== id));
  }
  function makeDefault(id: string) {
    setList((l) => l.map((x) => ({ ...x, isDefault: x.id === id })));
  }

  return (
    <Panel>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{pm.title}</h2>
          <p className="mt-0.5 text-sm text-muted">{pm.subtitle}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PlusIcon className="h-4 w-4" />
          {pm.addCard}
        </button>
      </div>

      <ul className="space-y-3">
        {list.map((card) => (
          <li
            key={card.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border p-4"
          >
            <span className="flex h-9 w-12 items-center justify-center rounded-md bg-surface-2 text-brand-icon">
              <CreditCardIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground" dir="ltr">
                {card.brand} ···· {card.last4}
              </p>
              <p className="text-xs text-muted">
                {pm.expires} {card.expiry}
              </p>
            </div>
            {card.isDefault ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-icon">
                {c.default}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeDefault(card.id)}
                className="text-xs font-semibold text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {c.setDefault}
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(card.id)}
              aria-label={c.remove}
              className="rounded-md p-1 text-muted transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {pm.bnpl}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[<TabbyLogo key="t" className="h-5 w-auto" />, <TamaraLogo key="m" className="h-5 w-auto" />].map(
          (logo, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border p-4"
            >
              {logo}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckIcon className="h-3.5 w-3.5" />
                {pm.connected}
              </span>
            </div>
          ),
        )}
      </div>
    </Panel>
  );
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
  const s = t.account.security;
  const [twofa, setTwofa] = useState(false);
  const [updated, setUpdated] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // UI-only: acknowledge the change.
    setUpdated(true);
    e.currentTarget.reset();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setUpdated(false), 2400);
  }

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHead title={s.changePassword} subtitle={s.subtitle} />
        <form onSubmit={onSubmit} className="space-y-4">
          <PasswordField label={s.current} />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField label={s.newPass} />
            <PasswordField label={s.confirm} />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {s.update}
            </button>
            {updated && (
              <span
                role="status"
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400"
              >
                <CheckIcon className="buyo-pop h-4 w-4" />
                {s.updated}
              </span>
            )}
          </div>
        </form>
      </Panel>

      <Panel>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-icon">
            <ShieldCheckIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <Toggle
              label={s.twofa}
              description={s.twofaDesc}
              checked={twofa}
              onChange={setTwofa}
            />
          </div>
        </div>
        <button
          type="button"
          className="mt-5 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {s.signOutAll}
        </button>
      </Panel>
    </div>
  );
}

/* --------------------------------------------------------------- Delete -- */

export function DeleteAccountSection() {
  const { t } = useI18n();
  const d = t.account.danger;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [deleted, setDeleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const release = lockBodyScroll();
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      release();
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const canDelete = value.trim().toUpperCase() === d.confirmWord;

  if (deleted) {
    return (
      <Panel>
        <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <TrashIcon className="h-7 w-7" />
          </span>
          <h2 className="text-xl font-semibold text-foreground">
            {d.deletedTitle}
          </h2>
          <p className="text-sm text-muted">{d.deletedBody}</p>
          <Link
            href="/"
            className="mt-1 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {d.backHome}
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          {d.title}
        </h2>
        <p className="mt-0.5 text-sm text-muted">{d.subtitle}</p>
        <p className="mt-4 text-sm text-muted">{d.warning}</p>
        <button
          type="button"
          onClick={() => {
            setValue("");
            setOpen(true);
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <TrashIcon className="h-4 w-4" />
          {d.delete}
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className="buyo-overlay fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="del-title"
              className="buyo-panel w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                  <TrashIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3
                    id="del-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    {d.modalTitle}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{d.modalBody}</p>
                </div>
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  {d.confirmHint}
                </span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </label>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t.account.common.cancel}
                </button>
                <button
                  type="button"
                  disabled={!canDelete}
                  onClick={() => {
                    setOpen(false);
                    setDeleted(true);
                  }}
                  className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {d.confirm}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
