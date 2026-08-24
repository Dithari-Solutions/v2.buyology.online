"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { useAccountData } from "@/components/account/account-data";
import { sendPhoneOtp, verifyPhone } from "@/lib/account-api";
import { AuthError } from "@/lib/auth/client";
import { OtpInput } from "@/components/auth/OtpInput";
import { CheckIcon, PhoneIcon } from "@/components/icons";

/**
 * The phone number's verification state, and the SMS code flow to clear it.
 *
 * Saving a number does NOT verify it: the server drops the verified flag whenever the number
 * changes, because a number nobody proved reachable is exactly the one a courier cannot call.
 * Checkout and the giveaway both gate on the verified flag, so without this control a customer
 * could add a number here and then be blocked elsewhere with no way to fix it — the reason this
 * flow existed only inside checkout until now.
 *
 * The verification copy is deliberately shared with checkout's gate (t.checkout.*): it is the
 * same action, and one wording keeps the two places from drifting apart.
 */
export function PhoneVerification() {
  const { t } = useI18n();
  const p = t.account.profile;
  const c = t.checkout;
  const { profile, uid, reload } = useAccountData();

  const [step, setStep] = useState<"idle" | "code" | "sending" | "verifying">("idle");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const phone = profile?.phoneNumber?.trim() ?? "";
  const verified = profile?.phoneVerified === true;

  // Nothing to verify until a number is saved.
  if (!phone) return null;

  if (verified) {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckIcon className="h-3.5 w-3.5" />
        {p.phoneVerifiedLabel}
      </p>
    );
  }

  async function send() {
    if (!uid || step === "sending") return;
    setStep("sending");
    setError(null);
    try {
      await sendPhoneOtp(uid, phone);
      setStep("code");
    } catch (err) {
      setError(
        err instanceof AuthError && err.message && err.status === 400
          ? err.message
          : t.auth.errors.generic,
      );
      setStep("idle");
    }
  }

  async function confirm() {
    if (!uid || otp.length < 6) return;
    setStep("verifying");
    setError(null);
    try {
      await verifyPhone(uid, phone, otp);
      setOtp("");
      setStep("idle");
      await reload();
    } catch (err) {
      setError(
        err instanceof AuthError && err.message && (err.status === 400 || err.status === 409)
          ? err.message
          : t.auth.errors.generic,
      );
      setStep("code");
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-gold/40 bg-gold/5 p-3">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-warn dark:text-gold">
        <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
        {p.phoneUnverifiedLabel}
        <span className="text-muted">· {c.phoneHint}</span>
      </p>

      {step === "code" || step === "verifying" ? (
        <div className="mt-3 space-y-3">
          <p className="text-xs text-muted" dir="ltr">
            {phone}
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              disabled={otp.length < 6 || step === "verifying"}
              onClick={confirm}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {step === "verifying" ? t.auth.loading : c.verify}
            </button>
            <button
              type="button"
              onClick={send}
              className="text-sm font-medium text-brand-icon hover:underline"
            >
              {c.resendCode}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={send}
          disabled={step === "sending"}
          className="mt-2.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {step === "sending" ? t.auth.loading : p.phoneVerifyCta}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
