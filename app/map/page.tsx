import type { Metadata } from "next";
import { ComingSoon } from "@/components/pages/ComingSoon";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.pages.pageMap, robots: { index: false, follow: true } };
}

export default async function Page() {
  const t = await getDict();
  return <ComingSoon title={t.pages.pageMap} />;
}
