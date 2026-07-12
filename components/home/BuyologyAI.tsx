"use client";

import Link from "next/link";
import { aiFeatures } from "@/lib/ai-features";
import { useI18n } from "@/components/i18n/language-provider";
import {
  ArrowRightShortIcon,
  BotIcon,
  SparklesIcon,
} from "@/components/icons";

/**
 * "Buyology AI" — the flagship Buyobot capabilities showcase. A bento of a
 * branded hero tile plus ten AI-tool cards. On lg the hero spans 2 columns so
 * the 12 cells fill exactly.
 */
export function BuyologyAI() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="ai-heading"
      className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12"
    >
      {/* Header */}
      <div className="mb-6 max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
          <SparklesIcon className="h-4 w-4 text-gold" />
          {t.ai.eyebrow}
        </p>
        <h2
          id="ai-heading"
          className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {t.ai.heading}
        </h2>
        <p className="mt-2 text-muted">{t.ai.subline}</p>
      </div>

      {/* Bento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Hero */}
        <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-deep p-6 text-white sm:col-span-2">
          {/* soft gold glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
              <BotIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-semibold">{t.ai.heroTitle}</h3>
            <p className="mt-1.5 max-w-md text-sm text-white/80">
              {t.ai.heroDesc}
            </p>
          </div>
          <Link
            href="/buyobot"
            className="relative mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep"
          >
            {t.ai.cta}
            <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>

        {/* Feature tools */}
        {aiFeatures.map((feature) => {
          const Icon = feature.icon;
          const copy = t.ai.features[feature.key];
          return (
            <Link
              key={feature.key}
              href={feature.href}
              className="group relative flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-elevation)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-icon transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <ArrowRightShortIcon className="h-4 w-4 -translate-x-1 text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-brand-icon group-hover:opacity-100 rtl:-scale-x-100" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                {copy.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{copy.desc}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
