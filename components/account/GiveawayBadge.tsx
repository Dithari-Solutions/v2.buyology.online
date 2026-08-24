"use client";

import { useEffect, useState } from "react";
import {
  fetchGiveawayStatus,
  instagramUrl,
  type GiveawayStatus,
} from "@/lib/giveaway-api";
import { useI18n } from "@/components/i18n/language-provider";
import { InstagramIcon, SparklesIcon } from "@/components/icons";

/** One fetch per session — the sidebar badge and the profile card share it. */
let cache: GiveawayStatus | null = null;

function useGiveaway(): GiveawayStatus | null {
  const [state, setState] = useState<GiveawayStatus | null>(cache);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    fetchGiveawayStatus()
      .then((s) => {
        cache = s;
        if (!cancelled) setState(s);
      })
      .catch(() => {
        /* no badge is the right answer when we cannot tell */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/** Sidebar badge — present only for a customer who actually entered. */
export function GiveawayBadge() {
  const { t } = useI18n();
  const state = useGiveaway();
  if (!state?.entered) return null;
  return (
    <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-warn dark:text-gold">
      <SparklesIcon className="h-3 w-3 shrink-0" />
      {t.giveaway.entrantBadge}
    </span>
  );
}

/**
 * The entered customer's Instagram profile, shown on the profile tab. Absent entirely for
 * anyone who has not entered — an empty "not entered" card would be noise on every other
 * account.
 */
export function GiveawayProfileCard() {
  const { t, locale } = useI18n();
  const state = useGiveaway();
  if (!state?.entered || !state.instagramHandle) return null;

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface-2 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <SparklesIcon className="h-4 w-4 shrink-0 text-gold" />
        {t.giveaway.entrantBadge}
      </p>
      <a
        href={instagramUrl(state.instagramHandle)}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="mt-2 inline-flex items-center gap-2 break-all text-sm font-medium text-brand-icon hover:underline"
      >
        <InstagramIcon className="h-4 w-4 shrink-0" />@{state.instagramHandle}
      </a>
      {state.enteredAt && (
        <p className="mt-1 text-xs text-muted">
          {t.giveaway.enteredAs} · {dateFmt.format(new Date(state.enteredAt))}
        </p>
      )}
    </div>
  );
}
