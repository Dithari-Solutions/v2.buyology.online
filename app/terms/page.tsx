import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { LegalArticle } from "@/components/pages/LegalArticle";
import { terms } from "@/lib/legal/terms";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/terms", {
  title: "Terms & Conditions",
});
}

export default function Page() {
  return <LegalArticle doc={terms} />;
}
