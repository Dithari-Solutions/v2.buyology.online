"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { AppleIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";

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

/**
 * Apple only, by decision — Google and the rest are gone. Renders its own divider so that when
 * Apple is unconfigured (no NEXT_PUBLIC_APPLE_CLIENT_ID) the whole social block disappears
 * cleanly instead of leaving a divider above nothing.
 */
export function AuthSocial({ onDone }: { onDone?: () => void }) {
  const { t } = useI18n();
  const { appleSignIn, appleAvailable } = useAuth();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!appleAvailable) return null;

  async function onApple() {
    setBusy(true);
    setFailed(false);
    try {
      await appleSignIn();
      onDone?.();
    } catch (err) {
      // A closed popup is a decision, not an error worth flashing red at the user.
      const cancelled = !(err instanceof AuthError) && !(err instanceof TypeError)
        && String((err as { error?: string })?.error ?? "").includes("popup_closed");
      if (!cancelled) setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AuthDivider />
      <button
        type="button"
        onClick={onApple}
        disabled={busy}
        aria-label={`${t.auth.continueWith} Apple`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        <AppleIcon className="h-5 w-5" />
        {busy ? t.auth.loading : `${t.auth.continueWith} Apple`}
      </button>
      {failed && (
        <p role="alert" className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
          {t.auth.errors.appleFailed}
        </p>
      )}
    </div>
  );
}
