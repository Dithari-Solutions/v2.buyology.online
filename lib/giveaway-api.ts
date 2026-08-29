import { authedJson } from "@/lib/auth/client";
import { backendUrl } from "@/lib/backend";

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
  /** False once an admin closes the draw — every giveaway surface hides on this. */
  open?: boolean;
};

/**
 * Open/closed for anyone, signed in or not.
 *
 * <p>The home banner renders for guests, so the flag that hides it cannot itself require a
 * token — a closed campaign would otherwise stay advertised to exactly the visitors who
 * cannot be told it has ended.
 */
export async function fetchGiveawayCampaign(): Promise<GiveawayStatus | null> {
  try {
    const res = await fetch(backendUrl(`/api/giveaway/campaign`), { cache: "no-store" });
    if (!res.ok) return null;
    const envelope = await res.json();
    return (envelope?.data ?? null) as GiveawayStatus | null;
  } catch {
    // Unreachable API: say nothing rather than guessing. Callers treat null as "don't render".
    return null;
  }
}

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
