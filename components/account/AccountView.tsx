"use client";

import { useState } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AccountGate, useAccountData } from "@/components/account/account-data";
import {
  CreditCardIcon,
  LockIcon,
  LogOutIcon,
  MapPinIcon,
  PackageIcon,
  SettingsIcon,
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
  return (
    <AccountGate
      fallback={
        // The boot restore is still deciding; a quiet skeleton beats a flash of the wrong state.
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]" aria-busy>
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
        </div>
      }
    >
      <AccountViewInner />
    </AccountGate>
  );
}

function AccountViewInner() {
  const { t } = useI18n();
  const { profile } = useAccountData();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const active = TABS.find((x) => x.key === tab) ?? TABS[0];

  const firstName = profile?.firstName ?? "";
  const lastName = profile?.lastName ?? "";
  const email = profile?.email ?? "";
  const displayName = `${firstName} ${lastName}`.trim() || email || "—";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() ||
    email.charAt(0).toUpperCase() ||
    "•";
  void user;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {t.account.title}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            {profile?.avatarUrl ? (
              // Presigned, short-lived URL — plain <img>, same reasoning as story media.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-base font-bold text-white">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
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

          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="mt-3 flex w-full items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOutIcon className="h-[18px] w-[18px]" />
            {t.account.signOut}
          </button>
        </aside>

        {/* Content */}
        <div>{active.render()}</div>
      </div>
    </div>
  );
}
