"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { backendUrl } from "@/lib/backend";
import { useI18n } from "@/components/i18n/language-provider";
import { CONSENT_COOKIE, CONSENT_EVENT, browserConsent, clearOptionalStorage, googleConsent, newDecision,
  parseConsent, persistConsent, rememberConsent, type ConsentDecision } from "@/lib/consent";

type ConsentContext = {
  consent: ConsentDecision | null;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  save: (analytics: boolean, marketing: boolean) => void;
};
const Context = createContext<ConsentContext | null>(null);

export function CookieConsentProvider({ initialConsent, children }: { initialConsent: ConsentDecision | null; children: React.ReactNode }) {
  const { locale } = useI18n();
  const [consent, setConsent] = useState(initialConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const save = useCallback((analytics: boolean, marketing: boolean) => {
    const previous = browserConsent();
    const decision = newDecision({ analytics, marketing }, previous ? "SETTINGS" : "BANNER", locale, previous);
    persistConsent(decision);
    setConsent(decision);
    setSettingsOpen(false);
    window.dispatchEvent(new Event(CONSENT_EVENT));
    try { localStorage.setItem("buyology-consent-updated", decision.decisionId); } catch { /* optional cross-tab synchronization */ }
    const withdrawAnalytics = Boolean(previous?.analytics && !analytics);
    const withdrawMarketing = Boolean(previous?.marketing && !marketing);
    if (withdrawAnalytics || withdrawMarketing) {
      const runtime = window as unknown as Record<string, unknown>;
      if (withdrawAnalytics) runtime["ga-disable-G-33199BYJE6"] = true;
      const gtag = runtime.gtag as ((...args: unknown[]) => void) | undefined;
      gtag?.("consent", "update", googleConsent(analytics, marketing));
      if (withdrawMarketing) (runtime.fbq as ((...args: unknown[]) => void) | undefined)?.("consent", "revoke");
      clearOptionalStorage(withdrawAnalytics, withdrawMarketing);
      // Scripts already executed cannot be unloaded. A clean document stops their history hooks.
      // Persist the decision first; its audit request retries idempotently on the next page.
      window.location.reload();
    }
  }, [locale]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false, attempts = 0;
    const synchronize = async () => {
      const current = browserConsent();
      if (!current?.pending || stopped) return;
      try {
        const response = await fetch(backendUrl("/api/privacy/consents"), { method: "POST", credentials: "omit", keepalive: true,
          headers: { "Content-Type": "application/json" }, body: JSON.stringify({
            decisionId: current.decisionId, consentId: current.consentId, analytics: current.analytics,
            marketing: current.marketing, policyVersion: current.version, source: current.source, language: current.language,
          }) });
        if (!response.ok) throw new Error("Consent record pending");
        const receipt = await response.json() as { data?: { decisionId?: string; recorded?: boolean } };
        if (receipt.data?.decisionId !== current.decisionId || receipt.data.recorded !== true) throw new Error("Consent record not acknowledged");
        if (browserConsent()?.decisionId === current.decisionId) persistConsent({ ...current, pending: false });
      } catch {
        if (!stopped && ++attempts < 4) timer = setTimeout(() => void synchronize(), Math.min(60_000, 5000 * 3 ** (attempts - 1)));
      }
    };
    rememberConsent(consent);
    void synchronize();
    const online = () => { attempts = 0; void synchronize(); };
    window.addEventListener("online", online);
    return () => { stopped = true; clearTimeout(timer); window.removeEventListener("online", online); };
  }, [consent]);

  useEffect(() => {
    const refresh = () => {
      let current: ConsentDecision | null = null;
      try { current = parseConsent(document.cookie.split("; ").find(c => c.startsWith(`${CONSENT_COOKIE}=`))?.slice(CONSENT_COOKIE.length + 1)); } catch { /* blocked storage */ }
      const previous = consent;
      if (current?.decisionId === previous?.decisionId) return;
      const revoked = (previous?.analytics && !current?.analytics) || (previous?.marketing && !current?.marketing);
      rememberConsent(current);
      if (revoked) { clearOptionalStorage(!current?.analytics, !current?.marketing); window.location.reload(); }
      else setConsent(current);
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleExpiry = () => {
      if (!consent) return;
      const remaining = Date.parse(consent.expiresAt) - Date.now();
      if (remaining <= 0) refresh();
      else expiryTimer = setTimeout(scheduleExpiry, Math.min(remaining + 1, 2_147_483_647));
    };
    scheduleExpiry();
    return () => { clearTimeout(expiryTimer); window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh); };
  }, [consent]);

  return <Context.Provider value={{ consent, settingsOpen, openSettings, closeSettings, save }}>{children}</Context.Provider>;
}

export function useCookieConsent() {
  const value = useContext(Context);
  if (!value) throw new Error("Cookie consent must be used within its provider");
  return value;
}
