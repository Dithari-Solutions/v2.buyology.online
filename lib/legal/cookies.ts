import type { LegalDoc } from "./types";

export const cookies: LegalDoc = {
  "title": "Cookies & Local Storage",
  "effective": null,
  "version": null,
  "blocks": [
    {
      "type": "p",
      "text": "This notice explains what Buyology stores in your browser and why. We keep it short because the list is short."
    },
    {
      "type": "h2",
      "text": "1. Strictly necessary"
    },
    {
      "type": "ul",
      "items": [
        "Session cookie — an HttpOnly refresh token that keeps you signed in securely. Set only after you sign in.",
        "Language preference — remembers whether you browse in English, Azerbaijani, or Arabic."
      ]
    },
    {
      "type": "h2",
      "text": "2. Local storage on your device"
    },
    {
      "type": "ul",
      "items": [
        "Guest cart and wishlist — what you've added before signing in, kept on your device so it survives a refresh. Moved to your account when you sign in.",
        "Saved-for-later markers and a signed-in hint — small flags that make the site behave consistently between visits.",
        "Payment breadcrumbs — a short-lived reference kept during a payment redirect so we can show you the result when you return. Cleared once the payment resolves."
      ]
    },
    {
      "type": "h2",
      "text": "3. What we do not do"
    },
    {
      "type": "ul",
      "items": [
        "No third-party advertising cookies or cross-site trackers.",
        "No sale of browsing data.",
        "Payment card details never touch our site or your browser storage — payment is completed on our payment provider's secure page (Paymob, including Tabby and Tamara)."
      ]
    },
    {
      "type": "h2",
      "text": "4. Managing storage"
    },
    {
      "type": "p",
      "text": "You can clear cookies and site data at any time from your browser settings. Clearing them signs you out and empties any guest cart on that device."
    },
    {
      "type": "h2",
      "text": "5. Contact"
    },
    {
      "type": "p",
      "text": "Questions about this notice: support@buyology.com. For how we handle personal data generally, see our Privacy Policy."
    }
  ]
};
