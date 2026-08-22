"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { AuthField, AuthPassword } from "@/components/auth/auth-ui";
import { AuthError, forgotPassword, resetPassword } from "@/lib/auth/client";
import { OtpInput } from "@/components/auth/OtpInput";
import { CheckIcon, ChevronLeftIcon } from "@/components/icons";

type Step = "email" | "otp" | "reset" | "done";

const submitBtn =
  "w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const f = t.auth.forgot;
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (step !== "otp") return;
    const id = setInterval(
      () => setResendIn((n) => (n > 0 ? n - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, [step]);

  const [busy, setBusy] = useState(false);

  function errorFor(err: unknown): string {
    if (!(err instanceof AuthError)) return t.auth.errors.generic;
    switch (err.status) {
      case 404: return t.auth.errors.notRegistered;
      case 401: return t.auth.otp.wrong;
      case 410: return t.auth.otp.expired;
      case 429: return t.auth.errors.tooManyAttempts;
      case 400: return err.message || t.auth.errors.generic;
      case 0:   return t.auth.errors.network;
      default:  return t.auth.errors.generic;
    }
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await forgotPassword(email);
      setOtp("");
      setResendIn(60); // the backend's resend cooldown
      setStep("otp");
    } catch (err) {
      setError(errorFor(err));
    } finally {
      setBusy(false);
    }
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    // The OTP is proven at the reset call itself — the backend has no separate check endpoint for
    // password reset, so a wrong code surfaces on the next step and sends the user back here.
    if (otp.length === 6) {
      setError("");
      setStep("reset");
    }
  }

  async function reset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = String(fd.get("new") || "");
    const confirm = String(fd.get("confirm") || "");
    if (next.length < 8) {
      setError(t.account.security.tooShort);
      return;
    }
    if (next !== confirm) {
      setError(t.account.security.mismatch);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await resetPassword({ email, otpCode: otp, newPassword: next, repeatPassword: confirm });
      setStep("done");
    } catch (err) {
      const message = errorFor(err);
      setError(message);
      // A wrong or expired code is fixed at the OTP step, not here.
      if (err instanceof AuthError && (err.status === 401 || err.status === 410)) {
        setOtp("");
        setStep("otp");
      }
    } finally {
      setBusy(false);
    }
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <CheckIcon className="buyo-pop h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          {f.doneTitle}
        </h1>
        <p className="mt-2 text-sm text-muted">{f.doneSub}</p>
        <Link href="/login" className={`mt-6 ${submitBtn} inline-block text-center`}>
          {f.backToSignin}
        </Link>
      </div>
    );
  }

  const activeIdx = step === "email" ? 0 : step === "otp" ? 1 : 2;

  return (
    <div>
      {/* Stepper */}
      <div className="mb-7 flex items-center gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= activeIdx ? "bg-brand" : "bg-surface-2"
            }`}
          />
        ))}
      </div>

      {step === "email" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {f.emailTitle}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{f.emailSub}</p>
          <form onSubmit={sendCode} className="mt-6 space-y-4">
            <AuthField
              label={t.auth.email}
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className={submitBtn}>
              {f.send}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-medium text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
              {f.backToSignin}
            </Link>
          </p>
        </>
      )}

      {step === "otp" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {f.otpTitle}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {f.otpSub}{" "}
            <span className="font-medium text-foreground" dir="ltr">
              {email || "your email"}
            </span>
          </p>
          <form onSubmit={verify} className="mt-6">
            <OtpInput value={otp} onChange={setOtp} />
            <button
              type="submit"
              disabled={otp.length < 6}
              className={`mt-6 ${submitBtn}`}
            >
              {f.verify}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            {f.noCode}{" "}
            {resendIn > 0 ? (
              <span className="font-medium text-foreground">
                {f.resendIn} {resendIn}s
              </span>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await forgotPassword(email);
                    setOtp("");   // the typed code is stale once a new one is sent
                    setResendIn(60);
                    setError("");
                  } catch (err) {
                    setError(errorFor(err));
                  }
                }}
                className="font-semibold text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {f.resend}
              </button>
            )}
          </p>

          <button
            type="button"
            onClick={() => setStep("email")}
            className="mx-auto mt-4 flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
            {f.changeEmail}
          </button>
        </>
      )}

      {step === "reset" && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {f.resetTitle}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{f.resetSub}</p>
          <form onSubmit={reset} className="mt-6 space-y-4">
            <AuthPassword
              label={t.account.security.newPass}
              name="new"
              autoComplete="new-password"
            />
            <AuthPassword
              label={t.account.security.confirm}
              name="confirm"
              autoComplete="new-password"
            />
            {error && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <button type="submit" className={submitBtn}>
              {f.submit}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
