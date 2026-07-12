export const locales = ["en", "az", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that persists the chosen language (read server-side each request). */
export const LOCALE_COOKIE = "buyology-lang";

export const localeMeta: Record<
  Locale,
  { label: string; native: string; short: string; dir: "ltr" | "rtl" }
> = {
  en: { label: "English", native: "English", short: "EN", dir: "ltr" },
  az: { label: "Azerbaijani", native: "Azərbaycan", short: "AZ", dir: "ltr" },
  ar: { label: "Arabic", native: "العربية", short: "AR", dir: "rtl" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return localeMeta[locale].dir;
}
