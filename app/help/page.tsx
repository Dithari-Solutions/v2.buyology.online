import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/pages/StaticPage";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.pages.helpTitle };
}

export default async function HelpPage() {
  const t = await getDict();
  const p = t.pages;
  const topics = [
    { h: p.helpOrders, hint: p.helpOrdersHint, href: "/account" },
    { h: p.helpShipping, hint: p.helpShippingHint, href: "/shipping" },
    { h: p.helpReturns, hint: p.helpReturnsHint, href: "/returns" },
  ];
  return (
    <StaticPage title={p.helpTitle} subtitle={p.helpIntro}>
      <div className="grid gap-4 sm:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h2 className="font-semibold text-foreground">{topic.h}</h2>
            <p className="mt-1.5 text-sm text-muted">{topic.hint}</p>
          </Link>
        ))}
      </div>
      <p>
        <Link
          href="/contact"
          className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {p.helpContactCta}
        </Link>
      </p>
    </StaticPage>
  );
}
