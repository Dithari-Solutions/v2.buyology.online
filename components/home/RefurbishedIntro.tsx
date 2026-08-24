import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import {
  ArrowRightShortIcon,
  CheckIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@/components/icons";

/**
 * The page's H1 and its plain answer to "what is sold here".
 *
 * An audit found the home page had NO H1 at all and 600 words of mostly navigation text, so
 * search engines had nothing to read the page's subject from — the giveaway headline was the
 * loudest thing on it. This section states the subject once, in the words shoppers actually
 * search ("certified refurbished laptops", the brands, the warranty, the emirates served),
 * and it earns its place for humans too: it is the answer to "is this legitimate?", which is
 * the first question anyone buying refurbished asks.
 */
export async function RefurbishedIntro() {
  const t = await getDict();
  const r = t.refurbished;

  const points = [
    { icon: ShieldCheckIcon, title: r.point1Title, body: r.point1Body },
    { icon: CheckIcon, title: r.point2Title, body: r.point2Body },
    { icon: TruckIcon, title: r.point3Title, body: r.point3Body },
  ];

  return (
    <section
      aria-labelledby="refurbished-heading"
      className="mx-auto w-full max-w-[1400px] px-4 pt-8 sm:px-6 sm:pt-10"
    >
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <h1
            id="refurbished-heading"
            className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
          >
            {r.h1}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{r.lead}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{r.body}</p>
        </div>

        <ul className="mt-7 grid gap-4 sm:grid-cols-3">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <li key={point.title} className="rounded-2xl border border-border bg-surface-2 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-icon">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <h2 className="mt-3 text-sm font-semibold text-foreground">{point.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{point.body}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {r.cta}
            <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
          <Link
            href="/warranty"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {r.warrantyCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
