import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { getDict } from "@/lib/i18n/server";
import { productCategories } from "@/lib/nav-data";
import { ArrowRightShortIcon, SearchIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page has moved or no longer exists.",
};

/**
 * Global 404. Next routes every unmatched URL here and injects `noindex`
 * itself, so no robots metadata is needed.
 *
 * The artwork is the brand's own B-Wave: the guide describes it as the pulse of
 * the market, so a missing page is drawn as that pulse giving out — three
 * cycles, then flatline. Recovery routes (search, categories) sit directly
 * underneath, because a 404 on a shop should still sell.
 */
export default async function NotFound() {
  const t = await getDict();
  const categories = productCategories.slice(0, 6);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface-2 px-5 py-12 sm:px-10 sm:py-16">
          {/* Ambient brand wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -end-24 -top-28 h-80 w-80 rounded-full bg-primary-soft blur-3xl" />
            <div className="absolute -bottom-32 -start-20 h-80 w-80 rounded-full bg-brand-soft blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-warn dark:text-gold">
              {t.notFound.eyebrow}
            </p>

            <p className="mt-4 font-display text-[clamp(4.5rem,18vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.04em] text-brand-icon">
              404
            </p>

            {/* Pulse → flatline */}
            <svg
              viewBox="0 0 1200 120"
              role="presentation"
              aria-hidden="true"
              className="mt-2 h-16 w-full rtl:-scale-x-100 sm:h-20"
              style={{ ["--buyo-trace-len" as string]: "1600" }}
            >
              <path
                d="M0 60 C 30 60 30 20 60 20 C 90 20 90 100 120 100 C 150 100 150 20 180 20 C 210 20 210 100 240 100 C 270 100 270 20 300 20 C 330 20 330 100 360 100 C 390 100 390 60 420 60"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="10"
                strokeLinecap="round"
                className="buyo-trace"
              />
              <path
                d="M420 60 L1200 60"
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="2 26"
              />
              <circle cx="420" cy="60" r="11" fill="var(--color-gold)" className="buyo-blip" />
            </svg>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.notFound.title}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-muted">{t.notFound.body}</p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.notFound.home}
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border-strong px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t.notFound.browse}
                <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
            </div>

            <Link
              href="/search"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <SearchIcon className="h-4 w-4" />
              {t.header.searchPlaceholder}
            </Link>
          </div>
        </section>

        {/* Recovery routes — a 404 on a shop should still sell. */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {t.notFound.categoriesTitle}
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-icon transition-colors group-hover:bg-primary group-hover:text-primary-fg">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {t.items[c.key].label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}
