import Link from "next/link";
import { Header } from "@/components/header/Header";
import { getDict } from "@/lib/i18n/server";
import { SparklesIcon } from "@/components/icons";

/**
 * Honest, designed placeholder for a service that hasn't moved to the new site yet —
 * soft aura, gradient ring, and real doors out. Never a 404 for something that's coming.
 */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getDict();
  return (
    <>
      <Header />
      <main className="relative mx-auto flex w-full max-w-[820px] flex-col items-center overflow-hidden px-4 py-28 text-center sm:px-6">
        {/* Soft brand auras behind the content */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 start-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-brand-soft opacity-60 blur-3xl rtl:translate-x-1/2"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 end-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl"
        />

        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-soft to-surface-2 ring-1 ring-border">
          <SparklesIcon className="h-9 w-9 text-brand-icon" />
        </span>
        <p className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-warn dark:text-gold">
          {t.pages.comingSoonKicker}
        </p>
        <h1 className="relative mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="relative mt-4 max-w-md text-muted">{t.pages.comingSoonHint}</p>
        <div className="relative mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.pages.browseProducts}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.pages.backHome}
          </Link>
        </div>
        <p className="relative mt-8 text-xs text-muted">{t.pages.comingSoonNewsletter}</p>
      </main>
    </>
  );
}
