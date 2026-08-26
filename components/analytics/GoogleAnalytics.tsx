import Script from "next/script";

/**
 * Google Analytics 4, loaded only when a measurement ID is configured.
 *
 * The site already reports page views to Buyology's own dashboard metric, but that is invisible
 * to outside tooling and to anyone who expects GA — an SEO audit reported "no analytics tool
 * installed" for exactly that reason. This adds the industry-standard tag without making it a
 * hard dependency: with NEXT_PUBLIC_GA_ID unset the component renders nothing at all, so no third
 * party is contacted and nothing about the page changes.
 *
 * `afterInteractive` on purpose — analytics must never compete with the page for the main thread
 * before it is usable, which is the Core Web Vitals cost of a badly placed tag.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
