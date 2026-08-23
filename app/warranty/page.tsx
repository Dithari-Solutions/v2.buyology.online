import type { Metadata } from "next";
import Link from "next/link";
import { StaticPage } from "@/components/pages/StaticPage";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.pages.warrantyTitle };
}

export default async function WarrantyPage() {
  const t = await getDict();
  const p = t.pages;
  return (
    <StaticPage title={p.warrantyTitle}>
      <p className="text-muted">{p.warrantyP1}</p>
      <p className="text-muted">{p.warrantyP2}</p>
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
