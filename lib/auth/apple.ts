import { appleCallback } from "@/lib/auth/client";
import type { Claims } from "@/lib/auth/token";

/**
 * Sign in with Apple, popup flow, via Apple's own JS SDK.
 *
 * The popup returns the authorization code (and, on FIRST consent only, the user's name) straight
 * to this page — no server-side redirect handling needed. Two values must line up exactly or
 * Apple rejects the flow:
 * - clientId  = the SERVICES ID from Apple Developer (not the App ID), NEXT_PUBLIC_APPLE_CLIENT_ID
 * - redirectURI must be byte-identical to a Return URL registered on that Services ID, and is
 *   forwarded to the backend so its token exchange uses the same value.
 */

const SDK_SRC =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

const CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID ?? "";
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ??
  (typeof window !== "undefined" ? window.location.origin : "");

type AppleAuthorization = {
  authorization: { code: string; id_token?: string };
  user?: { name?: { firstName?: string; lastName?: string } };
};

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init(config: Record<string, unknown>): void;
        signIn(): Promise<AppleAuthorization>;
      };
    };
  }
}

export function appleConfigured(): boolean {
  return CLIENT_ID.length > 0;
}

let sdkLoading: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (window.AppleID) return Promise.resolve();
  if (!sdkLoading) {
    sdkLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SDK_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        sdkLoading = null;
        reject(new Error("apple sdk failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return sdkLoading;
}

/** Opens the Apple popup and exchanges the result with our backend. Throws on cancel/failure. */
export async function signInWithApple(): Promise<Claims> {
  if (!appleConfigured()) throw new Error("apple not configured");
  await loadSdk();
  window.AppleID!.auth.init({
    clientId: CLIENT_ID,
    scope: "name email",
    redirectURI: REDIRECT_URI,
    usePopup: true,
  });
  const result = await window.AppleID!.auth.signIn();
  return appleCallback({
    code: result.authorization.code,
    identityToken: result.authorization.id_token,
    // Apple sends the name ON FIRST CONSENT ONLY — pass it along or it is lost forever.
    firstName: result.user?.name?.firstName,
    lastName: result.user?.name?.lastName,
    redirectUri: REDIRECT_URI,
  });
}
