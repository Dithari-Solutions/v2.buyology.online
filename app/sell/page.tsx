import { redirect } from "next/navigation";

/**
 * Sell is now Trade-in. Old links, bookmarks and search results land on the Trade-in page
 * rather than a dead end; {@code /sell/my} and the request detail pages stay reachable for
 * anyone with a request already in progress.
 */
export default function Page() {
  redirect("/trade-in");
}
