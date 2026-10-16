import Script from "next/script";

const MEASUREMENT_ID = "G-33199BYJE6";

/**
 * Shared Google tag for every route, including authentication pages.
 * Load after hydration with Next's script deduplication across navigation.
 */
export function GoogleAnalytics({ viaGtmAllowed = true }: { viaGtmAllowed?: boolean }) {
  // Enable only after publishing this measurement ID inside GTM. One owner
  // prevents the direct snippet and the container counting the same visit twice.
  if (viaGtmAllowed && process.env.NEXT_PUBLIC_GA_VIA_GTM === "true") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
