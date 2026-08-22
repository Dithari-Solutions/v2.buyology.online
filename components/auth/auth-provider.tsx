"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/lib/auth/client";
import { signInWithApple, appleConfigured } from "@/lib/auth/apple";
import { hasSessionHint, msUntilRefresh, type Claims } from "@/lib/auth/token";

/**
 * Real session state for the whole app, following the CartProvider/WishlistProvider idiom.
 *
 * status: "loading" only during the boot restore (so pages can avoid flashing "signed out" at a
 * signed-in visitor), then "guest" or "authed". The access token itself never leaves lib/auth —
 * consumers get claims and actions, not credentials.
 */
type AuthValue = {
  status: "loading" | "guest" | "authed";
  user: Claims | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, repeatedPassword: string): Promise<void>;
  verifyOtp(email: string, otpCode: string): Promise<Claims>;
  appleSignIn(): Promise<void>;
  appleAvailable: boolean;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Claims | null>(null);
  const [status, setStatus] = useState<AuthValue["status"]>("loading");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Keeps the 15-minute access token alive: refresh ~30s before expiry, repeat. */
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const delay = Math.max(msUntilRefresh(), 5_000);
    refreshTimer.current = setTimeout(async () => {
      const claims = await api.refreshSession();
      if (claims) {
        setUser(claims);
        scheduleRefresh();
      } else {
        setUser(null);
        setStatus("guest");
      }
    }, delay);
  }, []);

  const adopt = useCallback(
    (claims: Claims) => {
      setUser(claims);
      setStatus("authed");
      scheduleRefresh();
    },
    [scheduleRefresh],
  );

  // Boot: silent restore when a session hint exists (avoids a guaranteed-401 for new visitors).
  useEffect(() => {
    let cancelled = false;
    if (!hasSessionHint()) {
      setStatus("guest");
      return;
    }
    api.refreshSession().then((claims) => {
      if (cancelled) return;
      if (claims) adopt(claims);
      else setStatus("guest");
    });
    return () => {
      cancelled = true;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [adopt]);

  const value: AuthValue = {
    status,
    user,
    async signIn(email, password) {
      adopt(await api.signIn(email, password));
    },
    async signUp(email, password, repeatedPassword) {
      await api.signUp(email, password, repeatedPassword);
    },
    async verifyOtp(email, otpCode) {
      const claims = await api.verifyOtp(email, otpCode);
      adopt(claims);
      return claims;
    },
    async appleSignIn() {
      adopt(await signInWithApple());
    },
    appleAvailable: appleConfigured(),
    async signOut() {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      await api.signOut();
      setUser(null);
      setStatus("guest");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
