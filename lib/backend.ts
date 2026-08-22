/**
 * How v2 reaches the Buyology backend (api.buyology.online).
 *
 * Same contract as the assistant client, generalised for the feature-by-feature migration off the
 * old storefront: the browser calls the API DIRECTLY. The backend rate-limits and audits by caller
 * IP, so routing through a Next route handler would fold every visitor into one server-side
 * bucket. That works because https://v2.buyology.online sits in the backend's CORS allowlist — an
 * unlisted origin fails in the browser while working fine in curl.
 *
 * Locally, localhost is NOT allowlisted, so development routes through the same-origin dev proxy
 * (app/api/backend/[...path]/route.ts) when NEXT_PUBLIC_BACKEND_PROXY=true — mirroring the
 * assistant's dev setup, and off in production for the same reasons.
 */
const DIRECT_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  // The assistant var points at the same backend; falling back to it means stories (and every
  // later migrated feature) need zero new production config.
  process.env.NEXT_PUBLIC_ASSISTANT_API_BASE ??
  "";

const USE_PROXY = process.env.NEXT_PUBLIC_BACKEND_PROXY === "true";

/**
 * Absolute URL for a backend path ("/api/story", "/api/story/{id}/view", …).
 * Under the dev proxy the path is nested beneath /api/backend and unwrapped server-side.
 */
export function backendUrl(path: string): string {
  return USE_PROXY ? `/api/backend${path}` : `${DIRECT_BASE}${path}`;
}

/** The backend's response envelope, shared by every endpoint. */
export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T | null;
}
