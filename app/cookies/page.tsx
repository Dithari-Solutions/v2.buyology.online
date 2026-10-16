import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { LegalArticle } from "@/components/pages/LegalArticle";
import { cookies } from "@/lib/legal/cookies";
import { CookieSettingsButton } from "@/components/privacy/CookieBanner";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/cookies", {
  title: "Cookies & Local Storage",
});
}

export default function Page() {
  return <><LegalArticle doc={cookies} /><div className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6"><CookieSettingsButton className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div></>;
}
