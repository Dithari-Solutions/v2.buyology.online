"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAccountData } from "@/components/account/account-data";
import { ArrowRightShortIcon, CheckIcon } from "@/components/icons";

/**
 * "Back to where you left off."
 *
 * A customer sent here to fill in a missing detail — a phone number for the giveaway, an
 * address for checkout — has lost their place, and the old storefront solved that with a
 * sticky bar back to the interrupted action. Same idea: arrive as
 * `/account?returnTo=giveaway`, and a bar tracks what is still missing and hands them the way
 * back the moment it is all there.
 *
 * Readiness comes from the profile the server already computes (`missingFields`), so this bar
 * and the gate that sent them here can never disagree about what is outstanding.
 */
const DESTINATIONS: Record<string, { href: string; labelKey: "giveaway" | "checkout" }> = {
  giveaway: { href: "/#giveaway", labelKey: "giveaway" },
  checkout: { href: "/checkout", labelKey: "checkout" },
};

export function ReturnTo() {
  const { t } = useI18n();
  const r = t.account.returnTo;
  const params = useSearchParams();
  const { profile } = useAccountData();

  const key = params.get("returnTo") ?? "";
  const target = DESTINATIONS[key];
  if (!target) return null;

  // The giveaway needs to reach the winner; it does not need a billing name.
  const relevant =
    key === "giveaway"
      ? ["phoneNumber", "phoneVerification", "deliveryAddress"]
      : ["firstName", "phoneNumber", "phoneVerification", "deliveryAddress"];
  const missing = (profile?.missingFields ?? []).filter((f) => relevant.includes(f));
  const ready = profile != null && missing.length === 0;

  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        {ready ? (
          <>
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {r.ready}
            </p>
            <Link
              href={target.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {r.back[target.labelKey]}
              <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </>
        ) : (
          <p className="text-xs text-muted">
            {r.pending}{" "}
            <span className="font-semibold text-foreground">
              {missing.map((f) => r.fields[f] ?? f).join(", ")}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
