import { cookies } from "next/headers";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries, type Dict } from "@/lib/i18n/dictionaries";

/** Resolve the active locale from the persisted cookie (server-side). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return isLocale(store.get(LOCALE_COOKIE)?.value)
    ? (store.get(LOCALE_COOKIE)!.value as Locale)
    : defaultLocale;
}

/** The dictionary for the active locale (server-side). */
export async function getDict(): Promise<Dict> {
  return dictionaries[await getLocale()];
}
