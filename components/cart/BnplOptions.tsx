"use client";

import { useI18n } from "@/components/i18n/language-provider";
import { TabbyLogo, TamaraLogo } from "@/components/cart/payment-logos";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Option({ logo, per }: { logo: React.ReactNode; per: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
      {logo}
      <span className="text-xs font-medium text-foreground" dir="ltr">
        4 × ${per}
      </span>
    </div>
  );
}

/** "Pay in 4" Buy-Now-Pay-Later options (Tabby & Tamara). */
export function BnplOptions({
  total,
  compact = false,
}: {
  total: number;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const per = formatMoney(total / 4);

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
