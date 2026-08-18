"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { regions } from "@/lib/regions";
import { CheckIcon, SendIcon } from "@/components/icons";

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function ContactForm({
  region,
  setRegion,
}: {
  region: string;
  setRegion: (id: string) => void;
}) {
  const { t } = useI18n();
  const c = t.contact.form;
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <CheckIcon className="buyo-pop h-8 w-8" />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {c.sentTitle}
        </h2>
        <p className="mt-2 max-w-xs text-sm text-muted">{c.sentBody}</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {c.another}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="rounded-2xl border border-border bg-surface p-6 sm:p-7"
    >
      <h2 className="text-lg font-semibold text-foreground">{c.title}</h2>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 space-y-4">
        <Field label={c.name}>
          <input type="text" name="name" required className={inputCls} />
        </Field>
        <Field label={c.email}>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className={inputCls}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={c.subject}>
            <input type="text" name="subject" className={inputCls} />
          </Field>
          <Field label={c.region}>
            <select
              name="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={inputCls}
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {t.contact.regions[r.id]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={c.message}>
          <textarea name="message" required rows={5} className={inputCls} />
        </Field>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <SendIcon className="h-4 w-4 rtl:-scale-x-100" />
          {c.send}
        </button>
      </div>
    </form>
  );
}
