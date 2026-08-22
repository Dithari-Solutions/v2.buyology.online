"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";
import { AuthField, AuthPassword, AuthSocial } from "@/components/auth/auth-ui";

/**
 * Email + password sign-in against the real backend.
 *
 * The QR tab is gone deliberately: it was pure theatre (the code encoded nothing and no device
 * flow exists). It returns when the mobile app's device-login ships — as a working feature.
 *
 * Errors are mapped from HTTP status codes, never from message text: 404 means the email is
 * unknown (the backend states this openly for customers), 401 wrong password, 403 suspended,
 * 429 the 15-minute lockout.
 */
export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const { signIn } = useAuth();
  const a = t.auth;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Where to land after auth: ?next=/some/path when present, else home. */
  function destination(): string {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") ? next : "/";
  }

  function messageFor(err: unknown): string {
    if (!(err instanceof AuthError)) return a.errors.generic;
    switch (err.status) {
      case 404: return a.errors.notRegistered;
      case 401: return a.errors.invalidCredentials;
      case 403: return a.errors.suspended;
      case 429: return a.errors.tooManyAttempts;
      case 0:   return a.errors.network;
      default:  return a.errors.generic;
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await signIn(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
      router.push(destination());
    } catch (err) {
      setError(messageFor(err));
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {a.login.title}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{a.login.subtitle}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <AuthField
          label={a.email}
          type="email"
          name="email"
          autoComplete="email"
          required
        />
        <AuthPassword label={a.password} autoComplete="current-password" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-brand"
            />
            {a.login.remember}
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {a.login.forgot}
          </Link>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? a.loading : a.login.submit}
        </button>
      </form>

      <AuthSocial onDone={() => router.push(destination())} />

      <p className="mt-6 text-center text-sm text-muted">
        {a.login.noAccount}{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {a.login.cta}
        </Link>
      </p>
    </div>
  );
}
