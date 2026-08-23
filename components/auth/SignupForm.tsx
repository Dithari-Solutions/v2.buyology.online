"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError, saveProfileNames } from "@/lib/auth/client";
import {
  AuthField,
  AuthPassword,
  AuthSelect,
  AuthSocial,
} from "@/components/auth/auth-ui";
import { OtpInput } from "@/components/auth/OtpInput";
import { FileUpload } from "@/components/auth/FileUpload";
import { BuildingIcon, ChevronLeftIcon, UserIcon } from "@/components/icons";

const EMPLOYEE_RANGES = ["1–10", "11–50", "51–200", "201–500", "500+"];
/** Matches the backend's otp.resend-cooldown-seconds. */
const RESEND_COOLDOWN_S = 60;

/**
 * Personal signup is REAL: POST /auth/signup sends the email OTP, POST /auth/verify-otp creates
 * the account and signs the user in, and the names the form collects are saved to the profile
 * right after (the signup endpoint itself takes only email + password). The pending password
 * stays in component STATE only — never sessionStorage, which is where the old site parked it in
 * plaintext for the whole OTP step.
 *
 * The business tab shows an honest notice instead of pretending: B2B applications (trade licence,
 * contact verification) are a later migration step, and a fake success would be worse than none.
 */
export function SignupForm() {
  const { t } = useI18n();
  const router = useRouter();
  /** Where to land after signup: ?next=/some/path when present, else home. */
  function destination(): string {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") ? next : "/";
  }
  const { signUp, verifyOtp } = useAuth();
  const s = t.auth.signup;
  const a = t.auth;

  const [type, setType] = useState<"personal" | "business">("personal");
  const [licence, setLicence] = useState<File | null>(null);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [businessNotice, setBusinessNotice] = useState(false);
  // Held in memory for the OTP step (verify + resend). Deliberately not persisted anywhere.
  const [pending, setPending] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const id = setInterval(() => setResendIn((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step, resendIn]);

  function signupErrorFor(err: unknown): string {
    if (!(err instanceof AuthError)) return a.errors.generic;
    switch (err.status) {
      case 409: return a.errors.emailExists;
      // 400 carries the password-policy explanation — specific and worth showing verbatim.
      case 400: return err.message || a.errors.generic;
      case 429: return a.errors.tooManyAttempts;
      case 0:   return a.errors.network;
      default:  return a.errors.generic;
    }
  }

  function otpErrorFor(err: unknown): string {
    if (!(err instanceof AuthError)) return a.errors.generic;
    switch (err.status) {
      case 401: return a.otp.wrong;
      case 410: return a.otp.expired;
      case 429: return a.errors.tooManyAttempts;
      case 400: return a.otp.restart;
      case 0:   return a.errors.network;
      default:  return a.errors.generic;
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (type === "business") {
      setBusinessNotice(true);
      return;
    }
    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
    };
    setBusy(true);
    setError(null);
    try {
      await signUp(payload.email, payload.password, payload.password);
      setPending(payload);
      setOtp("");
      setResendIn(RESEND_COOLDOWN_S);
      setStep("otp");
    } catch (err) {
      setError(signupErrorFor(err));
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!pending || otp.length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const claims = await verifyOtp(pending.email, otp);
      // The account exists and the user is signed in; names are best-effort from here.
      if (claims.uid && (pending.firstName || pending.lastName)) {
        await saveProfileNames(claims.uid, pending.firstName, pending.lastName);
      }
      router.push(destination());
    } catch (err) {
      setError(otpErrorFor(err));
      setBusy(false);
    }
  }

  async function onResend() {
    if (!pending || resendIn > 0) return;
    setBusy(true);
    setError(null);
    try {
      await signUp(pending.email, pending.password, pending.password);
      setResendIn(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(signupErrorFor(err));
    } finally {
      setBusy(false);
    }
  }

  const tabCls = (on: boolean) =>
    `flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      on ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
    }`;

  // ── OTP step ──
  if (step === "otp" && pending) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {a.otp.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {a.otp.sentTo} <span className="font-medium text-foreground">{pending.email}</span>
        </p>

        <form onSubmit={onVerify} className="mt-6 space-y-4">
          <OtpInput value={otp} onChange={setOtp} />

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || otp.length !== 6}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? a.loading : a.otp.verify}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setError(null);
            }}
            className="inline-flex items-center gap-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
            {a.otp.back}
          </button>
          {resendIn > 0 ? (
            <span className="text-muted" dir="ltr">
              {a.otp.resendIn} {resendIn}s
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={busy}
              className="font-medium text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {a.otp.resend}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {s.title}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{s.subtitle}</p>

      {/* Account type */}
      <div
        role="tablist"
        aria-label={s.title}
        className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-border bg-surface-2 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={type === "personal"}
          onClick={() => setType("personal")}
          className={tabCls(type === "personal")}
        >
          <UserIcon className="h-4 w-4" />
          {s.personalTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={type === "business"}
          onClick={() => setType("business")}
          className={tabCls(type === "business")}
        >
          <BuildingIcon className="h-4 w-4" />
          {s.businessTab}
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {type === "personal" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label={t.auth.firstName}
                name="firstName"
                autoComplete="given-name"
                required
              />
              <AuthField
                label={t.auth.lastName}
                name="lastName"
                autoComplete="family-name"
                required
              />
            </div>
            <AuthField
              label={t.auth.email}
              type="email"
              name="email"
              autoComplete="email"
              required
            />
            <AuthPassword label={t.auth.password} autoComplete="new-password" />
          </>
        ) : (
          <>
            <AuthField label={s.business.name} name="businessName" required />
            <AuthField
              label={s.business.contact}
              name="contact"
              autoComplete="name"
              required
            />
            <AuthField
              label={s.business.email}
              type="email"
              name="businessEmail"
              autoComplete="email"
              required
            />
            <AuthField
              label={s.business.phone}
              type="tel"
              name="phone"
              autoComplete="tel"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthSelect
                label={s.business.industry}
                name="industry"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  {s.business.selectIndustry}
                </option>
                {Object.entries(s.business.industries).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </AuthSelect>
              <AuthSelect
                label={s.business.employees}
                name="employees"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  {s.business.selectEmployees}
                </option>
                {EMPLOYEE_RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </AuthSelect>
            </div>
            <FileUpload
              label={s.business.licence}
              hint={s.business.licenceHint}
              cta={s.business.uploadCta}
              removeLabel={t.account.common.remove}
              required
              file={licence}
              onChange={setLicence}
            />
            <AuthField
              label={s.business.website}
              type="url"
              name="website"
              placeholder="https://"
              autoComplete="url"
            />
            <AuthPassword label={t.auth.password} autoComplete="new-password" />
          </>
        )}

        {type === "business" && businessNotice && (
          <p
            role="status"
            className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted"
          >
            {a.businessSoon}
          </p>
        )}

        {type === "personal" && error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <label className="flex items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
          />
          {s.terms}
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? a.loading : s.submit}
        </button>
      </form>

      {type === "personal" && <AuthSocial onDone={() => router.push(destination())} />}

      <p className="mt-6 text-center text-sm text-muted">
        {s.hasAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {s.cta}
        </Link>
      </p>
    </div>
  );
}
