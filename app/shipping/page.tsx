import type { Metadata } from "next";
import { StaticPage, Section } from "@/components/pages/StaticPage";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.pages.shipTitle };
}

export default async function ShippingPage() {
  const t = await getDict();
  const p = t.pages;
  return (
    <StaticPage title={p.shipTitle} subtitle={p.shipIntro}>
      <Section heading={p.shipStandardH}><p>{p.shipStandardP}</p></Section>
      <Section heading={p.shipExpressH}><p>{p.shipExpressP}</p></Section>
      <Section heading={p.shipPickupH}><p>{p.shipPickupP}</p></Section>
      <Section heading={p.shipFreeH}><p>{p.shipFreeP}</p></Section>
      <p className="text-sm text-muted">{p.shipNote}</p>
    </StaticPage>
  );
}
