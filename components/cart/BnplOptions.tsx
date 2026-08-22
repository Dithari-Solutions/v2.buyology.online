"use client";

import { useI18n } from "@/components/i18n/language-provider";
import { formatMoney } from "@/lib/format";
import { TabbyLogo, TamaraLogo } from "@/components/cart/payment-logos";

function Option({ logo, per }: { logo: React.ReactNode; per: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
      {logo}
      <span className="text-xs font-medium text-foreground" dir="ltr">
        4 × {per}
      </span>
    </div>
  );
}

/**
 * "Pay in 4" Buy-Now-Pay-Later options (Tabby & Tamara): four equal instalments of the total,
 * in the cart's own currency. The instalment is rounded to the cent the way both providers
 * present it; the fourth payment absorbs any sub-cent remainder at their end.
 */
export function BnplOptions({
  total,
  currency,
  compact = false,
}: {
  total: number;
  currency?: string;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const per = formatMoney(Math.round((total / 4) * 100) / 100, currency);

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted">{t.cart.bnpl}</p>
      <div className="grid grid-cols-2 gap-2">
        <Option logo={<TabbyLogo className="h-[18px] w-auto" />} per={per} />
        <Option logo={<TamaraLogo className="h-[18px] w-auto" />} per={per} />
      </div>
      {!compact && (
        <p className="mt-2 text-[11px] text-muted">{t.cart.bnplNote}</p>
      )}
    </div>
  );
}
