import { currentMarket } from "@/lib/market";

/**
 * Meta Pixel commerce events from the browser: ViewContent, AddToCart, InitiateCheckout, Purchase.
 *
 * The base code (components/analytics/MetaPixel.tsx) defines window.fbq and records PageView; this
 * module sends the events Meta optimises ads on. Every call is a no-op when the pixel is absent or
 * blocked, so tracking can never break a page.
 *
 * Purchase is the one that needs care:
 * - It must carry the real order total and currency. Without them Meta flags the event and cannot
 *   optimise on it.
 * - It must go out once per order. A reload of the payment result page must not count the order
 *   twice, so sent order ids are remembered. The order id is also sent as the eventID, which is what
 *   lets a future server-side (Conversions API) Purchase for the same order be de-duplicated.
 * - Online payments leave the site for Paymob and come back to /payment/callback, which knows the
 *   order id but not its amount. So the amount is remembered here, keyed by order id, before the
 *   redirect ({@link rememberPurchase}), and read back once the payment is confirmed.
 */

type FbqOptions = { eventID?: string };
type Fbq = (command: "track", event: string, params?: Record<string, unknown>, options?: FbqOptions) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export type MetaContent = { id: string; quantity: number };

export type PurchaseRecord = {
  orderId: string;
  value: number;
  currency?: string | null;
  contents: MetaContent[];
};

/** Orders whose amount is waiting for the payment to come back. sessionStorage: same tab, survives the redirect. */
const PENDING_KEY = "buyo_meta_pending_purchases";
/** Orders already reported. localStorage, so another tab or a later visit cannot report them again. */
const SENT_KEY = "buyo_meta_purchases_sent";
const SENT_LIMIT = 50;

/** Cart and variant lines can carry "productId::options"; the catalogue knows the product id. */
function productId(id: string): string {
  return id.split("::")[0];
}

function currencyOf(currency?: string | null): string {
  const c = (currency ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(c) ? c : currentMarket().currency;
}

function money(n: number): number {
  return Math.round(n * 100) / 100;
}

function send(event: string, params: Record<string, unknown>, eventID?: string) {
  if (typeof window === "undefined") return;
  let tries = 0;
  const attempt = () => {
    const fbq = window.fbq;
    if (typeof fbq === "function") {
      try {
        fbq("track", event, params, eventID ? { eventID } : undefined);
      } catch {
        /* tracking must never break the page */
      }
      return;
    }
    // The base code loads afterInteractive, so an event raised while the page hydrates can beat it.
    if (++tries < 20) setTimeout(attempt, 250);
  };
  attempt();
}

export function metaViewContent(p: { id: string; name: string; price: number; currency?: string | null }) {
  send("ViewContent", {
    content_ids: [productId(p.id)],
    content_type: "product",
    content_name: p.name,
    value: money(p.price),
    currency: currencyOf(p.currency),
  });
}

export function metaAddToCart(p: { id: string; name: string; price: number; qty: number; currency?: string | null }) {
  const id = productId(p.id);
  send("AddToCart", {
    content_ids: [id],
    content_type: "product",
    content_name: p.name,
    contents: [{ id, quantity: p.qty }],
    value: money(p.price * p.qty),
    currency: currencyOf(p.currency),
  });
}

export function metaInitiateCheckout(p: { contents: MetaContent[]; value: number; currency?: string | null }) {
  const contents = p.contents.map((c) => ({ id: productId(c.id), quantity: c.quantity }));
  send("InitiateCheckout", {
    content_ids: contents.map((c) => c.id),
    content_type: "product",
    contents,
    num_items: contents.reduce((n, c) => n + c.quantity, 0),
    value: money(p.value),
    currency: currencyOf(p.currency),
  });
}

function readPending(): Record<string, PurchaseRecord> {
  try {
    const raw = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? "{}");
    return raw && typeof raw === "object" ? (raw as Record<string, PurchaseRecord>) : {};
  } catch {
    return {};
  }
}

function writePending(pending: Record<string, PurchaseRecord>) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    /* without storage the callback simply cannot report this order */
  }
}

/**
 * Keep an order's amount for the payment result page. `overwrite: false` keeps an amount already
 * remembered from when the order was created, which is the authoritative one.
 */
export function rememberPurchase(record: PurchaseRecord, { overwrite = true } = {}) {
  const pending = readPending();
  if (!overwrite && pending[record.orderId]) return;
  pending[record.orderId] = record;
  writePending(pending);
}

function alreadySent(orderId: string): boolean {
  try {
    const sent = JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]");
    return Array.isArray(sent) && sent.includes(orderId);
  } catch {
    return false;
  }
}

function markSent(orderId: string) {
  try {
    const sent = JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]");
    const list = Array.isArray(sent) ? sent.filter((x) => x !== orderId) : [];
    list.push(orderId);
    localStorage.setItem(SENT_KEY, JSON.stringify(list.slice(-SENT_LIMIT)));
  } catch {
    /* worst case a reload reports it again; Meta also de-duplicates on the eventID */
  }
}

/**
 * Report a remembered order as purchased — once. Does nothing for an order whose amount was never
 * remembered (a courier or repair fee, say), because a Purchase without a value is exactly what
 * Meta rejects.
 */
export function metaPurchase(orderId: string) {
  const pending = readPending();
  const record = pending[orderId];
  if (!record) return;
  delete pending[orderId];
  writePending(pending);
  if (alreadySent(orderId) || !(record.value > 0)) return;
  markSent(orderId);
  const contents = record.contents.map((c) => ({ id: productId(c.id), quantity: c.quantity }));
  send(
    "Purchase",
    {
      content_ids: contents.map((c) => c.id),
      content_type: "product",
      contents,
      num_items: contents.reduce((n, c) => n + c.quantity, 0),
      value: money(record.value),
      currency: currencyOf(record.currency),
    },
    orderId,
  );
}
