import type { Metadata } from "next";
import { StaticPage } from "@/components/pages/StaticPage";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.pages.aboutTitle };
}

export default async function AboutPage() {
  const t = await getDict();
  const p = t.pages;
  return (
    <StaticPage title={p.aboutTitle}>
      <p className="text-muted">{p.aboutP1}</p>
      <p className="text-muted">{p.aboutP2}</p>
    </StaticPage>
  );
}
