"use client";

import dynamic from "next/dynamic";
import { useCookieConsent } from "./CookieConsentProvider";

const GiveawayPromo = dynamic(() => import("@/components/home/GiveawayPromo").then(m => m.GiveawayPromo), { ssr: false });
const SignupPrompt = dynamic(() => import("@/components/auth/SignupPrompt").then(m => m.SignupPrompt), { ssr: false });

export function ConsentPromotions() {
  const { consent } = useCookieConsent();
  if (!consent?.marketing) return null;
  return <><GiveawayPromo /><SignupPrompt /></>;
}
