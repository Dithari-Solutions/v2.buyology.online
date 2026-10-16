import type { LegalDoc } from "./types";

export const cookies: LegalDoc = {
  title: "Cookies & Local Storage",
  effective: "16 October 2026",
  version: "2026-10-16",
  blocks: [
    { type: "p", text: "This notice explains the cookies and browser storage used by Buyology. Necessary storage supports shopping. Analytics and marketing are optional and stay off until you give permission." },
    { type: "h2", text: "1. Necessary storage" },
    { type: "ul", items: [
      "buyology-consent — remembers your choices, the policy version and anonymous decision references for 180 days. A record of each decision is sent to Buyology so authorized administrators can review consent history.",
      "refresh_token — an HttpOnly account session cookie set by the Buyology API after sign-in. The website and dashboard do not read its value.",
      "buyology-lang, buyo-region-choice and buyo-signed-in — your chosen language, delivery-region override and a session hint. Theme preferences are stored under buyology-theme.",
      "buyo_cart_v1, buyo_cart_saved_v1 and buyo_wishlist_v1 — your guest cart, saved items and wishlist. These remain available when you reject optional cookies.",
      "Session storage supports payment recovery, requested customer-support conversations, and short-lived public catalogue caches. Payment references are not advertising consent records. Payment card details are handled by the payment provider, not stored by Buyology.",
    ] },
    { type: "h2", text: "2. Optional analytics" },
    { type: "p", text: "With analytics permission, Google Analytics (G-33199BYJE6) measures page views and shop usage, and Buyology records first-party visit counts. Google may set _ga, _ga_*, _gid or _gat* cookies with provider-controlled lifetimes of up to two years. First-party counts use buy_visitor_id in local storage and buy_visit_session in session storage. A browser ID may also be used separately when you explicitly request the shopping assistant, to keep that support service working." },
    { type: "h2", text: "3. Optional marketing" },
    { type: "p", text: "With marketing permission, Meta Pixel (1389023989829180) measures campaigns and shopping events, including purchase attribution. Meta and advertising tags may set _fbp, _fbc or _gcl_* cookies with provider-controlled lifetimes. Buyology uses buyo_meta_pending_purchases and buyo_meta_purchases_sent to attribute confirmed purchases and avoid duplicate events. Promotional dismissal preferences are also stored only when marketing is allowed." },
    { type: "p", text: "Google Tag Manager (GTM-WVVSH2PS) can manage multiple kinds of optional tags, so its container loads only when both analytics and marketing are allowed. Analytics-only consent uses Google Analytics directly. Tags managed inside GTM must continue to respect these purposes." },
    { type: "h2", text: "4. Change or withdraw your choice" },
    { type: "p", text: "Use Cookie settings in the footer or on this page to accept, reject, or customize optional categories at any time. Necessary storage remains enabled. Withdrawing a previously allowed category removes accessible cookies and attribution storage for that category and refreshes the page to stop scripts that were already running. Your cart and payment recovery references are retained." },
    { type: "p", text: "Consent history contains your anonymous consent and decision references, choices, policy version, language, originating website host and server-recorded time. It does not contain browser cookie values, authentication tokens, payment information or raw IP addresses. Records are retained for 365 days by default, subject to the configured retention policy. These are browser-declared choices, not verified customer identities." },
    { type: "h2", text: "5. Contact" },
    { type: "p", text: "Questions about cookies or privacy: support@buyology.online. See our Privacy Policy for more information." },
  ],
};
