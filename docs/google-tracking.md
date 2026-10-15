# Google tracking

The root layout includes Google Tag Manager container `GTM-WVVSH2PS` on every
route, including sign-up and login. The bootstrap uses Next.js `beforeInteractive`
in the head; its iframe fallback is declared first inside the body. Next.js may
prepend its own empty, hidden streaming placeholder before that fallback. The shared
layout and stable script ID keep the container from loading again during navigation.

Google Analytics measurement ID `G-33199BYJE6` is also installed directly. The
published GTM container was reachable but had no tags on 15 October 2026, so the
direct GA4 tag remains enabled to keep page-view tracking working.

## Publishing tags and moving GA4 into GTM

Website deployment and GTM publication are separate steps. Workspace changes in
Tag Manager do not affect visitors until they are published. Use Preview / Tag
Assistant to check the intended tags before publishing them.

If GA4 stays installed directly, do not add another Google tag for `G-33199BYJE6`
inside GTM. To move this measurement ID into the container, configure and preview
the Google tag there, then coordinate its publication with a website rebuild using
`NEXT_PUBLIC_GA_VIA_GTM=true`. This setting disables the direct GA4 snippet; it
does not disable GTM. Until the GTM Google tag is ready, leave this setting unset.

Do not configure a second Meta Pixel base tag for `1389023989829180` in the
container while the existing `MetaPixel` component owns that pixel.

GA4 enhanced measurement currently tracks Next.js history navigation. Avoid
adding manual page-view triggers for the same navigation while that is enabled.

## Verification after deployment

1. Open the homepage, `/signup`, and `/login` in a browser with tracking allowed.
2. Confirm `gtm.js?id=GTM-WVVSH2PS` returns HTTP 200 and the data layer contains
   one `gtm.js` event per full page load.
3. Navigate using site links and the back button. The container must not reload;
   GA4 should record one page view per actual navigation.
4. Confirm GA4 collection requests use `tid=G-33199BYJE6` and succeed. Check
   Realtime / DebugView in the Analytics account and GTM Preview for account-level
   verification.
5. With JavaScript disabled, confirm a `noscript` containing
   `ns.html?id=GTM-WVVSH2PS` appears before the application content in the body.

Follow [DEPLOY.md](../DEPLOY.md) to deploy the same website build to both replicas.
Google's [installation guide](https://support.google.com/tagmanager/answer/14847097)
and [verification and publication guide](https://support.google.com/tagmanager/answer/14842769)
describe the corresponding GTM steps.
