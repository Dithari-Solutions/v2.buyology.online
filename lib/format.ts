const intFmt = new Intl.NumberFormat("en-US");

/**
 * Locale-pinned integer grouping (e.g. 128400 → "128,400"). Pinned to a fixed
 * locale so a value rendered on the server (Node's default locale) and hydrated
 * on the client (the browser's locale) produce identical strings — otherwise
 * differing group separators cause a React hydration mismatch.
 */
export function formatInt(n: number): string {
  return intFmt.format(n);
}
