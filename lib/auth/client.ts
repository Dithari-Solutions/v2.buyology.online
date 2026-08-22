import { backendUrl, type ApiEnvelope } from "@/lib/backend";
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

export async function signUp(email: string, password: string, repeatedPassword: string): Promise<void> {
  await post<string>("/auth/signup", { email, password, repeatedPassword });
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

export async function appleCallback(payload: {
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

// ── Profile (names collected at signup) ─────────────────────────────────────

/**
 * Best-effort: the signup endpoint takes only email+password, so the names the form collects are
 * saved right after verification. A failure here must never fail the signup — the account exists.
 */
export async function saveProfileNames(uid: string, firstName: string, lastName: string): Promise<void> {
  const token = getAccessToken();
  if (!token) return;
  try {
    let res: Response;
    res = await fetch(backendUrl(`/api/users/${uid}/profile`), {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "web",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName }),
    });
    void res;
  } catch {
    /* best-effort */
  }
}
