import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import { sameCountry, type Market } from "@/lib/market";
import {
  clearSession,
  decodeClaims,
  getAccessToken,
  setSession,
  type Claims,
} from "@/lib/auth/token";

/**
 * The auth API client. Contract notes that shape it:
 *
 * - Every /auth call sends credentials:'include' — the refresh token is an HttpOnly cookie with
 *   SameSite=None, and without the flag cross-site requests silently drop it.
 * - The backend's expired-token behaviour is a 403 with an EMPTY body (the JWT filter continues
 *   unauthenticated and Spring's default entry point answers), NOT a JSON 401 — auth-required
 *   calls must treat both as "session over".
 * - Refresh tokens are ROTATED and one-time-use, so concurrent refreshes must be collapsed into
 *   one in-flight request: the loser of a race would burn a token the winner just rotated away
 *   and log the user out for no reason.
 * - Errors carry meaning in the HTTP status (404 unknown email, 401 wrong password/OTP, 409 email
 *   exists, 410 OTP expired, 429 rate/attempt limits, 403 suspended). The UI maps STATUS codes to
 *   translated strings — never substring-matches the English message.
 */

export class AuthError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type SessionData = { accessToken: string; expiresIn: number };

async function post<T>(path: string, body?: unknown, token?: string | null): Promise<T> {
  let res: Response;
  try {
    res = await fetch(backendUrl(path), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "web",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AuthError(0, "network");
  }
  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    /* empty body — the backend's 403 does this */
  }
  if (!res.ok) {
    throw new AuthError(res.status, envelope?.message ?? `HTTP ${res.status}`);
  }
  return envelope?.data as T;
}

// ── Sessions ─────────────────────────────────────────────────────────────────

function adopt(data: SessionData): Claims {
  setSession(data.accessToken, data.expiresIn);
  const claims = decodeClaims(data.accessToken);
  if (!claims) throw new AuthError(0, "bad token");
  return claims;
}

export async function signIn(email: string, password: string): Promise<Claims> {
  return adopt(await post<SessionData>("/auth/signin", { email, password }));
}

export async function signUp(email: string, password: string, repeatedPassword: string, phoneNumber?: string): Promise<void> {
  await post<string>("/auth/signup", { email, password, repeatedPassword, phoneNumber });
}

export async function verifyOtp(email: string, otpCode: string): Promise<Claims> {
  return adopt(await post<SessionData>("/auth/verify-otp", { email, otpCode }));
}

let refreshInFlight: Promise<Claims | null> | null = null;

/**
 * Silent session restore/extension. Single-flight: refresh tokens rotate, so two concurrent
 * refreshes mean the second burns a token the first already replaced.
 */
