/**
 * Wire types for the Buyology AI assistant API.
 *
 * These mirror the backend DTOs. Properties marked optional are OMITTED by the
 * server when null — they are absent keys, not null values, so always access
 * them optionally rather than checking `=== null`.
 */

/** Languages the catalog is translated into; anything else is answered in English. */
export type AssistantLanguage = "en" | "ar" | "az";

export interface AssistantChatRequest {
  /** Non-blank, max 1000 characters. */
  message: string;
  /** Omitted on the first message; the reply carries the new id. */
  conversationId?: string;
  /** Max 64 chars. Shared with the analytics beacon's browser id. */
  visitorId?: string;
  language?: AssistantLanguage;
  /** ISO-3166 alpha-2, e.g. "AE". Scopes products and prices to that market. */
  countryCode?: string;
  /** e.g. "AED". Display currency for quoted prices. */
  currency?: string;
}

export interface AssistantProductCard {
  id: string;
  /** Null when the product has no translation in the requested language. */
  title: string | null;
  slug: string | null;
  brandName: string | null;
  /** "IN_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER" */
  availabilityStatus: string | null;
  isRefurbished: boolean | null;

  // ── Omitted entirely when null — always use optional access ──
  price?: number;
  originalPrice?: number;
  currency?: string;
  imageUrl?: string;
  averageRating?: number;
}

export interface AssistantChatData {
  conversationId: string;
  /** Plain text. No markdown, no HTML — render as a string child, never as HTML. */
  reply: string;
  /** false = the question was outside what the assistant answers. */
  inScope: boolean;
  /** true = hand the customer to a human. */
  escalate: boolean;
  /** In the order the assistant mentioned them. Empty when none. */
  products: AssistantProductCard[];
}

export interface AssistantStatusData {
  enabled: boolean;
}

/** The standard envelope every endpoint uses — except 429, which differs. */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

/** 429 is written by a servlet filter and has a DIFFERENT shape. */
export interface RateLimitBody {
  success: false;
  message: string;
  retryAfterSeconds: number;
}

export type SendResult =
  | { ok: true; data: AssistantChatData }
  | { ok: false; kind: "rate_limited"; retryAfterSeconds: number }
  | { ok: false; kind: "network" }
  | { ok: false; kind: "failed"; status: number; message?: string };
