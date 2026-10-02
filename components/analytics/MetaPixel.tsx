import Script from "next/script";

/** Public by nature — it ships in every page's HTML — so it lives here rather than in env. */
const PIXEL_ID = "1389023989829180";

/**
 * Meta Pixel base code: initialises the pixel and records the landing PageView.
 *
 * Client-side navigations need nothing extra. fbevents.js wraps history.pushState/replaceState
 * and listens for popstate, sending its own PageView whenever the URL changes — which is exactly
 * how the App Router navigates. A usePathname listener here would count every page twice.
 *
 * `afterInteractive` for the same reason as GoogleAnalytics: a tag must never compete with the
 * page for the main thread before it is usable. The `id` also keeps the init from re-running if
 * this ever remounts.
 */
export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* Meta's no-JS fallback is a 1×1 tracking beacon, not content — next/image has no place here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
