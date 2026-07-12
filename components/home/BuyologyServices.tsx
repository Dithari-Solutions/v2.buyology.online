"use client";

import Link from "next/link";
import { homeServices } from "@/lib/services";
import { useI18n } from "@/components/i18n/language-provider";
import { ArrowRightShortIcon, SparklesIcon } from "@/components/icons";

/**
 * Buyology services showcase — Repair, Rent, Trade-in, Powerbank Stations and
 * DIY. A bento with two featured (wide) tiles and three medium ones. Each has a
 * brand-gradient banner + icon, title, blurb and a per-service CTA.
 */
export function BuyologyServices() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="services-heading"
      className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12"
    >
      {/* Header */}
      <div className="mb-6 max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
          <SparklesIcon className="h-4 w-4 text-gold" />
          {t.services.eyebrow}
        </p>
        <h2
          id="services-heading"
          className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {t.services.heading}
        </h2>
        <p className="mt-2 text-muted">{t.services.subline}</p>
      </div>

      {/* Bento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {homeServices.map((service) => {
          const Icon = service.icon;
          const item = t.items[service.key];
          const cta = t.services.cta[service.key];
          return (
            <Link
              key={service.key}
              href={service.href}
              className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevation)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                service.wide ? "lg:col-span-3" : "lg:col-span-2"
              }`}
            >
              <div
                className={`relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br ${service.tint}`}
              >
                <span className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
                <Icon className="relative h-11 w-11 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold text-foreground">
                  {item.label}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted">{item.hint}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-warn dark:text-gold">
                  {cta}
                  <ArrowRightShortIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
