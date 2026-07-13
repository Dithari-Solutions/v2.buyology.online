"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/i18n/language-provider";
import { Logo } from "@/components/header/Logo";
import { REVIEW_COUNT, REVIEW_SCORE } from "@/lib/metrics";
import {
  BotIcon,
  CheckIcon,
  ChevronLeftIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";

const compactReviews = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 0,
}).format(REVIEW_COUNT);

/** Split-screen auth layout with a rich, animated Buyology brand panel. */
export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const perks = [t.auth.perks.delivery, t.auth.perks.ai, t.auth.perks.warranty];

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div
        className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col xl:p-14"
        style={{
          background:
            "linear-gradient(155deg, #4a2f8f 0%, #2e1065 50%, #160734 100%)",
        }}
      >
        {/* Ambient decor */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -end-24 -top-24 h-96 w-96 rounded-full bg-gold/25 blur-[90px]" />
          <div className="absolute -bottom-28 -start-24 h-[26rem] w-[26rem] rounded-full bg-[#7c3aed]/40 blur-[100px]" />
          <div className="absolute end-1/4 top-1/2 h-72 w-72 rounded-full bg-[#d946ef]/20 blur-[90px]" />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Logo */}
        <Link
          href="/"
          aria-label="Buyology home"
          className="relative z-10 inline-flex w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <Image
            src="/buyology-online-logo-dark.png"
            alt="Buyology"
            width={318}
            height={70}
            className="h-8 w-auto"
          />
        </Link>

        {/* Floating glass cards */}
        <div className="relative z-10 my-6 flex-1">
          <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
            <div className="buyo-float absolute end-0 top-2 w-60 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-[#2e1065]">
                  <BotIcon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">Buyobot</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/80">
                {t.auth.floatChat}
              </p>
            </div>

            <div
              className="buyo-float-slow absolute start-2 top-[42%] rounded-full border border-white/15 bg-white/10 px-4 py-2.5 shadow-xl backdrop-blur-md"
              style={{ animationDelay: "1.2s" }}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold" dir="ltr">
                <StarIcon className="h-4 w-4 text-gold" />
                {REVIEW_SCORE.toFixed(1)} · {compactReviews} {t.cart.reviews}
              </span>
            </div>

            <div
              className="buyo-float absolute bottom-2 end-8 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md"
              style={{ animationDelay: "2.4s" }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <TruckIcon className="h-4 w-4 text-gold" />
              </span>
              <div>
                <p className="text-xs font-semibold">{t.auth.perks.delivery}</p>
                <p className="text-[10px] text-white/60">{t.metrics.heading}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Headline + perks */}
        <div className="relative z-10 max-w-md">
          <h2 className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-[2.5rem] font-semibold leading-[1.08] text-transparent">
            {t.auth.welcomeTitle}
          </h2>
          <p className="mt-4 max-w-sm text-white/70">{t.auth.welcomeSub}</p>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {perks.map((pk) => (
              <li key={pk} className="flex items-center gap-2 text-sm text-white/85">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-[#2e1065]">
                  <CheckIcon className="h-3 w-3" />
                </span>
                {pk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form */}
      <div className="relative flex items-center justify-center px-6 py-10 sm:px-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -start-24 top-8 h-64 w-64 rounded-full bg-brand-soft blur-3xl" />
          <div className="absolute -end-20 bottom-4 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
        </div>

        <div className="buyo-rise relative w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <Logo className="lg:hidden" />
            <Link
              href="/"
              className="ms-auto inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
              {t.pdp.home}
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
