"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { regions } from "@/lib/regions";
import { Globe } from "@/components/contact/Globe";
import { ContactForm } from "@/components/contact/ContactForm";
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";

export function ContactView() {
  const { t } = useI18n();
  const [active, setActive] = useState(regions[0].id);
  const region = regions.find((r) => r.id === active) ?? regions[0];

  return (
    <div>
      <header className="mb-8 max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
          <MapPinIcon className="h-4 w-4 text-gold" />
          {t.contact.eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t.contact.title}
        </h1>
        <p className="mt-2 text-muted">{t.contact.subtitle}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Globe + regions */}
        <div>
          <div
            className="relative overflow-hidden rounded-3xl p-4 sm:p-6"
            style={{
              background:
                "radial-gradient(120% 120% at 50% 0%, #3a1f7d 0%, #241056 45%, #160734 100%)",
            }}
          >
            <Globe activeId={active} onSelect={setActive} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {regions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActive(r.id)}
                aria-pressed={active === r.id}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active === r.id
                    ? "border-brand bg-brand-soft text-brand-icon"
                    : "border-border text-foreground hover:border-border-strong"
                }`}
              >
                <span className="text-base leading-none">{r.flag}</span>
                <span className="truncate">{t.contact.regions[r.id]}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <span className="text-2xl leading-none">{region.flag}</span>
              <div>
                <p className="font-semibold text-foreground">
                  {t.contact.regions[region.id]}
                </p>
                <p className="text-sm text-muted">{region.city}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-icon" />
                <span className="text-muted">{region.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-icon" />
                <a
                  href={`tel:${region.phone.replace(/\s/g, "")}`}
                  dir="ltr"
                  className="text-foreground transition-colors hover:text-brand-icon"
                >
                  {region.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-icon" />
                <a
                  href={`mailto:${region.email}`}
                  className="text-foreground transition-colors hover:text-brand-icon"
                >
                  {region.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-icon" />
                <span className="text-muted">{region.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Message form */}
        <ContactForm region={active} setRegion={setActive} />
      </div>
    </div>
  );
}
