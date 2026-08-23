import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { getDict } from "@/lib/i18n/server";
import {
  GamepadIcon,
  HeadphonesIcon,
  LaptopIcon,
  RentIcon,
  WatchIcon,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.footer.links.rent,
    description: t.pages.rent.body,
    robots: { index: false, follow: true },
  };
}

const GHOSTS = [
  { icon: LaptopIcon, tilt: "-rotate-2" },
  { icon: GamepadIcon, tilt: "rotate-1" },
  { icon: HeadphonesIcon, tilt: "-rotate-1" },
  { icon: WatchIcon, tilt: "rotate-2" },
];

/** Coming-soon as a shelf of ghost rentals: the devices are real, the prices not yet. */
export default async function RentPage() {
  const t = await getDict();
  const p = t.pages.rent;
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[980px] px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-icon">
          <RentIcon className="h-7 w-7" />
        </span>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-warn dark:text-gold">
          {p.kicker}
        </p>
        <h1 className="mx-auto mt-2 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {p.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-muted">{p.body}</p>

        {/* The shelf: tilted ghost cards with dashes where prices will live */}
        <ul className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4" aria-hidden="true">
          {GHOSTS.map(({ icon: Icon, tilt }, i) => (
            <li
              key={i}
              className={`${tilt} rounded-2xl border-2 border-dashed border-border-strong bg-surface p-5 transition-transform duration-300 hover:rotate-0`}
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-surface-2">
                <Icon className="h-8 w-8 text-brand-icon/60" />
              </span>
              <p className="mt-4 h-2.5 w-3/4 rounded-full bg-surface-2" />
              <p className="mt-2 flex items-baseline justify-center gap-1 text-sm font-semibold text-foreground" dir="ltr">
                <span className="tracking-widest text-muted">— —</span>
                <span className="text-xs font-normal text-muted">{p.perDay}</span>
              </p>
              <span className="mt-3 inline-block rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-warn dark:text-gold">
                {p.soon}
              </span>
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
