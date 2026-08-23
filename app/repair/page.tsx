import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { getDict } from "@/lib/i18n/server";
import { WrenchIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.repair.landing.heroTitle, description: t.repair.landing.heroSubtitle };
}

export default async function RepairLandingPage() {
  const t = await getDict();
  const r = t.repair.landing;
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <section className="rounded-3xl border border-border bg-surface p-8 sm:p-12">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
            <WrenchIcon className="h-7 w-7" />
          </span>
          <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {r.heroTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">{r.heroSubtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/repair/new"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {r.startCta}
            </Link>
            <Link
              href="/repair/my"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {r.viewRequests}
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {r.howItWorks}
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {r.steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-icon">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl border border-border bg-surface p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{r.ctaTitle}</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">{r.ctaBody}</p>
          <Link
            href="/repair/new"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {r.startCta}
          </Link>
        </section>
      </main>
    </>
  );
}
