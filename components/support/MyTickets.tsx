"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { listMyTickets, type SupportTicket, type SupportTicketStatus } from "@/lib/support-api";
import { LifeBuoyIcon } from "@/components/icons";

export function supportStatusTone(status: SupportTicketStatus): string {
  if (status === "RESOLVED") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (status === "CLOSED") return "bg-surface-2 text-muted";
  if (status === "WAITING_FOR_CUSTOMER") return "bg-gold/15 text-warn dark:text-gold";
  return "bg-brand-soft text-brand-icon";
}

/**
 * Every support ticket, newest first, with an unread pulse when the team replied or moved one.
 * Rendered both on /support/my and inside the account page's Support tab (`compact` drops the
 * h1 so the account page keeps a single page heading).
 */
export function MyTickets({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useI18n();
  const s = t.support;
  const router = useRouter();
  const { status } = useAuth();
  const [rows, setRows] = useState<SupportTicket[] | null>(null);

  useEffect(() => {
    if (status === "guest") router.replace("/login?next=/support/my");
    if (status !== "authed") return;
    let cancelled = false;
    listMyTickets()
      .then((list) => {
        if (!cancelled) setRows(list);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [status, router]);

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const Heading = compact ? "h2" : "h1";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading
          className={
            compact
              ? "text-xl font-semibold tracking-tight text-foreground"
              : "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          }
        >
          {s.list.title}
        </Heading>
        <Link
          href="/support"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {s.list.newTicket}
        </Link>
      </div>

      {rows === null || status !== "authed" ? (
        <div className="mt-6 space-y-3" aria-busy>
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
            <LifeBuoyIcon className="h-7 w-7" />
          </span>
          <p className="text-lg font-semibold text-foreground">{s.list.emptyTitle}</p>
          <p className="max-w-md text-sm text-muted">{s.list.emptyBody}</p>
          <Link
            href="/support"
            className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
          >
            {s.list.createFirst}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/support/${row.id}`}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                    <span dir="ltr">{row.reference ?? row.id.slice(0, 8)}</span>
                    {row.customerUnread && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-warn dark:text-gold">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" aria-hidden="true" />
                        {s.list.updated}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted">{row.subject}</p>
                  {row.createdAt && (
                    <p className="mt-0.5 text-xs text-muted">{dateFmt.format(new Date(row.createdAt))}</p>
                  )}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supportStatusTone(row.status)}`}>
                  {s.statuses[row.status] ?? row.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
