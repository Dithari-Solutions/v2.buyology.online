# SEO, performance and cookie preferences — 16 October 2026

## Scope of the supplied documents

` SEO .pdf` (2 pages) and `Technical Seo (3).pdf` (14 pages; last page blank)
are general SEO checklists, not instructions to install WordPress or access
external accounts. The user requested implementation in the existing Next.js v2
storefront, responsive/performance improvements, and cookie details in the admin
dashboard. Rank Math/Yoast are WordPress plugins and do not apply here.

| PDF topic | Implementation / remaining account work |
| --- | --- |
| Titles, descriptions and canonical tags | Shared route metadata; independent public-page canonicals; actual category/product metadata; clean query URLs and market-aware absolute URLs. |
| Indexing and duplicate content | Private/search/prelaunch pages excluded from indexing; unknown URLs return 404; upstream product errors are not reported as missing products; preview host noindex; www redirects permanently to HTTPS bare domain. TLS and HTTP-to-HTTPS remain the hosting proxy's responsibility. |
| Sitemap and robots | Actual market catalogue enumerated to its end instead of a fixed eight-page cap; populated categories and published articles only; no fabricated last-modified dates or search/account/service placeholders. Consistent robots rules. |
| Languages | Stable `?lang=ar` / `?lang=az` URLs, matching HTML language/direction, reciprocal alternates on translated content. English-only policies canonicalize to English; articles do not advertise unverified translations. |
| Structured data | Offers use actual SKU, currency, stock, condition and canonical product URL. Unknown manufacturers/ratings are not invented. Existing FAQ and organization data retained. |
| Mobile usability and speed | Lazy support/story/promotion code, consent-gated third-party traffic, local variable fonts, prioritized first hero image, larger carousel targets, inactive-slide focus handling, reduced layout shifts and accessible control names. |
| Google tools, indexing, ranks and backlinks | Existing Search Console verification preserved. Account-level submission/URL Inspection, GA4 DebugView, GTM Preview/publication, rank tracking and backlink analysis require the specialist's account access; no account changes claimed. |

Category cards are now present in server HTML, including filtered categories. Prices
used for checkout still come from the authoritative checkout API; sitemap caching
does not introduce price caching into checkout.

## Cookie behavior and dashboard

The English, Azerbaijani and Arabic banner offers Reject optional, Customize and
Accept all. Settings remain available in the footer and on `/cookies`. Necessary
account/cart/payment preferences work without analytics or marketing permission.

No Google/Meta scripts or visit beacons load before an optional choice. Analytics
permits direct GA4 and first-party visit counts. Marketing permits Meta Pixel.
The unrestricted GTM container requires **both** optional categories. The
JavaScript-disabled iframe also requires a previously saved full consent choice.
Google Consent Mode defaults all optional purposes to denied before tags execute.
Withdrawal clears known optional storage and reloads the document to stop loaded
history hooks, preserving cart, theme and payment recovery state.

Preferences last 180 days in `buyology-consent`; production regional hosts share
the preference cookie. A policy-version change or expiry asks for a new choice.
Audit writes retry idempotently. Blocking storage or an unavailable audit API does
not turn a declined choice into permission. Records are anonymous browser choices,
not verified user identity or proof of legal compliance.

**Dashboard → Cookie consent** (`/admin/cookie-consents`, superadmins only) shows
decision history, filters, pagination, policy version, receipt time, website and
cookie purposes/retention. Raw cookies, authentication tokens and customer IPs are
not collected for this page. Default audit retention is 365 days. Deploy backend
migration V67 first; earlier visits will not appear retroactively.

## Tracking ownership

- GTM: `GTM-WVVSH2PS`; GA4: `G-33199BYJE6`.
- Keep direct GA4 enabled until the specialist has configured and previewed a
  proper base Google tag in GTM. Coordinate publication with a storefront rebuild
  using `NEXT_PUBLIC_GA_VIA_GTM=true`; analytics-only choices still use direct GA4.
- Avoid adding duplicate GA4 page views or the existing Meta Pixel base tag in
  GTM. Review new container tags against the consent categories.
