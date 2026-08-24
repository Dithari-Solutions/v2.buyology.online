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
  /** False while the account still lacks something a prize delivery needs. */
  eligible: boolean;
  /** Field names still to fill, e.g. ["phoneVerification", "deliveryAddress"]. */
  missing?: string[] | null;
  totalEntries?: number;
};

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
