"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AssistantClient, type AssistantLocale } from "@/lib/assistant/client";
import type { AssistantProductCard } from "@/types/assistant";

/**
 * `Omit` over a union collapses to the keys common to every member, which would
 * drop `products`/`escalate`. Distributing over the union keeps each variant.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type Turn =
  | { id: number; role: "customer"; text: string }
  | {
      id: number;
      role: "assistant";
      text: string;
      products: AssistantProductCard[];
      escalate: boolean;
    }
  | { id: number; role: "notice"; text: string };

/** Copy the hook needs; passed in so all strings stay in the i18n dictionary. */
export interface AssistantCopy {
  intro: string;
  errorGeneric: string;
  /** Contains "{s}", replaced with the retry delay in seconds. */
  rateLimited: string;
}

export function useAssistant(locale: AssistantLocale, copy: AssistantCopy) {
  const { language, countryCode, currency } = locale;

  const client = useMemo(
    () => new AssistantClient({ language, countryCode, currency }),
    [language, countryCode, currency],
  );

  /** null = still checking. Keep the launcher hidden until this is true. */
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  // A ref as well as state: `busy` state is stale inside the same tick, and the
  // guard must reject a second submit before React re-renders.
  const busyRef = useRef(false);
  const seq = useRef(0);

  useEffect(() => {
    const ctrl = new AbortController();
    client
      .isEnabled(ctrl.signal)
      .then(setEnabled)
      .catch(() => setEnabled(false));
    return () => ctrl.abort();
  }, [client]);

  const push = useCallback((turn: DistributiveOmit<Turn, "id">) => {
    seq.current += 1;
    setTurns((t) => [...t, { ...turn, id: seq.current } as Turn]);
  }, []);

  /** Local greeting — no API call, so it costs nothing against the rate limit. */
  const greet = useCallback(() => {
    setTurns((t) => {
      if (t.length > 0) return t;
      seq.current += 1;
      return [{ id: seq.current, role: "assistant", text: copy.intro, products: [], escalate: false }];
    });
  }, [copy.intro]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busyRef.current) return; // one request in flight at a time

      busyRef.current = true;
      setBusy(true);
      push({ role: "customer", text: trimmed });

      const result = await client.send(trimmed);

      busyRef.current = false;
      setBusy(false);

      if (result.ok) {
        push({
          role: "assistant",
          text: result.data.reply,
          products: result.data.products,
          escalate: result.data.escalate,
        });
        return;
      }

      push({
        role: "notice",
        text:
          result.kind === "rate_limited"
            ? copy.rateLimited.replace("{s}", String(result.retryAfterSeconds))
            : copy.errorGeneric,
      });
    },
    [client, push, copy.rateLimited, copy.errorGeneric],
  );

  const reset = useCallback(() => {
    client.reset();
    setTurns([]);
  }, [client]);

  return { enabled, turns, busy, send, reset, greet };
}
