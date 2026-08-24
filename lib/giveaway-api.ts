import { authedJson } from "@/lib/auth/client";

/**
 * The giveaway. Entry is per ACCOUNT (one entry per user, one per Instagram handle), so
 * every call is authenticated and the server owns the uniqueness rules — the client only
 * reflects what it says.
 */

export type GiveawayStatus = {
  entered: boolean;
  instagramHandle?: string | null;
  enteredAt?: string | null;
  /** False when the account cannot enter yet; `reason` names the gate. */
  eligible: boolean;
  reason?: string | null;
  totalEntries?: number;
};

/** Reasons the backend can send for `eligible: false`. */
export const REASON_PHONE_UNVERIFIED = "PHONE_UNVERIFIED";

export function fetchGiveawayStatus(): Promise<GiveawayStatus> {
  return authedJson<GiveawayStatus>(`/api/giveaway/me`);
}

export function enterGiveaway(instagramHandle: string): Promise<GiveawayStatus> {
  return authedJson<GiveawayStatus>(`/api/giveaway/enter`, {
    method: "POST",
    body: JSON.stringify({ instagramHandle }),
  });
}

/** The public profile URL for a stored handle. */
export function instagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}
