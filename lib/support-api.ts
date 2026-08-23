import { authedFetch, authedJson, AuthError } from "@/lib/auth/client";
import type { ApiEnvelope } from "@/lib/backend";

/**
 * Customer support tickets: software bug reports, "I'm stuck" requests and general help.
 * A ticket carries a conversation thread — the team replies from the dashboard, the customer
 * from here. Every team action also lands in the header notification bell and the inbox email.
 */

export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type SupportCategory =
  | "SOFTWARE_BUG"
  | "ORDER_ISSUE"
  | "PAYMENT_ISSUE"
  | "ACCOUNT_ISSUE"
  | "OTHER";

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  "SOFTWARE_BUG",
  "ORDER_ISSUE",
  "PAYMENT_ISSUE",
  "ACCOUNT_ISSUE",
  "OTHER",
];

export type SupportMessage = {
  id: string;
  author: "CUSTOMER" | "ADMIN";
  body: string;
  createdAt?: string | null;
};

export type SupportTicket = {
  id: string;
  reference?: string | null;
  category?: SupportCategory | null;
  subject?: string | null;
  description?: string | null;
  pageUrl?: string | null;
  status: SupportTicketStatus;
  adminNote?: string | null;
  imageUrls?: string[] | null;
  /** Only present on detail reads; null/absent on lists. */
  messages?: SupportMessage[] | null;
  customerUnread?: boolean;
  resolvedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export const MAX_SUPPORT_IMAGES = 4;
export const MAX_SUPPORT_IMAGE_BYTES = 10 * 1024 * 1024;

/** Flat multipart @RequestParam fields — deliberately not a JSON part. Screenshots optional. */
export async function createSupportTicket(input: {
  category: SupportCategory;
  subject: string;
  description: string;
  pageUrl?: string;
  images: File[];
}): Promise<SupportTicket> {
  const form = new FormData();
  form.append("category", input.category);
  form.append("subject", input.subject);
  form.append("description", input.description);
  if (input.pageUrl) form.append("pageUrl", input.pageUrl);
  for (const file of input.images) form.append("images", file);
  const res = await authedFetch(`/api/support/tickets`, { method: "POST", body: form });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<SupportTicket> | null;
  if (!res.ok || body?.data == null) {
    throw new AuthError(res.status, body?.message ?? `support ${res.status}`);
  }
  return body.data;
}

export function listMyTickets(): Promise<SupportTicket[]> {
  return authedJson<SupportTicket[]>(`/api/support/tickets`);
}

export function fetchTicket(id: string): Promise<SupportTicket> {
  return authedJson<SupportTicket>(`/api/support/tickets/${id}`);
}

export function addTicketMessage(id: string, body: string): Promise<SupportTicket> {
  return authedJson<SupportTicket>(`/api/support/tickets/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}
