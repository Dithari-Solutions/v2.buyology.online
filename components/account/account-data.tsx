"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { fetchProfile, type Profile } from "@/lib/auth/client";

/**
 * The signed-in user's real profile, loaded once for the whole account area.
 *
 * Also the page's guard: a guest is redirected to /login?next=/account, and nothing renders until
 * the boot session-restore has settled — flashing a signed-out page at a signed-in visitor (or
 * mock data at anyone) is exactly what this replaces.
 */
type AccountData = {
  profile: Profile | null;
  uid: string;
  reload(): Promise<void>;
};

const AccountDataContext = createContext<AccountData | null>(null);

export function useAccountData(): AccountData {
  const ctx = useContext(AccountDataContext);
  if (!ctx) throw new Error("useAccountData must be used within AccountGate");
  return ctx;
}

export function AccountGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const { status, user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  const uid = user?.uid ?? null;

  const reload = useCallback(async () => {
    if (!uid) return;
    try {
      setProfile(await fetchProfile(uid));
    } catch {
      /* the page still works from JWT claims; fields simply start empty */
    }
  }, [uid]);

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login?next=/account");
      return;
    }
    if (status === "authed" && uid) void reload();
  }, [status, uid, reload, router]);

  if (status !== "authed" || !uid) return <>{fallback}</>;

  return (
    <AccountDataContext.Provider value={{ profile, uid, reload }}>
      {children}
    </AccountDataContext.Provider>
  );
}
