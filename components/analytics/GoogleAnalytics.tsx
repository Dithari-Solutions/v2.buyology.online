import Script from "next/script";

/**
 * Google Analytics 4, loaded only when a measurement ID is configured.
 *
 * An SEO audit flagged that no analytics tool could be detected — traffic to this shop is
 * currently unmeasured. This ships the wiring so switching it on is one environment variable
 * (`NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`) and a rebuild, with no code change and nothing loaded for
 * visitors until then: an unset ID renders nothing at all rather than an empty tag.
 *
 * `afterInteractive` keeps the tag off the critical path — analytics must never be what makes
 * a page slow, especially with Core Web Vitals already failing on LCP.
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
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
