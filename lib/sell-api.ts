import { authedFetch, authedJson, AuthError } from "@/lib/auth/client";
import type { ApiEnvelope } from "@/lib/backend";
import type { PaymentInitiated } from "@/lib/checkout-api";

/**
 * The sell service — "buy my device", the mirror image of repair: instead of quoting what a
 * fix costs, procurement quotes what Buyology will PAY. Same logistics (free store drop-off
 * or a 20-AED-base courier leg via Paymob, both ways), an advisory AI valuation, and a
 * binding human offer. Payout today is cash at the store; wallet credit is a rejected stub
 * until a wallet ledger exists.
 */

export type SellStatus =
  | "SUBMITTED"
  | "AWAITING_DEVICE"
  | "UNDER_REVIEW"
  | "OFFER_MADE"
  | "ACCEPTED"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export type SellDeliveryMethod =
  | "COURIER_PICKUP"
  | "STORE_DROPOFF"
  | "COURIER_RETURN"
  | "STORE_PICKUP";

export type DeviceCondition = "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";

export type SellRequest = {
  id: string;
  reference?: string | null;
  productName?: string | null;
  brand?: string | null;
  model?: string | null;
  purchaseDate?: string | null;
  deviceCondition?: DeviceCondition | null;
  description?: string | null;
  imageUrls?: string[] | null;
  status: SellStatus;
  inboundDeliveryMethod?: SellDeliveryMethod | null;
  storeLocationId?: string | null;
  storeBranchName?: string | null;
  storeAddress?: string | null;
  returnDeliveryMethod?: SellDeliveryMethod | null;
  courierFeeAmount?: number | null;
  courierFeeCurrency?: string | null;
  courierFeePaid?: boolean;
  courierFeeRefundDue?: boolean;
  offerPrice?: number | null;
  offerPriceCurrency?: string | null;
  offerValidFor?: string | null;
  inspectedCondition?: DeviceCondition | null;
  payoutMethod?: string | null;
  aiEstimateMinPrice?: number | null;
  aiEstimateMaxPrice?: number | null;
  aiEstimateCurrency?: string | null;
  aiEstimateConfidence?: string | null;
  aiEstimateSummary?: string | null;
  aiEstimateCondition?: string | null;
  aiEstimatedAt?: string | null;
  adminNote?: string | null;
  customerUnread?: boolean;
  deviceReceivedAt?: string | null;
  offeredAt?: string | null;
  paidOutAt?: string | null;
  submittedAt?: string | null;
  createdAt?: string | null;
};

export type SellStore = {
  id: string;
  branchName?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
};

export const MAX_SELL_IMAGES = 4;
export const MAX_SELL_IMAGE_BYTES = 10 * 1024 * 1024;

/** Flat multipart @RequestParam fields — deliberately not a JSON part. */
export async function createSellRequest(input: {
  productName: string;
  brand: string;
  model: string;
  purchaseDate?: string;
  deviceCondition: DeviceCondition;
  description: string;
  images: File[];
}): Promise<SellRequest> {
  const form = new FormData();
  form.append("productName", input.productName);
  form.append("brand", input.brand);
  form.append("model", input.model);
  if (input.purchaseDate) form.append("purchaseDate", input.purchaseDate);
  form.append("deviceCondition", input.deviceCondition);
  form.append("description", input.description);
  for (const file of input.images) form.append("images", file);
  const res = await authedFetch(`/api/sell-requests`, { method: "POST", body: form });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<SellRequest> | null;
  if (!res.ok || body?.data == null) {
    throw new AuthError(res.status, body?.message ?? `sell ${res.status}`);
  }
  return body.data;
}

export function listMySellRequests(): Promise<SellRequest[]> {
  return authedJson<SellRequest[]>(`/api/sell-requests`);
}

export function fetchSellRequest(id: string): Promise<SellRequest> {
  return authedJson<SellRequest>(`/api/sell-requests/${id}`);
}

export function fetchSellStores(country = "UAE"): Promise<SellStore[]> {
  return authedJson<SellStore[]>(`/api/sell-requests/stores?country=${country}`);
}

export type SellDelivery = { sellRequest: SellRequest; payment: PaymentInitiated | null };

export function chooseSellDelivery(
  id: string,
  input: {
    method: "COURIER_PICKUP" | "STORE_DROPOFF";
    storeLocationId?: string;
    redirectionUrl?: string;
  },
): Promise<SellDelivery> {
  return authedJson<SellDelivery>(`/api/sell-requests/${id}/delivery`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Accepting records the payout method; only STORE_CASH is accepted by the backend today. */
export function respondToSellOffer(id: string, accept: boolean): Promise<SellRequest> {
  return authedJson<SellRequest>(`/api/sell-requests/${id}/offer-response`, {
    method: "POST",
    body: JSON.stringify(accept ? { accept, payoutMethod: "STORE_CASH" } : { accept }),
  });
}

export function chooseSellReturn(
  id: string,
  input: { method: "COURIER_RETURN" | "STORE_PICKUP"; redirectionUrl?: string },
): Promise<SellDelivery> {
  return authedJson<SellDelivery>(`/api/sell-requests/${id}/return`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
