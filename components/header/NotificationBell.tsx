"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import {
  fetchUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationRoute,
  type NotificationItem,
} from "@/lib/notifications-api";
import { BellIcon } from "@/components/icons";

const POLL_MS = 60_000;
const PANEL_LIMIT = 20;

/** Same-document hash jump — fires `hashchange` (which router.push via pushState never does). */
function jumpToHash(hash: string) {
  window.location.hash = hash;
}

/**
 * The header notification bell (signed-in customers only): unread badge polled once a minute
 * and on window focus, a dropdown with the latest updates about the customer's own actions —
 * orders, refunds, repairs, sells, support tickets. Clicking an item marks it read and jumps
 * to the matching page; unroutable types just mark themselves read.
 */
export function NotificationBell({ className }: { className: string }) {
  const { t, locale } = useI18n();
  const n = t.notifications;
  const router = useRouter();
  const { status } = useAuth();

  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [listFailed, setListFailed] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // Unread badge: poll + refresh on focus. Errors keep the last known count.
  useEffect(() => {
    if (status !== "authed") return;
    let cancelled = false;
    const refresh = () =>
      fetchUnreadCount()
        .then((value) => {
          if (!cancelled) setCount(value);
        })
        .catch(() => {});
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [status]);

  // The list is fetched fresh each time the panel opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listNotifications()
      .then((list) => {
        if (!cancelled) {
          setItems(list.slice(0, PANEL_LIMIT));
          setListFailed(false);
          setFetchedAt(Date.now());
        }
      })
      .catch(() => {
        // A failed fetch must not masquerade as an empty inbox.
        if (!cancelled) {
          setItems([]);
          setListFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Close on outside click / Escape while open.
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

  if (status !== "authed") return null;

  const timeAgo = (iso: string | null | undefined): string => {
    if (!iso) return "";
    const seconds = Math.round((fetchedAt - new Date(iso).getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (seconds < 60) return rtf.format(-seconds, "second");
    if (seconds < 3600) return rtf.format(-Math.round(seconds / 60), "minute");
    if (seconds < 86400) return rtf.format(-Math.round(seconds / 3600), "hour");
    return rtf.format(-Math.round(seconds / 86400), "day");
  };

  async function openItem(item: NotificationItem) {
    if (!item.read) {
      setItems((prev) =>
        prev ? prev.map((x) => (x.id === item.id ? { ...x, read: true } : x)) : prev,
      );
      setCount((prev) => Math.max(0, prev - 1));
      // Awaited so the freshly-mounted bell on the target page doesn't re-count this row.
      await markNotificationRead(item.id).catch(() => {});
    }
    const route = notificationRoute(item.type);
    if (route) {
      setOpen(false);
      const [path, hash] = route.split("#");
      if (hash && window.location.pathname === path) {
        // Same-page hash target: the account tabs listen for `hashchange`.
        jumpToHash(hash);
      } else {
        router.push(route);
      }
    }
  }

  async function readAll() {
    setItems((prev) => (prev ? prev.map((x) => ({ ...x, read: true })) : prev));
    setCount(0);
    markAllNotificationsRead().catch(() => {});
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        id="header-notifications"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={count > 0 ? `${n.aria}, ${count}` : n.aria}
        aria-expanded={open}
        aria-haspopup="true"
        className={className}
      >
        <BellIcon className="h-[22px] w-[22px]" />
        {count > 0 && (
          <span
            key={count}
            className="buyo-badge-pop absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-fg ring-2 ring-background rtl:right-auto rtl:-left-0.5"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-[calc(100%+8px)] z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{n.title}</p>
            {count > 0 && (
              <button
                type="button"
                onClick={readAll}
                className="text-xs font-semibold text-brand-icon transition-colors hover:underline"
              >
                {n.markAllRead}
              </button>
            )}
          </div>

          {items === null ? (
            <div className="space-y-2 p-4" aria-busy>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-2 motion-reduce:animate-none" />
              ))}
            </div>
          ) : listFailed ? (
            <p className="px-6 py-8 text-center text-sm text-muted">{n.error}</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
                <BellIcon className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold text-foreground">{n.empty}</p>
              <p className="text-xs text-muted">{n.emptyBody}</p>
            </div>
          ) : (
            <ul className="max-h-[min(60vh,420px)] overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:bg-surface-2 ${
                      item.read ? "" : "bg-brand-soft/40"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.read ? "bg-border" : "bg-primary"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                        {item.body}
                      </span>
                      {item.createdAt && (
                        <span className="mt-1 block text-[11px] text-muted">
                          {timeAgo(item.createdAt)}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
