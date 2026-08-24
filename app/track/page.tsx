import type { Metadata } from "next";
import { StaticPage } from "@/components/pages/StaticPage";
import { TrackOrder } from "@/components/account/TrackOrder";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.pages.trackTitle, robots: { index: false, follow: true } };
}

export default async function TrackPage() {
  const t = await getDict();
  return (
    <StaticPage title={t.pages.trackTitle} subtitle={t.pages.trackIntro}>
      <TrackOrder />
    </StaticPage>
  );
}
