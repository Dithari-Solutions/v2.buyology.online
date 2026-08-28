# Turning on region routing

Goal: `buyology.online` serves the UAE only. Everyone else is sent to
`https://web.buyology.online`, the global landing, from which they can still choose a region
explicitly.

All of the decision-making already exists in `middleware.ts`. It needs exactly one thing it is
not getting today: a header telling it which country the visitor is in. Until that header
arrives the middleware takes its "no opinion" branch and nobody is redirected, which is why the
feature appears to be off.

## The one missing input

```
X-Geo-Country:   ISO alpha-2 of the visitor's IP country   (required)
X-Geo-Anonymous: "1" for a known VPN / proxy / hosting exit (optional, phase 2)
```

Cloudflare already computes the country for every request and forwards it as `CF-IPCountry`, so
no GeoIP database is needed on the origin. nginx only has to rename it:

```nginx
# In the server block for buyology.online (and every regional host).
#
# proxy_set_header REPLACES whatever the client sent, which is the point: the middleware trusts
# X-Geo-Country completely, so it must never be forwardable from outside.
proxy_set_header X-Geo-Country  $http_cf_ipcountry;
proxy_set_header X-Geo-Anonymous "";
```

`CF-IPCountry` is `XX` for unknown and `T1` for Tor. Neither matches a served market, so both land
on the global page — the correct outcome without extra rules.

### Lock the origin to Cloudflare

The country is only as trustworthy as the path it arrives on. Anyone who can reach the origin IP
directly can send their own `CF-IPCountry` and choose their region. Allow only Cloudflare's ranges
to connect, on the firewall or in nginx:

```bash
# https://www.cloudflare.com/ips/ — refresh occasionally; the list does change.
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do ufw allow from $ip to any port 443; done
ufw deny 443
```

The exposure if you skip this is modest — a determined visitor sees the UAE storefront from
abroad, which the region-choice cookie already permits on request — but it is free to close.

## Before switching it on

1. **`web.buyology.online` must resolve and serve.** DNS record, Cloudflare proxied, TLS covering
   it. It is the same app on the same servers; the middleware rewrites every path on that host to
   `/global-welcome`. If the host does not answer, every non-UAE visitor gets an error instead of
   a landing page.
2. **Crawlers are exempt in code** (`CRAWLER_UA` in `middleware.ts`) and must stay that way.
   Googlebot crawls from US IPs; redirect it and Google indexes the welcome screen instead of the
   store, and the UAE rankings go with it.
3. **Roll it out on one host first.** Add the two `proxy_set_header` lines to a single server
   block, confirm the behaviour below, then apply to the rest.

## Confirming it works

```bash
# From a UAE IP — expect 200.
curl -s -o /dev/null -w '%{http_code}\n' https://buyology.online/

# Simulate another country. Only works from an allowed origin path; through Cloudflare the
# header is overwritten, which is exactly the protection described above.
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' \
     -H 'CF-IPCountry: US' https://buyology.online/

# Googlebot must never be redirected — expect 200, not 307.
curl -s -o /dev/null -w '%{http_code}\n' \
     -A 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' \
     -H 'CF-IPCountry: US' https://buyology.online/
```

## What each visitor sees

| Visitor | Host asked for | Result |
|---|---|---|
| UAE | buyology.online | Served normally |
| UAE | az.buyology.online | 307 → buyology.online (same path) |
| Azerbaijan | buyology.online | 307 → az.buyology.online |
| Unserved country | buyology.online | 307 → web.buyology.online |
| Unserved, chose a region | any | Served; choice kept 180 days in `buyo-region-choice` |
| Detected VPN/proxy | any | Global landing, no override |
| Crawler | any | Served as addressed, never redirected |
| No geo header | any | Served as addressed — the current state |
