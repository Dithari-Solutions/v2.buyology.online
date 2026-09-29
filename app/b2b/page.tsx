import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { getDict } from "@/lib/i18n/server";
import {
  BuildingIcon,
  CheckIcon,
  HeadphonesIcon,
  ShieldCheckIcon,
  TagIcon,
  TruckIcon,
} from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.pages.b2b.metaTitle,
    description: t.pages.b2b.hero.subtitle,
  };
}

/**
 * B2B — bulk pricing for businesses, schools and organisations.
 *
 * <p>The content is carried over from the previous storefront's B2B landing page: the same tier
 * table, the same four reasons and the same four steps, so a customer who knew the old page finds
 * the same offer here rather than a different one.
 *
 * <p>The tiers are the part to be careful with. They are the commercial offer, quoted publicly, so
 * they live in the dictionary beside the rest of the copy rather than being hardcoded here — and the
 * discount figures must match whatever the B2B team actually honours on a quote.
 *
 * <p>What is deliberately NOT here yet: the quote cart, the RFQ flow, the member product catalogue
 * and the B2B account area. Those are a feature, not a page, and they need the backend's quote
 * endpoints wired up. Until then the call to action goes to Contact, which reaches the same team.
 */
export default async function B2bPage() {
  const t = await getDict();
  const p = t.pages.b2b;

  const benefitIcons = [TagIcon, HeadphonesIcon, TruckIcon, ShieldCheckIcon];

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            <BuildingIcon className="h-3.5 w-3.5" />
            {p.badge}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {p.hero.title}{" "}
            <span className="text-brand dark:text-gold">{p.hero.titleHighlight}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {p.hero.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact?subject=b2b"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {p.hero.cta}
            </Link>
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {p.hero.ctaSecondary}
            </Link>
          </div>
        </section>

        {/* Tiers */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{p.tiers.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{p.tiers.subtitle}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {p.tiers.rows.map((tier) => (
              <li
                key={tier.label}
                className={`relative rounded-2xl border p-5 ${
                  tier.badge
                    ? "border-gold bg-gold/5"
                    : "border-border bg-surface"
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 start-5 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-brand-deep">
                    {tier.badge}
                  </span>
                )}
                <p className="text-sm font-semibold text-foreground">{tier.label}</p>
                <p className="mt-1 text-xs text-muted">{tier.range}</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground" dir="ltr">
                  {tier.discount}
                </p>
                <p className="text-xs text-muted">{tier.discountNote}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Why */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {p.benefits.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{p.benefits.subtitle}</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {p.benefits.items.map((benefit, i) => {
              const Icon = benefitIcons[i] ?? CheckIcon;
              return (
                <li
                  key={benefit.title}
                  className="flex gap-3 rounded-2xl border border-border bg-surface p-5"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{benefit.title}</p>
                    <p className="mt-1 text-sm text-muted">{benefit.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {p.howItWorks.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{p.howItWorks.subtitle}</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {p.howItWorks.steps.map((step) => (
              <li key={step.number} className="rounded-2xl border border-border bg-surface p-5">
                <span className="text-xs font-bold tracking-widest text-gold" dir="ltr">
                  {step.number}
                </span>
                <p className="mt-2 text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-sm text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Closing CTA */}
        <section className="mt-12 rounded-3xl border border-border bg-surface p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {p.closing.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{p.closing.subtitle}</p>
          <Link
            href="/contact?subject=b2b"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {p.hero.cta}
          </Link>
        </section>
      </main>
    </>
  );
}