export function refreshSession(): Promise<Claims | null> {
  if (!refreshInFlight) {
    refreshInFlight = post<SessionData>("/auth/refresh")
      .then((data) => adopt(data))
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function signOut(): Promise<void> {
  try {
    await post("/auth/logout");
  } catch {
    /* revoking is best-effort; the local session clears regardless */
  }
  clearSession();
}

// ── Apple ────────────────────────────────────────────────────────────────────

export async function appleChallenge(): Promise<{ nonce: string }> {
  return post("/auth/apple/challenge", { platform: "web" });
}

export async function appleCallback(payload: {
  nonce: string;
  code: string;
  identityToken?: string;
  firstName?: string;
  lastName?: string;
  redirectUri: string;
}): Promise<Claims> {
  return adopt(await post<SessionData>("/auth/apple/callback", payload));
}

// ── Password reset ───────────────────────────────────────────────────────────

export async function forgotPassword(email: string): Promise<void> {
  await post("/auth/forgot-password", { email });
}

export async function resetPassword(payload: {
  email: string;
  otpCode: string;
  newPassword: string;
  repeatPassword: string;
}): Promise<void> {
  await post("/auth/reset-password", payload);
}

// ── Authenticated calls ──────────────────────────────────────────────────────

/**
 * Is this response an expired session, or the server refusing on the merits?
 *
 * A 401 is always the former. A 403 is genuinely ambiguous here: an expired access token does not
 * produce a JSON 401 — the JWT filter continues unauthenticated and Spring's default entry point
 * answers 403 with an EMPTY body — while a real refusal ("you can only purchase from stores in
 * your current country", a suspended account) answers 403 WITH the JSON envelope. The body is the
 * only thing that separates them.
 *
 * Treating every 403 as a lapsed session is not a harmless over-reach. Refresh tokens are rotated
 * and one-time-use, so each needless refresh burns a rotation; a customer repeatedly hitting a
 * business rule — adding items from another country, say — spent their session on retries that
 * could never succeed and was signed out for it, having been shown a sync error rather than the
 * reason. That is the bug this exists to stop.
 */
async function isSessionLapsed(res: Response): Promise<boolean> {
  if (res.status === 401) return true;
  if (res.status !== 403) return false;
  // clone() so the caller still gets an unread body to parse.
  try {
    return (await res.clone().text()).trim().length === 0;
  } catch {
    // Unreadable body — treat as a real refusal rather than burning a rotation on a guess.
    return false;
  }
}

/**
 * Fetch with the Bearer token, retrying ONCE through a refresh when the session has lapsed.
 *
 * Only a lapsed session is retried — see {@link isSessionLapsed}. A 403 that carries a message is
 * the server's answer, not a prompt to re-authenticate, and is returned to the caller untouched so
 * the UI can show what it says.
 */
export async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  // Recheck on each purchase action, rather than relying on a profile saved by another client.
  // Payment retries and callbacks retain their original order's market and never use this gate.
  const purchase = (method === "POST" || method === "PATCH") &&
    (/^\/api\/cart\/[^/]+\/(items|selection|checkout)(\/|\?|$)/.test(path) ||
      (method === "POST" && (path === "/api/orders" || path === "/api/orders/buy-now")));
  if (purchase && typeof window !== "undefined") await preparePurchaseMarket();

  const call = (token: string | null) =>
    fetch(backendUrl(path), {
      ...init,
      credentials: "include",
      headers: {
        "X-Client-Type": "web",
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });

  let res = await call(getAccessToken());
  if (await isSessionLapsed(res)) {
    const claims = await refreshSession();
    if (claims) {
      if (purchase && typeof window !== "undefined") await preparePurchaseMarket();
      res = await call(getAccessToken());
    }
  }
  return res;
}

let marketCheckInFlight: Promise<void> | null = null;

/** Collapse simultaneous checks but never keep a completed location/profile decision cached. */
async function preparePurchaseMarket(): Promise<void> {
  if (marketCheckInFlight) return marketCheckInFlight;
  marketCheckInFlight = (async () => {
    const token = getAccessToken();
    const uid = token ? decodeClaims(token)?.uid : null;
    if (!uid) return; // The normal endpoint authentication/refresh still handles this case.
    const res = await fetch("/api/market", { cache: "no-store" });
    if (!res.ok) throw new AuthError(res.status, "Could not check your delivery country. Please try again.");
    const { market, redirectHost } = await res.json() as { market: Market; redirectHost: string | null };
    if (redirectHost) {
      window.location.assign(`https://${redirectHost}/cart`);
      throw new AuthError(409, "Your location has changed. Opening the store for your country.");
    }
    const profile = await fetchProfile(uid);
    if (!sameCountry(profile.selectedCountryCode, market.countryCode) || profile.preferredCurrency !== market.currency) {
      await updateProfile(uid, { selectedCountryCode: market.countryCode, preferredCurrency: market.currency });
    }
  })().finally(() => { marketCheckInFlight = null; });
  return marketCheckInFlight;
}

export async function authedJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await authedFetch(path, init);
  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new AuthError(res.status, envelope?.message ?? `HTTP ${res.status}`);
  return envelope?.data as T;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export type Profile = {
  userId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  phoneVerified?: boolean;
  /**
   * Whether the customer can act on an unverified number right now. False while verification SMS
   * is switched off — the number stays unverified and we still say so, but we do not offer a
   * button that cannot succeed.
   */
  phoneVerificationAvailable?: boolean;
  /** Server-computed: everything an order (or a prize delivery) needs is on file. */
  paymentReady?: boolean;
  /** What is still missing: firstName | phoneNumber | phoneVerification | deliveryAddress. */
  missingFields?: string[] | null;
  pendingDeletion?: boolean;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
  selectedCountryCode?: string | null;
  preferredCurrency?: string | null;
};

export function fetchProfile(uid: string): Promise<Profile> {
  return authedJson<Profile>(`/api/users/${uid}/profile`);
}

export function updateProfile(
  uid: string,
  changes: { firstName?: string; lastName?: string; phoneNumber?: string; dateOfBirth?: string; selectedCountryCode?: string; preferredCurrency?: string },
): Promise<Profile> {
  return authedJson<Profile>(`/api/users/${uid}/profile`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });
}

export function uploadAvatar(uid: string, file: File): Promise<Profile> {
  const form = new FormData();
  form.append("avatar", file);   // the backend reads @RequestPart("avatar")
  return authedJson<Profile>(`/api/users/${uid}/profile/avatar`, {
    method: "PATCH",
    body: form,
  });
}

/**
 * Best-effort: the signup endpoint stores credentials and phone, so the names the form collects are
 * saved right after verification. A failure here must never fail the signup — the account exists.
 */
export async function saveProfileNames(uid: string, firstName: string, lastName: string): Promise<void> {
  try {
    await updateProfile(uid, { firstName, lastName });
  } catch {
    /* best-effort */
  }
}

export async function googleCallback(idToken: string): Promise<Claims> {
  return adopt(await post<SessionData>("/auth/google/callback", { idToken }));
}
