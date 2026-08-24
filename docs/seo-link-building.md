# Link building plan — buyology.online

The SEO audit graded Links **F** and made "execute a link building strategy" its only
High-priority item. This is the one recommendation that **cannot be shipped in code**: backlinks
are other people's websites choosing to link to yours. What follows is the plan to earn them,
plus what has already been done on our side to make those links worth having.

## Where we stand (from the audit)

| Metric | Value | Read |
|---|---|---|
| Total backlinks | 56 | Very low |
| Referring domains | 43 | Low but not spam-thin |
| Dofollow | 10 of 56 | Only ~18% pass authority |
| Domain strength | 10 / 100 | Weak |
| Anchor text | 55 of 56 are the bare URL | No keyword signal at all |
| Top referring countries | Finland 17, France 14, US 9 | **Not the UAE** — almost none of this is local |

Two things stand out. First, almost every link is an unanchored `buyology.online` mention on
`.top` / `.website` / `.monster` domains — the signature of directory scrapers, not editorial
links. Second, essentially nothing links from the UAE, which is the market being sold to.

## Priority 1 — Local and trade citations (weeks 1–2)

These are the highest-yield links for a UAE retailer, they are free, and they double as local-SEO
signals. Use the **exact** name, address and phone now published in the site footer, or the
citation does more harm than good:

    Buyology Factory Outlet
    Industrial Area 17 - Industrial Area, Sharjah, United Arab Emirates
    +971 52 708 5203

- Google Business Profile — already claimed (4.9★, 132 reviews). Add the website link to
  `https://buyology.online` (it currently points at `/en`, a path that no longer exists).
- Apple Business Connect, Bing Places, Yelp UAE.
- UAE directories: Yellow Pages UAE, Connect.ae, UAE Contact, Dubai Local, Sharjah Chamber
  member listing.
- Marketplace and social profiles that allow a website field: Instagram, X, TikTok, LinkedIn
  company page.

## Priority 2 — Be the source people cite (weeks 2–8)

Refurbished tech has a natural, linkable angle: buyers are anxious and want proof. Publish pages
that answer that, then pitch them:

- "What 'certified refurbished' means at Buyology" — the actual inspection checklist, with photos
  of the process. This is the page journalists and forums link to.
- "Refurbished vs new laptop prices in the UAE" — a data post, updated quarterly. Data posts earn
  links passively for years.
- Buying guides per brand (MacBook, Dell, HP, Lenovo) mapping model years to who they suit.
- E-waste / sustainability angle: how many devices Buyology has kept out of landfill. UAE
  sustainability blogs and government initiatives link to this kind of number.

Pitch each to: UAE tech press (Gulf News tech, Khaleej Times, TahawulTech, Gulf Business), student
and expat communities (r/dubai, Dubai-focused Facebook groups, university forums), and
sustainability newsletters.

## Priority 3 — Relationship links (ongoing)

- Suppliers and brands you buy stock from: ask for a "where to buy" listing.
- Corporate customers: a short case study, published with their logo and a link, is the single
  most durable link type.
- The repair and sell verticals: local blogs covering "where to fix a laptop in Sharjah" are
  easier to earn than generic retail links.
- Sponsor one local thing that publishes a sponsor page — a university hackathon, a coding
  bootcamp, a community e-waste drive.

## What NOT to do

Do not buy links, use PBNs, or blast directory-submission services. The existing `.top` /
`.monster` links are already that pattern; more of them will not move Domain Strength and can
draw a manual penalty. If a service promises "500 backlinks", it is selling the thing that got
this profile to F.

## Anchor text

55 of 56 current links are the bare domain. When you can influence anchor text, ask for
descriptive phrases — "certified refurbished laptops in Dubai", "refurbished MacBooks UAE" — and
keep them varied. Never make every link the same commercial phrase; a natural profile is mostly
brand and URL anchors with a minority of descriptive ones.

## Measuring it

Set a baseline today (56 links / 43 domains / DS 10) and re-run the audit monthly. The number to
watch is **referring domains from the UAE**, not total backlinks: ten links from real Emirati
sites will outrank a thousand from `.monster` domains.

## What the site already does to support this

Shipped, so that every link earned actually counts:

- One canonical host, HTTPS-only, with canonical tags — link equity is never split across
  duplicates.
- `Organization`, `Store`, `WebSite` and per-product `Product` + `BreadcrumbList` structured data,
  so search engines can attribute a mention to the right entity.
- Real NAP in the footer and in schema, matching the Google Business Profile exactly.
- A live sitemap of real categories and products, and `llms.txt` plus AI-crawler access for
  citation by ChatGPT / Claude / Perplexity, which increasingly drives discovery.
