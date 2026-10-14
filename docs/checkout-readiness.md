# Checkout country and payment checks

The regional website is the catalogue market. Production nginx must overwrite
`X-Geo-Country` and `X-Geo-Anonymous` as described in [region-routing.md](region-routing.md).
The new `/api/market` endpoint repeats that location decision before each authenticated
cart mutation or order creation. Its response is never cached. Concurrent checks share
one request, and a completed check is not reused. Without a trusted geo header the
current hostname remains the market; the website cannot infer a physical location from
an old profile or a phone prefix.

The v2 hostname is also a production entry point for geo routing. New sessions carry
a shared, non-sensitive boolean hint across Buyology region hosts so the existing
HttpOnly refresh cookie can restore the customer after a regional redirect; access
tokens are never stored in that readable hint. Logout clears the shared hint.

Before those actions the client refreshes the profile and synchronises its country and
currency with the current market. Existing order repayment, payment callbacks, refunds
and order viewing retain the original order's market. A callback is never redirected to
another hostname, preserving the original tab's payment references.

Addresses default to the current market instead of always UAE. Checkout selects and
offers only matching addresses, including AZ/AZE and AE/ARE/UAE equivalents. A saved
address in another country is preserved; the customer must add a correct address rather
than silently relabelling its country or coordinates. Missing name/phone can be completed
inside checkout without SMS verification.

Azerbaijan checkout now supports the existing configured Paymob card flow. Products and
orders remain in AZN; the backend converts the authoritative order total to AED. Checkout
shows an estimated AED charge from the same server FX service, and disables online
placement while the quote is unavailable or stale. Paymob's page confirms the final charge.
Tabby/Tamara are offered only in the UAE market. Other regional payment flags remain unchanged.

The backend provides authenticated `GET /api/payments/methods` (configured usable method
types and AED currency only) and `GET /api/payments/quote?amount=...&currency=AZN` (estimated
converted charge). Neither creates an order/payment or exposes provider secrets. Method
availability means valid local configuration; it does not establish gateway uptime or
issuer approval. An explicit unknown `appOrderId` is refused before any gateway charge.

Backend fulfilment validates the address against the server-priced cart country, with
the profile used only for legacy carts without a country. Stale browsing preferences
cannot block a valid Azerbaijan cart/address or redirect UAE goods to Azerbaijan.

Payment results require a confirmed local order settlement before saying an order is
paid and being prepared. Refunded transactions have separate wording; unverified URL
success/failure flags cannot decide a charge. Buy Now repayment errors preserve the
existing order instead of creating another order. An already advanced order opens its
details instead of being charged again.

Deploy the backend first, then build and deploy v2 to both web servers using
[DEPLOY.md](../DEPLOY.md). Verify geo headers on the application server, use Paymob test
credentials for an approved/declined payment, check the callback and resulting dashboard
order, then verify the intended live integration configuration. Local automated checks
use mocked gateway responses and never charge an actual customer.

Set `NEXT_PUBLIC_API_BASE=https://api.buyology.online` when building the production
storefront, as in DEPLOY.md. A missing API base prevented the local homepage stream
from finishing; configuring the production base resolved it. The browser checkout
also needs that build-time value to reach the backend methods, quote and order APIs.
