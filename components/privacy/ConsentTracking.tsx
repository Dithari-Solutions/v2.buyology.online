"use client";

import Script from "next/script";
import { useCookieConsent } from "./CookieConsentProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { GOOGLE_TAG_MANAGER_ID } from "@/components/analytics/GoogleTagManager";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { googleConsent } from "@/lib/consent";

/** Basic consent: no external scripts or cookieless tracking requests before opt-in. */
export function ConsentTracking() {
  const { consent } = useCookieConsent();
  if (!consent || (!consent.analytics && !consent.marketing)) return null;
  // GTM is an unrestricted third-party tag container: require both optional categories.
  // Analytics-only visitors use the direct GA4 tag even if full-consent visits use GTM.
  const allowContainer = consent.analytics && consent.marketing;
  return <>
    <Script id={`google-consent-${consent.decisionId}`} strategy="afterInteractive">
      {`gtag('consent','update',${JSON.stringify(googleConsent(consent.analytics, consent.marketing))});`}
    </Script>
    {allowContainer && <Script id="google-tag-manager" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');`}
    </Script>}
    {consent.analytics && <><GoogleAnalytics viaGtmAllowed={allowContainer} /><VisitTracker /></>}
    {consent.marketing && <MetaPixel />}
  </>;
}
