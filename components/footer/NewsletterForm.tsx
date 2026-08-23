"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import { ArrowRightShortIcon, CheckIcon } from "@/components/icons";

/**
 * Footer newsletter signup — a real subscription. Re-subscribing is idempotent server-side
 * ("Already subscribed" still returns 200), so success is shown for both. Every mail the
 * backend sends carries its own unsubscribe link.
 */
export function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const nl = t.footer.newsletter;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    try {
      const res = await fetch(backendUrl("/api/newsletter/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = (await res.json().catch(() => null)) as ApiEnvelope<string> | null;
      if (!res.ok || body == null) throw new Error(`subscribe ${res.status}`);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      {state === "done" ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3.5 text-sm font-medium text-white"
        >
          <CheckIcon className="buyo-pop h-5 w-5 text-gold" />
          {nl.success}
        </p>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={nl.placeholder}
            aria-label={nl.placeholder}
            className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-gold/60"
          />
          <button
            type="submit"
            disabled={state === "busy"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {state === "busy" ? "…" : nl.subscribe}
            <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
          </button>
        </form>
      )}
      {state === "error" && (
        <p role="alert" className="mt-2.5 text-xs font-medium text-red-300">
          {nl.error}
        </p>
      )}
      <p className="mt-2.5 text-xs text-white/50">{nl.note}</p>
    </div>
  );
}
