import { isLocale, type Locale } from "@/lib/i18n/config";

export const CONSENT_COOKIE = "buyology-consent";
export const CONSENT_VERSION = "2026-10-16";
export const CONSENT_DAYS = 180;
export const CONSENT_EVENT = "buyology:consent-change";
const LIFETIME = CONSENT_DAYS * 86400_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ConsentDecision = {
  version: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  consentId: string;
  decisionId: string;
  updatedAt: string;
  expiresAt: string;
  source: "BANNER" | "SETTINGS";
  language: Locale;
  pending: boolean;
};

/** Shared by server rendering, the banner, and event helpers. Invalid/expired is never opt-in. */
export function parseConsent(raw: string | undefined | null, now = Date.now()): ConsentDecision | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as ConsentDecision;
    const updated = Date.parse(value.updatedAt), expiry = Date.parse(value.expiresAt);
    if (value.version !== CONSENT_VERSION || value.necessary !== true
      || typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean"
      || !UUID.test(value.consentId) || !UUID.test(value.decisionId)
      || !isLocale(value.language) || !["BANNER", "SETTINGS"].includes(value.source)
      || !Number.isFinite(updated) || !Number.isFinite(expiry) || updated > now + 300_000
      || expiry <= now || expiry <= updated || expiry - updated > LIFETIME + 1000) return null;
    return { ...value, pending: value.pending !== false };
  } catch { return null; }
}

let memory: ConsentDecision | null | undefined;
export function rememberConsent(value: ConsentDecision | null) { memory = value; }

export function browserConsent(): ConsentDecision | null {
  if (typeof window === "undefined") return null;
  if (memory !== undefined) return memory && Date.parse(memory.expiresAt) > Date.now() ? memory : null;
  try {
    const raw = document.cookie.split("; ").find(c => c.startsWith(`${CONSENT_COOKIE}=`))?.slice(CONSENT_COOKIE.length + 1);
    return parseConsent(raw);
  } catch { return null; }
}

export function newDecision(choices: { analytics: boolean; marketing: boolean }, source: ConsentDecision["source"], language: Locale,
  previous: ConsentDecision | null): ConsentDecision {
  const now = Date.now();
  return { version: CONSENT_VERSION, necessary: true, ...choices,
    consentId: previous?.consentId ?? consentUuid(), decisionId: consentUuid(),
    updatedAt: new Date(now).toISOString(), expiresAt: new Date(now + LIFETIME).toISOString(), source, language, pending: true };
}

function consentUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export function persistConsent(value: ConsentDecision) {
  rememberConsent(value);
  try {
    const shared = location.hostname === "buyology.online" || location.hostname.endsWith(".buyology.online");
    const secure = location.protocol === "https:" ? "; Secure" : "";
    // Remove any older host-only choice before writing the shared regional preference.
    if (shared) document.cookie = `${CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    const seconds = Math.max(0, Math.floor((Date.parse(value.expiresAt) - Date.now()) / 1000));
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${seconds}; SameSite=Lax${shared ? "; Domain=buyology.online" : ""}${secure}`;
  } catch { /* The explicit choice still applies in this tab if storage is blocked. */ }
}

export function clearOptionalStorage(analytics: boolean, marketing: boolean) {
  try {
    for (const part of document.cookie.split("; ")) {
      const name = part.split("=")[0];
      if ((analytics && /^(_ga($|_)|_gid$|_gat)/.test(name)) || (marketing && /^(_fbp$|_fbc$|_gcl_)/.test(name))) {
        const domains = ["", location.hostname, "." + location.hostname, "buyology.online", ".buyology.online"];
        for (const domain of domains) document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domain ? `; Domain=${domain}` : ""}${location.protocol === "https:" ? "; Secure" : ""}`;
      }
    }
    if (analytics) { localStorage.removeItem("buy_visitor_id"); sessionStorage.removeItem("buy_visit_session"); }
    if (marketing) { localStorage.removeItem("buyo_meta_purchases_sent"); sessionStorage.removeItem("buyo_meta_pending_purchases"); }
  } catch { /* Necessary cart, account, and payment recovery data are retained. */ }
}

export function googleConsent(analytics: boolean, marketing: boolean) {
  return { analytics_storage: analytics ? "granted" : "denied", ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied", ad_personalization: marketing ? "granted" : "denied",
    functionality_storage: "granted", security_storage: "granted" };
}

/** No network requests. External tags are separately gated by the matching React consent state. */
export const consentDefaultsScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',${JSON.stringify(googleConsent(false, false))});`;
