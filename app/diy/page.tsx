import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { getDict } from "@/lib/i18n/server";
import { HammerIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.footer.links.diy,
    description: t.pages.diy.body,
    robots: { index: false, follow: true },
  };
}

/** Coming-soon as a schematic: the page IS the blueprint being drawn. */
export default async function DiyPage() {
  const t = await getDict();
  const p = t.pages.diy;
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[880px] px-4 py-16 sm:px-6">
        <div
          className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          {/* Drafting corner ticks */}
          <span aria-hidden="true" className="absolute start-4 top-4 h-5 w-5 border-s-2 border-t-2 border-brand-icon/60" />
          <span aria-hidden="true" className="absolute end-4 top-4 h-5 w-5 border-e-2 border-t-2 border-brand-icon/60" />
          <span aria-hidden="true" className="absolute bottom-4 start-4 h-5 w-5 border-b-2 border-s-2 border-brand-icon/60" />
          <span aria-hidden="true" className="absolute bottom-4 end-4 h-5 w-5 border-b-2 border-e-2 border-brand-icon/60" />

          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-warn dark:text-gold">
            {p.kicker}
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {p.title}
          </h1>
          <p className="mt-4 max-w-lg text-muted">{p.body}</p>

          {/* The parts list, drawn in dashed outlines like an unbuilt thing */}
          <ol className="mt-10 max-w-lg space-y-3">
            {[p.item1, p.item2, p.item3].map((item, i) => (
              <li
                key={item}
                className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-border-strong bg-surface/70 p-4 backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border font-mono text-sm font-bold text-brand-icon">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-foreground">{item}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t.pages.browseProducts}
            </Link>
            <span className="flex items-center gap-2 font-mono text-xs text-muted">
              <HammerIcon className="h-4 w-4 text-gold" />
              {p.note}
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
