import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/pages/StaticPage";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.pages.trackTitle };
}

export default async function TrackPage() {
  const t = await getDict();
  const p = t.pages;
  return (
    <StaticPage title={p.trackTitle}>
      <p className="text-muted">{p.trackIntro}</p>
      <p>
        <Link
          href="/account"
          className="inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {p.trackCta}
        </Link>
      </p>
    </StaticPage>
  );
}
