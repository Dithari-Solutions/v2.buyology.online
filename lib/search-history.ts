/**
 * The shopper's own recent searches, kept in their browser.
 *
 * <p>Deliberately local and nowhere else. A search history is a record of what someone was
 * thinking about, and this one buys exactly one thing — not retyping "thinkpad" — so it does not
 * need to reach the server, an account, or another device. Keeping it in localStorage means a
 * signed-out shopper gets it too, and clearing it is genuinely the end of it.
 *
 * <p>Same shape as the other stores in this codebase: a `buyo_` key, helpers that validate what
 * comes back because JSON.parse of corrupted storage returns anything, and try/catch on both sides
 * because storage throws outright in private mode and when site data is blocked.
 */

/** Versioned because the payload is a structured array, like buyo_cart_v1 and buyo_wishlist_v1. */
const KEY = "buyo_recent_searches_v1";

/**
 * How many to keep. Small on purpose: this sits above the results in a panel a shopper opens to
 * get somewhere, so it earns its space only while it stays glanceable.
 */
export const MAX_RECENT_SEARCHES = 6;

/** Longest query worth remembering — past this it is a paste, not a search someone will reuse. */
const MAX_QUERY_LENGTH = 80;

/** What the shopper last searched for, newest first. Never throws. */
export function readRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const rows = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return []; // private mode, blocked site data, corrupted value
  }
}

/**
 * Records a search and returns the new list, so a caller can render without re-reading.
 *
 * <p>Case-insensitive de-duplication with the ORIGINAL casing kept: searching "ThinkPad" after
 * "thinkpad" should move one row to the top, not add a second that looks identical.
 */
export function rememberSearch(query: string): string[] {
  const trimmed = (query ?? "").trim();
  if (!trimmed || trimmed.length > MAX_QUERY_LENGTH) return readRecentSearches();

  const existing = readRecentSearches();
  const deduped = existing.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...deduped].slice(0, MAX_RECENT_SEARCHES);
  write(next);
  return next;
}

/** Forgets everything. */
export function clearRecentSearches(): string[] {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do: the list is already unreadable to us */
  }
  return [];
}

function write(rows: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* private mode, or the quota is full — the feature is a convenience, so it just does nothing */
  }
}