- Test Tag Assistant after accepting both categories. A fresh/rejected visit
  deliberately does not load GTM. Verify navigation page views and purchase
  deduplication in the relevant accounts after deployment.

This document supplements the earlier tracking instructions, whose unconditional
loading assumptions are superseded by the explicit cookie choices described here.

## Verification

- Storefront and dashboard production builds, TypeScript and scoped lint checks.
- 10 storefront unit checks; 43 focused backend consent/security/analytics/HTTP-status checks.
- Production HTTP checks: unique public metadata, canonicals, Search Console tag,
  language URLs, private/search/prelaunch noindex, 404s, host redirects and sitemap.
- Browser checks: fresh/rejected/partial/full consent, withdrawal, audit retries,
  JavaScript-disabled fallbacks, RTL widths 320/390/768/1440, dashboard filters,
  pagination, mobile layout, error retry and non-superadmin denial.
- Checkout regression uses mocked writes/payments: country/profile refresh,
  address selection, phone/name without SMS, payment status return handling,
  payment retries and already-paid order protection. No live order or charge made.

## Performance measurements

Lighthouse 13, Chrome headless, standalone production build, first visit without
optional consent, public production API/catalogue, 16 October 2026:

| Lab measurement | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | 91 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| First contentful paint | 1.1 s | 0.3 s |
| Largest contentful paint | 3.5 s | 0.7 s |
| Total blocking time | 10 ms | 0 ms |
| Cumulative layout shift | 0.003 | 0.002 |

These are lab observations, not live PageSpeed/CrUX results or ranking guarantees.
Mobile LCP still exceeds the 2.5-second good threshold under simulated slow mobile
conditions. Production latency and cold image optimization need a post-deployment
field check. The desktop cache was already warm; both runs used fresh browser
profiles. Accepted optional tags will add third-party work that is intentionally
absent on a fresh visit.

Tests ran from an internal temporary copy of the standalone artifact, excluding
macOS AppleDouble files. The external workspace drive's `._*` metadata files could
otherwise be mistaken for image-cache contents, invalidating image and performance
checks. Earlier runs with corrupt image responses are discarded. Chrome's
`--disable-web-security` and an approved production Origin header were used only
for local auditing because the production API does not allow the local test
origin; no application CORS/security setting was weakened. Final image responses
were verified as HTTP 200 `image/webp` and inspected visually on both layouts.

## Deployment and specialist follow-up

1. Let the backend main-branch pipeline finish first, including PostgreSQL migration
   V67 and both replicas. Check `https://api.buyology.online/api/privacy/cookies`.
   Its policy version must be `2026-10-16`.
2. Deploy the dashboard with its normal Vite production build and hosting procedure.
   No dashboard server path or publishing automation is documented in that repo,
   so do not guess a destination. Keep its existing production API configuration.
3. On web-app-1, run:

   ```bash
   cd ~/buyology-v2
   git pull --ff-only origin main
   bash scripts/deploy-v2.sh
   ```

   The helper builds once and deploys the same artifact to both website replicas,
   retaining previous static assets for open tabs.
4. Check the public home, category and product pages; make Reject optional and
   Accept all choices in fresh sessions; confirm corresponding audit rows in the
   superadmin dashboard. Recheck a nonexistent product slug returns 404 after the
   backend fix is live. No real payment was made during local verification.
5. In Search Console, verify ownership using the preserved meta tag, submit
   `https://buyology.online/sitemap.xml`, and inspect the home, catalogue, one
   populated category and representative products. Review indexing/coverage and
   Core Web Vitals after Google collects live data. Use the corresponding host's
   sitemap if another market is deployed on this Next.js app.
6. In GTM/GA4, preview consent states and navigation, publish the agreed base tags
   without duplicating existing tracking, and verify Realtime/DebugView. Review
   keyword rankings and backlinks with account tools; code changes alone cannot
   confirm those reports.

PostgreSQL/Testcontainers integration tests could not be run locally because the
Docker daemon was unavailable. The backend's existing CI runs them before deploy.
