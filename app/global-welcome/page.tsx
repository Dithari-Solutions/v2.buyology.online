import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";
import { MARKETS } from "@/lib/market";
import { Logo } from "@/components/header/Logo";
import { GlobeIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.pages.globalTitle,
    description: t.pages.globalBody,
    robots: { index: false, follow: false },
  };
}

/**
 * web.buyology.online — where visitors from countries we don't serve (yet) land.
 * No shop, no prices: an honest "we're not in your region yet" with the doors we do have.
 */
export default async function GlobalWelcomePage() {
  const t = await getDict();
  const p = t.pages;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[820px] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <Logo />
      <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
        <GlobeIcon className="h-8 w-8" />
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {p.globalTitle}
      </h1>
      <p className="mt-3 max-w-lg text-muted">{p.globalBody}</p>
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-muted">
        {p.globalRegions}
      </h2>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {MARKETS.map((m) => (
          <li key={m.host}>
            <a
              href={`https://${m.host}/?choose-region=1`}
              className="inline-block rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {p.regionNames[m.countryCode] ?? m.countryCode}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
