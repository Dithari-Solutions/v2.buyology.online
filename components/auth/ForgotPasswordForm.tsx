"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { AuthField, AuthPassword } from "@/components/auth/auth-ui";
import { OtpInput } from "@/components/auth/OtpInput";
import { CheckIcon, ChevronLeftIcon } from "@/components/icons";

type Step = "email" | "otp" | "reset" | "done";

const submitBtn =
  "w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

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

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setOtp("");
    setResendIn(30);
    setStep("otp");
  }
  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length === 6) setStep("reset");
  }
  function reset(e: React.FormEvent<HTMLFormElement>) {
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
    setError("");
    setStep("done");
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
                onClick={() => {
                  setResendIn(30);
                  setOtp("");
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
