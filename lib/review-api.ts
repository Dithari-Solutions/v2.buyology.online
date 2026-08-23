import { authedFetch, authedJson, AuthError } from "@/lib/auth/client";
import type { ApiEnvelope } from "@/lib/backend";

/**
 * Review writing. Anyone signed in may review (the "verified purchase" badge is server-set
 * from purchase history, never a gate), ONE review per product per user — enforced by a DB
 * unique constraint — with up to two photos. The backend approves on create, so a submitted
 * review is live immediately; there is no edit or delete for customers.
 */

export const MAX_REVIEW_IMAGES = 2;
/** Client-side cap; the server's global multipart limit is far too generous for photos. */
export const MAX_REVIEW_IMAGE_BYTES = 10 * 1024 * 1024;

export async function submitReview(input: {
  productId: string;
  credentialId: string;
  rating: number;
  body?: string;
  images: File[];
}): Promise<void> {
  const form = new FormData();
  // The controller binds a JSON string part named "request" — not flat fields.
  form.append(
    "request",
    JSON.stringify({
      productId: input.productId,
      authCredentialId: input.credentialId,
      rating: input.rating,
      body: input.body || undefined,
    }),
  );
  for (const file of input.images) form.append("images", file);
  const res = await authedFetch(`/api/reviews`, { method: "POST", body: form });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiEnvelope<unknown> | null;
    throw new AuthError(res.status, body?.message ?? `reviews ${res.status}`);
  }
}

/** Whether this user already reviewed this product (the signed-in owner sees all statuses). */
export async function hasReviewedProduct(uid: string, productId: string): Promise<boolean> {
  const rows = await authedJson<{ productId: string }[]>(
    `/api/reviews/user/${uid}?page=0&size=100`,
  );
  return rows.some((r) => r.productId === productId);
}
