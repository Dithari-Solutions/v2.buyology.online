import { authedJson } from "@/lib/auth/client";
import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import type { ApiCart } from "@/lib/cart-api";
import type { OrderDetail } from "@/lib/account-api";

/**
 * The checkout path, transcribed from the backend contracts (and the old client's scars):
 *
 *  - Cart endpoints and the X-Auth-Credential-Id header take auth_credentials.id (JWT sub);
 *    /api/payments/initiate's customerId takes users.id (uid). Swapping them 400s.
 *  - The client NEVER prices anything: shippingFee in CreateOrderRequest is ignored by the
 *    server, the charged amount is the created order's totalAmount/currency verbatim, and a
 *    client-derived figure trips the webhook's amount-match check and fails the payment.
 *  - Retry-after-failure needs no special state: POST /cart/{id}/checkout resumes a lingering
 *    CHECKED_OUT cart, and createOrder reuses a matching PENDING_PAYMENT order.
 */

// ── Cart → order ─────────────────────────────────────────────────────────────

export function checkoutCart(credentialId: string): Promise<ApiCart> {
  return authedJson<ApiCart>(`/api/cart/${credentialId}/checkout`, { method: "POST" });
}

export type CreateOrderBody = {
  cartId: string;
  deliveryMethod: "EXPRESS" | "REGULAR" | "PICKUP";
  addressId?: string;
  pickupStoreId?: string;
  couponCode?: string;
};

export function createOrder(credentialId: string, body: CreateOrderBody): Promise<OrderDetail> {
  return authedJson<OrderDetail>(`/api/orders`, {
    method: "POST",
    headers: { "X-Auth-Credential-Id": credentialId },
    body: JSON.stringify(body),
  });
}

// ── Promo ────────────────────────────────────────────────────────────────────

export type PromoValidation = {
  valid: boolean;
  message?: string | null;
  promoCodeId?: string | null;
  discountAmount?: number | null;
  discountType?: "FIXED_AMOUNT" | "PERCENTAGE" | null;
  discountValue?: number | null;
};

export function validatePromo(
  code: string,
  orderAmount: number,
  productIds: string[],
): Promise<PromoValidation> {
  return authedJson<PromoValidation>(`/api/promo/validate`, {
    method: "POST",
    body: JSON.stringify({ code, orderAmount, productIds }),
  });
}

// ── Fulfilment data ──────────────────────────────────────────────────────────

/** Stores that can 30-minute-deliver to a POINT — the delivery ADDRESS's pin, never the device. */
export function fetchExpressStores(
  lat: number,
  lng: number,
): Promise<{ radiusKm: number; storeIds: string[] }> {
  return authedJson(`/api/stores/express-stores?lat=${lat}&lng=${lng}`);
}

export type PublicStoreLocation = {
  id: string;
  branchName?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isPrimary?: boolean | null;
};

export type PublicStore = {
  id: string;
  name: string;
  countryName?: string | null;
  locations: PublicStoreLocation[];
};

export async function fetchPickupStores(): Promise<PublicStore[]> {
  const res = await fetch(backendUrl(`/api/stores/public`), { cache: "no-store" });
  if (!res.ok) throw new Error(`stores ${res.status}`);
  const body = (await res.json()) as ApiEnvelope<PublicStore[]>;
  return body.data ?? [];
}

// ── Payment ──────────────────────────────────────────────────────────────────

export type PaymentMethod = "CARD" | "TABBY" | "TAMARA";

export type PaymentInitiated = {
  transactionId: string;
  methodType?: string | null;
  amount?: number | null;
  currency?: string | null;
  clientSecret?: string | null;
  /** The Paymob Unified Checkout URL — every method opens via full-page redirect to it. */
  checkoutUrl?: string | null;
};

export function initiatePayment(body: {
  appOrderId: string;
  cartId: string;
  methodType: PaymentMethod;
  amount: number;
  currency: string;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  billingName: string;
  redirectionUrl: string;
}): Promise<PaymentInitiated> {
  return authedJson<PaymentInitiated>(`/api/payments/initiate`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function repayOrder(
  orderId: string,
  body: { methodType: PaymentMethod; redirectionUrl: string },
): Promise<PaymentInitiated> {
  return authedJson<PaymentInitiated>(`/api/payments/orders/${orderId}/repay`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentTransaction = {
  id: string;
  appOrderId?: string | null;
  status: TransactionStatus;
  failureReason?: string | null;
  cardLast4?: string | null;
  cardBrand?: string | null;
};

export function fetchTransaction(transactionId: string): Promise<PaymentTransaction> {
  return authedJson<PaymentTransaction>(`/api/payments/transactions/${transactionId}`);
}

/**
 * Forward Paymob's signed redirect params so the backend settles the transaction in-band.
 * PUBLIC + HMAC-gated on purpose: the full-page redirect wiped the in-memory access token,
 * and the shopper must not need a live session for their payment to resolve. A null body
 * means the HMAC was absent/invalid — fall back to polling.
 */
export async function confirmPaymentRedirect(
  params: Record<string, string>,
): Promise<PaymentTransaction | null> {
  const res = await fetch(backendUrl(`/api/payments/confirm-redirect`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as ApiEnvelope<PaymentTransaction | null>;
  return body.data ?? null;
}
