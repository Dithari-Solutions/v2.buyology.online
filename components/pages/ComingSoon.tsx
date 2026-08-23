import Link from "next/link";
import { Header } from "@/components/header/Header";
import { getDict } from "@/lib/i18n/server";
import { SparklesIcon } from "@/components/icons";

/** Honest placeholder for a service that hasn't moved to the new site yet. */
export async function ComingSoon({ title }: { title: string }) {
  const t = await getDict();
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-[820px] flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
          <SparklesIcon className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-3 max-w-md text-muted">{t.pages.comingSoonHint}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
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
      </main>
    </>
  );
}
