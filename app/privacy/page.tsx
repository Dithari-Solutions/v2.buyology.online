import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { LegalArticle } from "@/components/pages/LegalArticle";
import { privacy } from "@/lib/legal/privacy";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/privacy", {
  title: "Privacy Policy",
});
}

export default function Page() {
  return <LegalArticle doc={privacy} />;
}
