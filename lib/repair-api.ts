import { authedFetch, authedJson, AuthError } from "@/lib/auth/client";
import type { ApiEnvelope } from "@/lib/backend";
import { currentMarket } from "@/lib/market";
import type { PaymentInitiated } from "@/lib/checkout-api";

/**
 * The repair service. A customer submits their device (details + 1–4 photos of the problem),
 * gets an advisory AI estimate within a minute, chooses how the device reaches the store
 * (free drop-off, or courier pickup behind a 20-AED-base fee paid via Paymob), the team
 * quotes a binding price to accept or decline, and a declined device travels back the same
 * two ways. Couriers are dispatched manually by the team — the fee payment is the trigger.
 */

export type RepairStatus =
  | "SUBMITTED"
  | "AWAITING_DEVICE"
  | "UNDER_REVIEW"
  | "PRICE_ESTIMATED"
  | "IN_REPAIR"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

export type RepairDeliveryMethod =
  | "COURIER_PICKUP"
  | "STORE_DROPOFF"
  | "COURIER_RETURN"
  | "STORE_PICKUP";

export type RepairRequest = {
  id: string;
  reference?: string | null;
  productName?: string | null;
  brand?: string | null;
  model?: string | null;
  purchaseDate?: string | null;
  description?: string | null;
  imageUrls?: string[] | null;
  status: RepairStatus;
  inboundDeliveryMethod?: RepairDeliveryMethod | null;
  storeLocationId?: string | null;
  storeBranchName?: string | null;
  storeAddress?: string | null;
  returnDeliveryMethod?: RepairDeliveryMethod | null;
  courierFeeAmount?: number | null;
  courierFeeCurrency?: string | null;
  courierFeePaid?: boolean;
  courierFeeRefundDue?: boolean;
  estimatedPrice?: number | null;
  estimatedPriceCurrency?: string | null;
  estimatedTime?: string | null;
  aiEstimateMinPrice?: number | null;
  aiEstimateMaxPrice?: number | null;
  aiEstimateCurrency?: string | null;
  aiEstimateConfidence?: string | null;
  aiEstimateSummary?: string | null;
  aiEstimateTime?: string | null;
  aiEstimatedAt?: string | null;
  adminNote?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  customerUnread?: boolean;
  deviceReceivedAt?: string | null;
  pricedAt?: string | null;
  submittedAt?: string | null;
  createdAt?: string | null;
};

export type RepairStore = {
  id: string;
  branchName?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
};

export const MAX_REPAIR_IMAGES = 4;
export const MAX_REPAIR_IMAGE_BYTES = 10 * 1024 * 1024;

/** Flat multipart @RequestParam fields — deliberately not a JSON part. */
export async function createRepair(input: {
  productName: string;
  brand: string;
  model: string;
  purchaseDate?: string;
  description: string;
  images: File[];
}): Promise<RepairRequest> {
  const form = new FormData();
  form.append("productName", input.productName);
  form.append("brand", input.brand);
  form.append("model", input.model);
  if (input.purchaseDate) form.append("purchaseDate", input.purchaseDate);
  form.append("description", input.description);
  for (const file of input.images) form.append("images", file);
  const res = await authedFetch(`/api/repairs`, { method: "POST", body: form });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<RepairRequest> | null;
  if (!res.ok || body?.data == null) {
    throw new AuthError(res.status, body?.message ?? `repairs ${res.status}`);
  }
  return body.data;
}

export function listMyRepairs(): Promise<RepairRequest[]> {
  return authedJson<RepairRequest[]>(`/api/repairs`);
}

export function fetchRepair(id: string): Promise<RepairRequest> {
  return authedJson<RepairRequest>(`/api/repairs/${id}`);
}

export function fetchRepairStores(country = currentMarket().countryCode): Promise<RepairStore[]> {
  return authedJson<RepairStore[]>(`/api/repairs/stores?country=${country}`);
}

export type RepairDelivery = { repair: RepairRequest; payment: PaymentInitiated | null };

export function chooseRepairDelivery(
  id: string,
  input: {
    method: "COURIER_PICKUP" | "STORE_DROPOFF";
    storeLocationId?: string;
    redirectionUrl?: string;
  },
): Promise<RepairDelivery> {
  return authedJson<RepairDelivery>(`/api/repairs/${id}/delivery`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function respondToRepairPrice(id: string, accept: boolean): Promise<RepairRequest> {
  return authedJson<RepairRequest>(`/api/repairs/${id}/price-response`, {
    method: "POST",
    body: JSON.stringify({ accept }),
  });
}

export function chooseRepairReturn(
  id: string,
  input: { method: "COURIER_RETURN" | "STORE_PICKUP"; redirectionUrl?: string },
): Promise<RepairDelivery> {
  return authedJson<RepairDelivery>(`/api/repairs/${id}/return`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
