import { headers } from "next/headers";
import { marketFromHostname, type Market } from "@/lib/market";

/**
 * The market a SERVER render belongs to, from the request's Host. The client resolves the
 * same mapping from location.hostname, so both renders agree. Host is nginx-controlled;
 * we deliberately do not read forwardable headers a client could spoof.
 */
export async function serverMarket(): Promise<Market> {
  const h = await headers();
  return marketFromHostname(h.get("host"));
}
