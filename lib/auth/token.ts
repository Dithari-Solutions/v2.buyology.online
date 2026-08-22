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
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearSession(): void {
  accessToken = null;
  expiresAt = 0;
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
