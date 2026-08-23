import type { Metadata } from "next";
import { LegalArticle } from "@/components/pages/LegalArticle";
import { cookies } from "@/lib/legal/cookies";

export const metadata: Metadata = {
  title: "Cookies & Local Storage",
};

export default function Page() {
  return <LegalArticle doc={cookies} />;
}
