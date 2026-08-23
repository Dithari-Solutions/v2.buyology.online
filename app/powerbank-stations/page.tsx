import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { getDict } from "@/lib/i18n/server";
import { BatteryChargingIcon, CheckIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.footer.links.powerbank,
    description: t.pages.powerbank.body,
    robots: { index: false, follow: true },
  };
}

/** Coming-soon as a charging metaphor: the network itself is filling up. */
export default async function PowerbankPage() {
  const t = await getDict();
  const p = t.pages.powerbank;
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[880px] px-4 py-20 text-center sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-warn dark:text-gold">
          {p.kicker}
        </p>
        <h1 className="mx-auto mt-3 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {p.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-muted">{p.body}</p>

        {/* The battery: outline in border tokens, fill in Mikado, forever nearly there */}
        <div className="mx-auto mt-12 flex w-full max-w-md items-center gap-1.5" aria-hidden="true">
          <div className="relative h-20 flex-1 rounded-2xl border-2 border-border-strong bg-surface p-2">
            <div className="buyo-charge h-full w-full rounded-xl bg-gradient-to-r from-primary to-gold/70" />
            <span className="absolute inset-0 flex items-center justify-center">
              <BatteryChargingIcon className="h-8 w-8 text-foreground/70" />
            </span>
          </div>
          <div className="h-8 w-2.5 rounded-e-md bg-border-strong" />
        </div>

        <ul className="mx-auto mt-12 grid max-w-2xl gap-3 text-start sm:grid-cols-3">
          {[p.point1, p.point2, p.point3].map((point) => (
            <li
              key={point}
              className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface p-4 text-sm text-muted"
            >
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
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
