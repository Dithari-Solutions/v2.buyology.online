"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";
import { addTicketMessage, fetchTicket, type SupportTicket } from "@/lib/support-api";
import { supportStatusTone } from "@/components/support/MyTickets";
import { ChevronLeftIcon, SendIcon } from "@/components/icons";

const field =
  "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring";

/**
 * One ticket: what was reported, the screenshots, and the running conversation with the team.
 * The customer replies from here; a CLOSED ticket is read-only with a pointer to open a new one.
 */
export function TicketDetail({ ticketId }: { ticketId: string }) {
  const { t, locale } = useI18n();
  const s = t.support;
  const router = useRouter();
  const { status } = useAuth();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [failed, setFailed] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "guest") router.replace(`/login?next=/support/${ticketId}`);
    if (status !== "authed") return;
    let cancelled = false;
    fetchTicket(ticketId)
      .then((data) => {
        if (!cancelled) setTicket(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [status, router, ticketId]);

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = reply.trim();
    if (busy || !body) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await addTicketMessage(ticketId, body);
      setTicket(updated);
      setReply("");
    } catch (err) {
      setError(
        err instanceof AuthError && (err.status === 400 || err.status === 409) && err.message
          ? err.message
          : s.detail.error,
      );
    } finally {
      setBusy(false);
    }
  }

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-16 text-center">
        <p className="text-lg font-semibold text-foreground">{s.detail.notFound}</p>
        <Link href="/support/my" className="text-sm font-semibold text-brand-icon hover:underline">
          {s.detail.backToList}
        </Link>
      </div>
    );
  }

  if (ticket === null || status !== "authed") {
    return (
      <div className="space-y-4" aria-busy>
        <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
      </div>
    );
  }

  const closed = ticket.status === "CLOSED";
  const messages = ticket.messages ?? [];

  return (
    <div>
      <Link
        href="/support/my"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
        {s.detail.backToList}
      </Link>

      {/* Ticket summary */}
      <div className="mt-3 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted" dir="ltr">
              {ticket.reference ?? ticket.id.slice(0, 8)}
            </p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {ticket.subject}
            </h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supportStatusTone(ticket.status)}`}>
            {s.statuses[ticket.status] ?? ticket.status}
          </span>
        </div>

        <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="shrink-0 text-muted">{s.detail.category}</dt>
            <dd className="text-foreground">{(ticket.category && s.categories[ticket.category]) ?? ticket.category}</dd>
          </div>
          {ticket.createdAt && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-muted">{s.detail.opened}</dt>
              <dd className="text-foreground">{dateFmt.format(new Date(ticket.createdAt))}</dd>
            </div>
          )}
          {ticket.pageUrl && (
            <div className="flex min-w-0 gap-2 sm:col-span-2">
              <dt className="shrink-0 text-muted">{s.detail.page}</dt>
              <dd className="truncate text-foreground" dir="ltr">{ticket.pageUrl}</dd>
            </div>
          )}
        </dl>

        <p className="mt-4 whitespace-pre-wrap rounded-xl bg-surface-2 p-4 text-sm leading-relaxed text-foreground">
          {ticket.description}
        </p>

        {(ticket.imageUrls?.length ?? 0) > 0 && (
          <ul className="mt-4 grid grid-cols-4 gap-2">
            {ticket.imageUrls!.map((src, i) => (
              <li key={i}>
                <a href={src} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-20 w-full rounded-xl border border-border object-cover" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Conversation */}
      <div className="mt-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {s.detail.conversation}
        </h2>

        {messages.length === 0 ? (
          <p className="mt-4 text-sm text-muted">{s.detail.noMessages}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {messages.map((m) => {
              const mine = m.author === "CUSTOMER";
              return (
                <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[70%] ${
                      mine
                        ? "rounded-ee-md bg-brand-soft text-foreground"
                        : "rounded-es-md border border-border bg-surface-2 text-foreground"
                    }`}
                  >
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {mine ? s.detail.you : s.detail.team}
                    </p>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    {m.createdAt && (
                      <p className="mt-1.5 text-[11px] text-muted">
                        {dateFmt.format(new Date(m.createdAt))}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {closed ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
            <span>{s.detail.closedNote}</span>
            <Link href="/support" className="font-semibold text-brand-icon hover:underline">
              {s.list.newTicket}
            </Link>
          </div>
        ) : (
          <form onSubmit={send} className="mt-5">
            <label className="block">
              <span className="sr-only">{s.detail.replyPlaceholder}</span>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                maxLength={4000}
                placeholder={s.detail.replyPlaceholder}
                className={field}
              />
            </label>
            {error && (
              <p role="alert" className="mt-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !reply.trim()}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SendIcon className="h-4 w-4 rtl:-scale-x-100" />
              {busy ? s.detail.sending : s.detail.send}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
