/** Short-lived display caches never cross a price change or a signed media URL's expiry. */
export const FEED_FRESH_MS = 60_000;
export const FEED_RESTORE_MS = 5 * 60_000;

export function feedExpiresAt(data: unknown, updatedAt: number, maxAge = FEED_FRESH_MS): number {
  let expiresAt = updatedAt + maxAge;
  function visit(value: unknown, key = ''): void {
    if (typeof value === 'string') {
      if (key === 'flashSaleEndsAt' || key === 'flashSaleStartsAt') {
        const at = Date.parse(value);
        if (Number.isFinite(at) && (key === 'flashSaleEndsAt' || at > updatedAt)) expiresAt = Math.min(expiresAt, at);
      }
      if (value.startsWith('https://') || value.startsWith('http://')) {
        try {
          const params = new URL(value).searchParams;
          const signed = params.get('X-Amz-Date');
          const seconds = Number(params.get('X-Amz-Expires'));
          if (signed && /^\d{8}T\d{6}Z$/.test(signed) && seconds > 0) {
            const at = Date.parse(`${signed.slice(0, 4)}-${signed.slice(4, 6)}-${signed.slice(6, 8)}T${signed.slice(9, 11)}:${signed.slice(11, 13)}:${signed.slice(13, 15)}Z`);
            expiresAt = Math.min(expiresAt, at + seconds * 1000 - 30_000);
          }
        } catch { /* Relative or malformed media links do not change the feed TTL. */ }
      }
    } else if (Array.isArray(value)) value.forEach(item => visit(item));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([name, item]) => visit(item, name));
  }
  visit(data);
  return expiresAt;
}
