"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CloseIcon, SendIcon } from "@/components/icons";
import { useI18n } from "@/components/i18n/language-provider";

/**
 * Buyobot avatar — drawn rather than imported so it inherits the brand palette
 * and stays sharp at every size. Mikado Yellow shell, American Blue visor.
 */
function BuyobotAvatar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true" className={className}>
      {/* antenna */}
      <line x1="24" y1="6" x2="24" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="5" r="3" fill="currentColor" />
      {/* head */}
      <rect x="8" y="12" width="32" height="26" rx="9" fill="currentColor" />
      {/* visor */}
      <rect x="13" y="18" width="22" height="13" rx="6.5" fill="var(--color-brand)" />
      {/* eyes */}
      <circle cx="19.5" cy="24.5" r="2.6" fill="var(--color-gold)" />
      <circle cx="28.5" cy="24.5" r="2.6" fill="var(--color-gold)" />
      {/* ears */}
      <rect x="4" y="21" width="3.5" height="8" rx="1.75" fill="currentColor" />
      <rect x="40.5" y="21" width="3.5" height="8" rx="1.75" fill="currentColor" />
    </svg>
  );
}

type Msg = { id: number; from: "bot" | "user"; text: string };

/**
 * Always-on chat launcher and panel.
 *
 * The panel is a NON-modal dialog on purpose: a support widget should not trap
 * focus or lock page scroll the way the cart drawer and command palette do —
 * people need to keep reading the page while they type. So it closes on Escape
 * and on its own close button, but not on outside click, which would throw away
 * a half-typed question.
 *
 * Replies are matched locally against the quick-reply topics. There is no
 * backend in this build; wire `respond()` to the real assistant endpoint and the
 * rest of the component is unchanged.
 */
export function ChatWidget() {
  const { t } = useI18n();
  const c = t.chat;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const seq = useRef(0);

  const panelId = `chat${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const topics = [
    { key: "track", label: c.quickTrack, reply: c.replyTrack },
    { key: "returns", label: c.quickReturns, reply: c.replyReturns },
    { key: "product", label: c.quickProduct, reply: c.replyProduct },
    { key: "human", label: c.quickHuman, reply: c.replyHuman },
  ];

  const push = useCallback((from: Msg["from"], body: string) => {
    seq.current += 1;
    setMsgs((m) => [...m, { id: seq.current, from, text: body }]);
  }, []);

  // Greet once, the first time the panel is opened.
  useEffect(() => {
    if (open && msgs.length === 0) push("bot", c.intro);
  }, [open, msgs.length, push, c.intro]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the newest message in view as the log grows.
  useEffect(() => {
    if (open) logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [msgs, open]);

  const close = useCallback(() => {
    setOpen(false);
    launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  /** Local stand-in for the assistant. Swap for a real call when one exists. */
  function respond(question: string) {
    const q = question.toLowerCase();
    const hit = topics.find(
      (topic) =>
        q.includes(topic.label.toLowerCase()) ||
        topic.label.toLowerCase().includes(q),
    );
    push("bot", hit ? hit.reply : c.fallback);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    push("user", body);
    setText("");
    respond(body);
  }

  function askTopic(topic: (typeof topics)[number]) {
    push("user", topic.label);
    push("bot", topic.reply);
    inputRef.current?.focus();
  }

  return (
    <div className="pointer-events-none fixed bottom-4 end-4 z-[120] flex flex-col items-end gap-3 sm:bottom-6 sm:end-6">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={c.title}
          className="buyo-rise pointer-events-auto flex h-[min(30rem,calc(100vh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-elevated shadow-[var(--shadow-overlay)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-brand px-4 py-3 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
              <BuyobotAvatar className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{c.title}</span>
              <span className="flex items-center gap-1.5 text-xs text-white/75">
                <span
                  aria-hidden="true"
                  className="block h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
                {c.status}
              </span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={c.close}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Transcript */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label={c.title}
            className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain bg-surface-2 p-3"
          >
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.from === "user"
                      ? "bg-primary text-primary-fg"
                      : "border border-border bg-surface text-foreground"
                  }`}
                >
                  {m.text}
                </p>
              </div>
            ))}
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-1.5 border-t border-border bg-surface px-3 pt-2.5">
            {topics.map((topic) => (
              <button
                key={topic.key}
                type="button"
                onClick={() => askTopic(topic)}
                className="rounded-full border border-border-strong px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Composer */}
          <form onSubmit={submit} className="flex items-center gap-2 bg-surface p-3">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={c.placeholder}
              aria-label={c.placeholder}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              aria-label={c.send}
              disabled={!text.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <SendIcon className="h-4 w-4 rtl:-scale-x-100" />
            </button>
          </form>

          <p className="border-t border-border bg-surface px-3 py-2 text-[11px] leading-snug text-muted">
            {c.disclaimer}
          </p>
        </div>
      )}

      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? c.close : c.launch}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-fg shadow-[var(--shadow-overlay)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
      >
        {open ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <>
            <BuyobotAvatar className="h-8 w-8" />
            {/* Availability dot — the 24/7 signal, mirrored under RTL. */}
            <span
              aria-hidden="true"
              className="absolute -top-0.5 end-0 block h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500"
            />
          </>
        )}
      </button>
    </div>
  );
}
