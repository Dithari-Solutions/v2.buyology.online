/**
 * The access token lives HERE and nowhere else — a module-level variable, never localStorage.
 *
 * The refresh token is an HttpOnly cookie the backend owns (Path=/auth/refresh), so XSS cannot
 * read either credential: the worst a script injection gets is the 15-minute access token's
 * lifetime, not a persisted session. localStorage carries only a boolean HINT that a refresh
 * cookie probably exists, used to decide whether the app should attempt a silent restore on boot
 * without firing a guaranteed-401 for every first-time visitor.
 */

const HINT_KEY = "buyo_has_session";

/** A boolean shared across region hosts. Tokens remain in memory/HttpOnly cookies. */
function writeSharedHint(active: boolean): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const host = window.location.hostname;
  if (host !== "buyology.online" && !host.endsWith(".buyology.online")) return;
  try {
    document.cookie = `${HINT_KEY}=${active ? "1" : ""}; Domain=buyology.online; Path=/; Max-Age=${active ? 2_592_000 : 0}; SameSite=Lax; Secure`;
  } catch { /* Cookie restrictions must not prevent sign-in on the current host. */ }
}

let accessToken: string | null = null;
let expiresAt = 0; // epoch ms

export type Claims = {
  /** auth_credentials.id — the id cart/favourites endpoints are keyed by. */
  credentialId: string;
  /** users.id — the id profile/orders endpoints are keyed by. */
  uid: string | null;
};

export function setSession(token: string, expiresInSeconds: number): void {
  accessToken = token;
  expiresAt = Date.now() + expiresInSeconds * 1000;
  writeSharedHint(true);
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearSession(): void {
  accessToken = null;
  expiresAt = 0;
  writeSharedHint(false);
  try {
    localStorage.removeItem(HINT_KEY);
  } catch {
    /* private mode */
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** ms until the token should be refreshed (30s before actual expiry); <= 0 when due now. */
export function msUntilRefresh(): number {
  return expiresAt - Date.now() - 30_000;
}

export function hasSessionHint(): boolean {
  try {
    if (typeof document !== "undefined" && document.cookie.split(";").some((part) => part.trim() === `${HINT_KEY}=1`)) return true;
  } catch { /* Fall back to the current host's local hint. */ }
  try {
    return localStorage.getItem(HINT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Claims out of the JWT — display/routing only, never authorization (the server decides that). */
export function decodeClaims(token: string): Claims | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return {
      credentialId: String(payload.sub),
      uid: payload.uid ? String(payload.uid) : null,
    };
  } catch {
    return null;
  }
}
