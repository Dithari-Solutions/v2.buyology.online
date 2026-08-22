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

/**
 * Price display. Real catalogue items carry their currency (AED for the UAE market) and format
 * through Intl; the mock flash-deals items carry none and keep their historic "$1,299" look, so
 * the one section deliberately left on mock data renders exactly as before.
 */
export function formatMoney(amount: number, currency?: string): string {
  if (!currency) return `$${formatInt(amount)}`;
  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
