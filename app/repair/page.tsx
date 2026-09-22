import type { Metadata } from "next";
import { ComingSoon } from "@/components/pages/ComingSoon";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.footer.links.repair };
}

/**
 * Repair is not taking requests on the new site yet, so the landing page says so plainly
 * rather than inviting a booking nobody will answer. The request flow itself is still
 * there ({@code /repair/new} redirects here; {@code /repair/my} and the detail pages stay
 * reachable), so customers with a repair already under way can follow it.
 */
export default async function Page() {
  const t = await getDict();
  return <ComingSoon title={t.footer.links.repair} />;
}
