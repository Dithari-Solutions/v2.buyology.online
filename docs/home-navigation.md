# Header navigation and homepage products

The desktop header shows active categories that have products in the visitor's market. Category availability and brand tiles share one cached catalogue read; unbranded products count, stocked child categories retain exact category links, and inactive ancestors stay hidden. All products remains available when the catalogue is empty or unavailable.

Services opens a disclosure panel on hover or button activation, with outside-click, keyboard and Escape support. Services follows All products immediately on desktop and mobile, before the stocked category links. Mobile groups service links in an expandable section.

The homepage campaign area uses the full content width without a departments column. One large carousel sits beside two stacked campaign panels on desktop; on mobile the two smaller panels sit below the carousel. The last two configured campaigns become the smaller panels and the remaining campaigns rotate in the carousel. Fewer campaigns render without empty panels. Contained images preserve the whole artwork, with responsive image sizes for each panel.

Popular products appears immediately below the delivery, secure payment, returns and support strip. It uses existing product cards, prices, product links, wishlist and cart controls. Selection ranks available products by review count, then rating, preserving catalogue ordering for ties; up to 12 unique products are shown. No sales counts or reviews are invented. The product feed is shared with navigation to avoid per-category requests and duplicate full-feed downloads.

The carousel loops when the selection overflows, supports touch/trackpad scrolling and previous/next controls, and offers a persistent pause toggle. Hover, focus and active touch pause movement. Reduced motion disables autoplay, and offscreen/background rails do not animate. Loop copies remain clickable with duplicate keyboard stops removed, including cart quantity controls. Short selections stay a single row. An empty/unavailable catalogue does not display a fabricated or empty product section.

English copy: “Popular products” / “Explore available products and compare models, specifications and prices.” / “View all products.” The same section is localized in Arabic and Azerbaijani.

A one-column grid constraint also prevents the footer newsletter area from widening 320px screens.

Validation: TypeScript, lint of changed files, production Next.js build using webpack in an isolated internal-disk copy, 26 isolated unit tests, and Chrome browser checks with mock catalogue data. Browser checks cover hover/tap/keyboard service navigation, category filtering, banner layout, live cart/wishlist actions on loop copies, shared requests, seamless wrapping, pause/reduced motion, empty/failure fallbacks, 320–1440px widths, and Arabic/Azerbaijani layouts. Mock services never change production accounts, stock or orders.

Deploy from web-app-1 using the existing shared-bundle deployment:

```bash
cd ~/buyology-v2
git pull --ff-only origin main
bash scripts/deploy-v2.sh
```

No backend or database changes are required.
