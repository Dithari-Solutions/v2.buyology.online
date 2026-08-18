"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import {
  AuthDivider,
  AuthField,
  AuthPassword,
  AuthSocial,
} from "@/components/auth/auth-ui";
import { QrCode } from "@/components/auth/QrCode";
import {
  AppleIcon,
  GoogleIcon,
  LockIcon,
  QrCodeIcon,
} from "@/components/icons";

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "qr">("email");
  const a = t.auth;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/account");
  }

  const tabCls = (on: boolean) =>
    `flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      on ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
    }`;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {a.login.title}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{a.login.subtitle}</p>

      {/* Method tabs */}
      <div
        role="tablist"
        aria-label={a.login.title}
        className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-border bg-surface-2 p-1"
      >
        <button
          type="button"
          role="tab"
          id="tab-email"
          aria-selected={mode === "email"}
          aria-controls="auth-panel"
          onClick={() => setMode("email")}
          className={tabCls(mode === "email")}
        >
          <LockIcon className="h-4 w-4" />
          {a.passwordTab}
        </button>
        <button
          type="button"
          role="tab"
          id="tab-qr"
          aria-selected={mode === "qr"}
          aria-controls="auth-panel"
          onClick={() => setMode("qr")}
          className={tabCls(mode === "qr")}
        >
          <QrCodeIcon className="h-4 w-4" />
          {a.qrTab}
        </button>
      </div>

      <div
        id="auth-panel"
        role="tabpanel"
        aria-labelledby={mode === "email" ? "tab-email" : "tab-qr"}
      >
        {mode === "email" ? (
          <>
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

              <button
                type="submit"
                className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {a.login.submit}
              </button>
            </form>

            <AuthDivider />
            <AuthSocial />
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center">
            <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
              <QrCode size={172} />
            </div>

            <p className="mt-4 text-center font-semibold text-foreground">
              {a.qr.title}
            </p>

            <ol className="mt-4 w-full space-y-3">
              {[a.qr.step1, a.qr.step2, a.qr.step3].map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-muted"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-icon">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-xs font-medium text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              {a.qr.waiting}
            </div>

            <div className="mt-5 flex items-center justify-center gap-3 text-xs text-muted">
              <span>{a.qr.getApp}</span>
              <a
                href="#"
                aria-label="App Store"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AppleIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Google Play"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <GoogleIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </div>

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
