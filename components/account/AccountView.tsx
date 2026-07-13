"use client";

import { useState } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { account } from "@/lib/account";
import { formatInt } from "@/lib/format";
import {
  CreditCardIcon,
  LockIcon,
  LogOutIcon,
  MapPinIcon,
  PackageIcon,
  SettingsIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
} from "@/components/icons";
import {
  AddressesSection,
  DeleteAccountSection,
  OrdersSection,
  PaymentsSection,
  PreferencesSection,
  ProfileSection,
  SecuritySection,
} from "@/components/account/AccountSections";

type Tab = {
  key: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  render: () => ReactNode;
  danger?: boolean;
};

const TABS: Tab[] = [
  { key: "profile", icon: UserIcon, render: () => <ProfileSection /> },
  { key: "orders", icon: PackageIcon, render: () => <OrdersSection /> },
  { key: "addresses", icon: MapPinIcon, render: () => <AddressesSection /> },
  { key: "payments", icon: CreditCardIcon, render: () => <PaymentsSection /> },
  { key: "preferences", icon: SettingsIcon, render: () => <PreferencesSection /> },
  { key: "security", icon: LockIcon, render: () => <SecuritySection /> },
  { key: "danger", icon: TrashIcon, render: () => <DeleteAccountSection />, danger: true },
];

export function AccountView() {
  const { t } = useI18n();
  const [tab, setTab] = useState("profile");
  const active = TABS.find((x) => x.key === tab) ?? TABS[0];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {t.account.title}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-base font-bold text-white">
              {account.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {account.firstName} {account.lastName}
              </p>
              <p className="truncate text-xs text-muted">{account.email}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-warn dark:text-gold">
              <StarIcon className="h-4 w-4" />
              {account.tier} {t.account.tierMember}
            </span>
            <span className="text-sm font-bold text-foreground">
              {formatInt(account.points)}{" "}
              <span className="text-xs font-normal text-muted">
                {t.account.points}
              </span>
            </span>
          </div>

          <nav
            aria-label={t.account.title}
            className="mt-3 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-2 lg:flex-col lg:overflow-visible"
          >
            {TABS.map(({ key, icon: Icon, danger }) => {
              const on = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-current={on ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full ${
                    on
                      ? danger
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-brand-soft text-brand-icon"
                      : danger
                        ? "text-red-600/80 hover:bg-red-500/5 dark:text-red-400/80"
                        : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {t.account.nav[key]}
                </button>
              );
            })}
          </nav>

          <Link
            href="/login"
            className="mt-3 flex w-full items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOutIcon className="h-[18px] w-[18px]" />
            {t.account.signOut}
          </Link>
        </aside>

        {/* Content */}
        <div>{active.render()}</div>
      </div>
    </div>
  );
}
