"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/i18n/language-provider";
import { Logo } from "@/components/header/Logo";
import { REVIEW_COUNT, REVIEW_SCORE } from "@/lib/metrics";
import { CheckIcon, ChevronLeftIcon, StarIcon } from "@/components/icons";

const compactReviews = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 0,
}).format(REVIEW_COUNT);

const ROTATE_MS = 3500;

/**
 * Split-screen auth layout.
 *
 * The brand panel is deliberately calm: one statement, one rotating perk, one line of real proof.
 * Its previous incarnation floated three miniature fake-UI "glass cards" over a dot grid — five
 * competing systems reading as template clutter. Everything shown now is real content the site
 * already ships (the translated perks, the review metrics); nothing is a mock screenshot.
 *
 * The rotating perk uses story-style progress segments — the same visual language as the story
 * feature on the home page. If a designer supplies a hero asset (3D render, illustration), it
 * slots into the free middle space; the panel is complete without one.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const perks = [t.auth.perks.delivery, t.auth.perks.ai, t.auth.perks.warranty];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setActive((i) => (i + 1) % perks.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [perks.length]);

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div
        className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col xl:p-14"
        style={{
          background:
            "linear-gradient(155deg, #665991 0%, #402f75 50%, #2b1f52 100%)",
        }}
      >
        {/* Two calm auroras — the only decoration. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -end-24 -top-24 h-96 w-96 rounded-full bg-gold/20 blur-[100px]" />
          <div className="absolute -bottom-32 -start-28 h-[28rem] w-[28rem] rounded-full bg-brand-400/40 blur-[110px]" />
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

        {/* Statement */}
        <div className="relative z-10 my-auto max-w-md py-10">
          <h2 className="bg-gradient-to-br from-white to-white/70 bg-clip-text text-[2.75rem] font-semibold leading-[1.08] text-transparent [text-wrap:balance]">
            {t.auth.welcomeTitle}
          </h2>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-white/70">
            {t.auth.welcomeSub}
          </p>

          {/* One rotating perk, story-style progress. */}
          <div className="mt-12 max-w-sm">
            <div className="flex gap-1.5" dir="ltr" aria-hidden="true">
              {perks.map((_, i) => (
                <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/20">
                  <span
                    className={`block h-full rounded-full bg-gold transition-[width] duration-500 ${
                      i < active ? "w-full" : i === active ? "w-full" : "w-0"
                    }`}
                    style={i === active ? { transitionDuration: `${ROTATE_MS}ms` } : undefined}
                  />
                </span>
              ))}
            </div>
            <div className="relative mt-4 h-8">
              {perks.map((perk, i) => (
                <p
                  key={perk}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 flex items-center gap-2.5 text-lg font-medium transition-opacity duration-500 ${
                    i === active ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/90 text-brand">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {perk}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Real proof, one quiet line. */}
        <div className="relative z-10 flex items-center gap-2 text-sm text-white/75" dir="ltr">
          <StarIcon className="h-4 w-4 text-gold" />
          <span className="font-semibold text-white">{REVIEW_SCORE.toFixed(1)}</span>
          <span aria-hidden="true">·</span>
          <span>
            {compactReviews} {t.cart.reviews}
          </span>
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
