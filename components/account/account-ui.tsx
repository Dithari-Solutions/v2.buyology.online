"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

export function SectionHead({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      <input
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        {...props}
      />
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
          checked ? "bg-brand" : "bg-border-strong"
        }`}
      >
        <span
          className={`absolute top-0.5 start-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/** Card wrapper for an account section. */
export function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      {children}
    </div>
  );
}
