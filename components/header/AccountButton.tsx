"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { fetchProfile, type Profile } from "@/lib/auth/client";
import { UserIcon } from "@/components/icons";

/** One profile fetch per session, shared across header remounts and navigations. */
let profileCache: { uid: string; profile: Profile } | null = null;

/**
 * The header's account affordance, honest about who you are: guests get "Sign in",
 * a signed-in customer gets their avatar/initials and a small menu (account, sign out).
 * While the session silently restores it renders the neutral look — never a guess.
 */
export function AccountButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const { status, user, signOut } = useAuth();
  const router = useRouter();
  const [fetched, setFetched] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "guest") {
    return (
      <Link
        href="/login?next=/account"
        aria-label={t.auth.login.submit}
        className={className}
      >
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
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.header.account}
        className={className}
      >
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
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-[60] mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-xl"
        >
          <Link
            role="menuitem"
            href="/account"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.header.account}
          </Link>
          <button
            role="menuitem"
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await signOut();
              } finally {
                profileCache = null;
                setOpen(false);
                setBusy(false);
                router.push("/");
              }
            }}
            className="block w-full rounded-xl px-3 py-2 text-start text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {t.account.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
