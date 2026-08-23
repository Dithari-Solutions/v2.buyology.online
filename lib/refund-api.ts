import { authedFetch, authedJson, AuthError } from "@/lib/auth/client";
import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import type { PaymentInitiated } from "@/lib/checkout-api";

/**
 * Customer refund requests — per ORDER, full amount only (the server snapshots the order
 * total; there is no partial request). Create is multipart with 3–8 photos; the refund is
 * reviewed by a human, then the customer chooses how the product returns: free store
 * drop-off, or courier pickup behind a small fee paid through the same Paymob flow.
 */

export type RefundStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "DROPOFF_SELECTED"
  | "COURIER_FEE_PENDING"
  | "COURIER_REQUESTED"
  | "RECEIVED"
  | "REJECTED"
  | "PAID"
  | "FAILED";

/** Everything except REJECTED and FAILED blocks a new request for the same order. */
export const ACTIVE_REFUND_STATUSES: RefundStatus[] = [
  "PENDING_REVIEW",
  "APPROVED",
  "DROPOFF_SELECTED",
  "COURIER_FEE_PENDING",
  "COURIER_REQUESTED",
  "RECEIVED",
  "PAID",
];

export type RefundReturnMethod = "STORE_DROPOFF" | "COURIER_PICKUP";

export type RefundRequest = {
  id: string;
  orderId: string;
  description?: string | null;
  imageUrls?: string[] | null;
  status: RefundStatus;
  returnMethod?: RefundReturnMethod | null;
  courierFeeAmount?: number | null;
  courierFeeCurrency?: string | null;
  refundAmount?: number | null;
  refundCurrency?: string | null;
  adminNote?: string | null;
  rejectionReason?: string | null;
  createdAt?: string | null;
  approvedAt?: string | null;
  receivedAt?: string | null;
  paidAt?: string | null;
};

/** No per-order endpoint exists — callers filter the user's own list by orderId. */
export async function fetchMyRefunds(page = 0, size = 50): Promise<RefundRequest[]> {
  const res = await authedJson<{ content: RefundRequest[] }>(
    `/api/refunds?page=${page}&size=${size}`,
  );
  return res.content ?? [];
}

export const MIN_REFUND_IMAGES = 3;
export const MAX_REFUND_IMAGES = 8;
export const MAX_REFUND_IMAGE_BYTES = 5 * 1024 * 1024;

/** Flat multipart fields — the backend binds @RequestParam, not a JSON wrapper. */
export async function createRefund(
  orderId: string,
  description: string,
  images: File[],
): Promise<RefundRequest> {
  const form = new FormData();
  form.append("orderId", orderId);
  form.append("description", description);
  for (const file of images) form.append("images", file);
  const res = await authedFetch(`/api/refunds`, { method: "POST", body: form });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<RefundRequest> | null;
  if (!res.ok || body?.data == null) {
    throw new AuthError(res.status, body?.message ?? `refunds ${res.status}`);
  }
  return body.data;
}

export function setReturnMethod(
  refundId: string,
  input: { method: RefundReturnMethod; currency?: string; redirectionUrl?: string },
): Promise<{ refund: RefundRequest; payment: PaymentInitiated | null }> {
  return authedJson(`/api/refunds/${refundId}/return-method`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Public: the returns window shown before anyone signs in. */
export async function fetchRefundSettings(): Promise<{
  returnWindowDays: number | null;
  enabled: boolean;
}> {
  const res = await fetch(backendUrl(`/api/refund-settings`), { cache: "no-store" });
  if (!res.ok) throw new Error(`refund-settings ${res.status}`);
  const body = (await res.json()) as ApiEnvelope<{ returnWindowDays: number | null; enabled: boolean }>;
  return body.data ?? { returnWindowDays: null, enabled: false };
}
