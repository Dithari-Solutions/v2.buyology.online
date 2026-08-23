"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { fetchProfile, type Profile } from "@/lib/auth/client";
import { UserIcon } from "@/components/icons";

/** One profile fetch per session, shared across header remounts and navigations. */
let profileCache: { uid: string; profile: Profile } | null = null;

/**
 * The header's account affordance, honest about who you are: guests get "Sign in",
 * a signed-in customer gets their avatar (or initials) and first name. One click goes
 * straight to the account page — no dropdown; sign-out lives there. While the session
 * silently restores it renders the neutral look — never a guess.
 */
export function AccountButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const { status, user } = useAuth();
  const [fetched, setFetched] = useState<Profile | null>(null);

  const uid = user?.uid ?? null;
  useEffect(() => {
    if (status !== "authed" || !uid || profileCache?.uid === uid) return;
    let cancelled = false;
    fetchProfile(uid)
      .then((p) => {
        profileCache = { uid, profile: p };
        if (!cancelled) setFetched(p);
      })
      .catch(() => {
        /* icon fallback is fine */
      });
    return () => {
      cancelled = true;
    };
  }, [status, uid]);
  const profile = profileCache?.uid === uid ? profileCache.profile : fetched;

  if (status === "guest") {
    return (
      <Link href="/login?next=/account" aria-label={t.auth.login.submit} className={className}>
        <UserIcon className="h-[22px] w-[22px]" />
        <span className="hidden text-foreground xl:inline">{t.auth.login.submit}</span>
      </Link>
    );
  }

  if (status !== "authed") {
    // Session restoring — neutral, identical footprint, no premature claims.
    return (
      <Link href="/account" aria-label={t.header.account} className={className}>
        <UserIcon className="h-[22px] w-[22px]" />
        <span className="hidden text-foreground xl:inline">{t.header.account}</span>
      </Link>
    );
  }

  const initials =
    `${(profile?.firstName ?? "").charAt(0)}${(profile?.lastName ?? "").charAt(0)}`
      .toUpperCase()
      .trim();
  const firstName = profile?.firstName?.trim();

  return (
    <Link href="/account" aria-label={t.header.account} className={className}>
      {profile?.avatarUrl?.startsWith("http") ? (
        // Presigned, short-lived URL — plain <img> on purpose.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatarUrl}
          alt=""
          className="h-[26px] w-[26px] rounded-full border border-border object-cover"
        />
      ) : initials ? (
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand-icon">
          {initials}
        </span>
      ) : (
        <UserIcon className="h-[22px] w-[22px]" />
      )}
      <span className="hidden max-w-[9rem] truncate text-foreground xl:inline">
        {firstName || t.header.account}
      </span>
    </Link>
  );
}
