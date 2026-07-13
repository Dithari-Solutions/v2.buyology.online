"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import {
  AuthDivider,
  AuthField,
  AuthPassword,
  AuthSelect,
  AuthSocial,
} from "@/components/auth/auth-ui";
import { FileUpload } from "@/components/auth/FileUpload";
import { BuildingIcon, UserIcon } from "@/components/icons";

const EMPLOYEE_RANGES = ["1–10", "11–50", "51–200", "201–500", "500+"];

export function SignupForm() {
  const { t } = useI18n();
  const router = useRouter();
  const s = t.auth.signup;
  const [type, setType] = useState<"personal" | "business">("personal");
  const [licence, setLicence] = useState<File | null>(null);

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
          className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {s.submit}
        </button>
      </form>

      {type === "personal" && (
        <>
          <AuthDivider />
          <AuthSocial />
        </>
      )}

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
