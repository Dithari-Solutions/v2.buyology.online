"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { AppleIcon, EyeIcon, EyeOffIcon, GoogleIcon } from "@/components/icons";

export function AuthField({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <input
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      />
    </label>
  );
}

export function AuthPassword({
  label,
  name = "password",
  autoComplete,
}: {
  label: string;
  name?: string;
  autoComplete?: string;
}) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          required
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

export function AuthSelect({
  label,
  children,
  ...props
}: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <select
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function AuthDivider() {
  const { t } = useI18n();
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
      <span className="h-px flex-1 bg-border" />
      {t.auth.or}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AuthSocial() {
  const { t } = useI18n();
  const cls =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" aria-label={`${t.auth.continueWith} Google`} className={cls}>
        <GoogleIcon className="h-5 w-5" />
        Google
      </button>
      <button type="button" aria-label={`${t.auth.continueWith} Apple`} className={cls}>
        <AppleIcon className="h-5 w-5" />
        Apple
      </button>
    </div>
  );
}
