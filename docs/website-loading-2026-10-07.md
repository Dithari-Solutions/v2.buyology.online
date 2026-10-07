# Website loading improvements — 7 October 2026

## Findings

Public production samples returned homepage HTML in about 0.6 seconds, the first product API page in about 1.3 seconds and stories in about 0.3 seconds. These are individual network samples, not browser LCP measurements.

The homepage eagerly requested four large hero images. Together the measured WebP responses were approximately 442 KB. The first image alone was 160,800 bytes at quality 90; the same image at quality 75 measured 71,746 bytes. The product grid previously requested its first page only after JavaScript hydration.

## Changed

- Initial homepage HTML contains only the leading hero image. The next slide is prepared after it loads; selecting another slide loads it on demand. Carousel controls, autoplay, swipe and reduced-motion behavior remain.
- Hero images use the already allowed quality 75 setting.
- The unfiltered `/products` page streams real product cards from a market-aware server fetch. The browser continues to revalidate prices and handles failures. Category/brand-filtered pages keep their existing full-result search and do not briefly display unfiltered cards.
- Giveaway lookup has its own streaming boundary, so it cannot block the rest of the homepage.
- The cart drawer panel and its dependencies load when the drawer is opened.
- Existing promotion-boundary caching and the uncached flash-sale feed remain in place.

## Verified

Production build, type checking and scoped lint passed. Ten targeted tests passed, including initial hero HTML, explicit market/currency propagation, cache expiry/account isolation and notification routing.

The standalone production preview, configured with the public backend URL, returned nine real product cards in the initial product-page HTML and one hero image in the initial homepage HTML. It also retained the two side-banner images. Initial JavaScript was modestly smaller (850,924 versus 858,889 uncompressed bytes), with one fewer initial script request.

Two existing `ProductsView` effect-related lint errors remain. No new lint errors were introduced. Browser LCP and physical-device interaction measurements remain pending; local HTML/network samples do not establish production speed after deployment.

## Release

Deploy this website commit to both website nodes using the existing build-once procedure in `DEPLOY.md`. Retain old static chunks and deploy the same artifact on both nodes. No backend redeploy, database migration or new credential is required. Verify homepage images, swipe/autoplay, unfiltered and filtered products, language/market switching, and opening the cart after deployment.
