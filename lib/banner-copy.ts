import type { Locale } from "@/lib/i18n/config";

/**
 * Approved copy for the six banners that were uploaded as artwork with no words on them.
 *
 * <p>Banner text belongs in the dashboard, and normally the storefront shows only what an admin
 * wrote there — inventing a headline over someone's artwork is how a shop ends up promising things
 * it does not sell. This file is a deliberate exception with a short life: the copy below was
 * written per picture and approved, and the six live banners have been empty in all three languages
 * since they were uploaded, so the hero has been showing artwork with no message and no way in.
 *
 * <p>Keyed by banner ID, and it yields the moment anyone touches that banner in the dashboard: if a
 * banner has ANY text, button label or button URL of its own, the whole entry below is ignored for
 * it. So entering the copy in Dashboard → Banners overrides this without a deploy, and once all six
 * are filled in, delete this file and the call in lib/banners.ts.
 *
 * <p>A banner ID that no longer exists is simply never matched — replacing the artwork creates a
 * new banner, which gets no copy from here, which is the safe direction to fail in.
 */

type Copy = { text: string; buttonLabel: string };

type Entry = {
  /** Where the button goes. A path, so it works on either domain. */
  buttonUrl: string;
  /** What the picture shows — the copy was written for it, so a re-upload must not inherit it. */
  artwork: string;
  locales: Record<Locale, Copy>;
};

const BANNER_COPY: Record<string, Entry> = {
  // Hero 1 — a man in bed with a laptop, headphones floating out of the screen.
  "69be28ed-d12a-4bc7-bd24-e25b352beda6": {
    buttonUrl: "/products?category=laptop",
    artwork: "man in bed with a laptop",
    locales: {
      en: { text: "Renewed laptops, tested before they ship", buttonLabel: "Shop laptops" },
      az: {
        text: "Yenilənmiş noutbuklar — göndərilməzdən əvvəl yoxlanılır",
        buttonLabel: "Noutbuklara bax",
      },
      ar: { text: "لابتوبات مُجدَّدة، مفحوصة قبل الشحن", buttonLabel: "تسوّق اللابتوبات" },
    },
  },
  // Hero 2 — a woman reading a tablet. We do not sell tablets, so this one sells the payment plan.
  "6fae3928-9726-4562-ad7c-a54bbebe9a7d": {
    buttonUrl: "/products",
    artwork: "woman holding a tablet",
    locales: {
      en: { text: "Pay in 4 with Tabby or Tamara", buttonLabel: "Start shopping" },
      az: { text: "Tabby və ya Tamara ilə 4 ödənişə böl", buttonLabel: "Alış-verişə başla" },
      ar: { text: "ادفع على 4 دفعات مع تابي أو تمارا", buttonLabel: "ابدأ التسوّق" },
    },
  },
  // Hero 3 — a child in a VR headset. No VR in the catalogue either, so this one carries the
  // trust message instead.
  "a1502a43-38e1-4a7e-872d-ea1fbc7a9e0e": {
    buttonUrl: "/about",
    artwork: "child wearing a VR headset",
    locales: {
      en: { text: "Renewed, not second-hand", buttonLabel: "How it works" },
      az: { text: "Yenilənmiş, işlənmiş deyil", buttonLabel: "Necə işləyir" },
      ar: { text: "مُجدَّد، وليس مستعملاً", buttonLabel: "كيف يعمل" },
    },
  },
  // Hero 4 — a man wearing headphones. Deliberately does NOT say "renewed": the audio is new.
  "0dd57019-8cd4-4811-87f4-3e2bc02b8ba8": {
    buttonUrl: "/products?category=audio",
    artwork: "man wearing headphones",
    locales: {
      en: { text: "Earbuds, speakers and headphones", buttonLabel: "Shop audio" },
      az: { text: "Qulaqcıqlar, dinamiklər və qulaqlıqlar", buttonLabel: "Audio məhsullara bax" },
      ar: { text: "سمّاعات أذن ومكبّرات صوت وسمّاعات رأس", buttonLabel: "تسوّق الصوتيات" },
    },
  },
  // Tile 1 — a girl holding a phone. Tiles render the text and link the whole image; the label is
  // stored for the dashboard's sake but the tile uses the site's own "Shop now".
  "b5ba9801-7ebe-45d6-a3ce-dfe602c59df2": {
    buttonUrl: "/products?category=mobile-accessories",
    artwork: "girl holding a phone",
    locales: {
      en: { text: "Accessories that keep up with you", buttonLabel: "Shop accessories" },
      az: { text: "Səninlə ayaqlaşan aksesuarlar", buttonLabel: "Aksesuarlara bax" },
      ar: { text: "إكسسوارات تواكب إيقاعك", buttonLabel: "تسوّق الإكسسوارات" },
    },
  },
  // Tile 2 — three laptops on a desk.
  "5382dd04-81c2-4d00-9687-6b1dcee65e99": {
    buttonUrl: "/products?category=laptop",
    artwork: "three laptops on a desk",
    locales: {
      en: { text: "MacBook, ThinkPad, Latitude — renewed", buttonLabel: "See all laptops" },
      az: { text: "MacBook, ThinkPad, Latitude — yenilənmiş", buttonLabel: "Bütün noutbuklara bax" },
      ar: { text: "MacBook، ThinkPad، Latitude — مُجدَّدة", buttonLabel: "شاهد كل اللابتوبات" },
    },
  },
};

/** The approved copy for a banner in this language, or null if there is none for that ID. */
export function fallbackBannerCopy(
  id: string,
  locale: Locale,
): { text: string; buttonLabel: string; buttonUrl: string } | null {
  const entry = BANNER_COPY[id];
  if (!entry) return null;
  const copy = entry.locales[locale] ?? entry.locales.en;
  return { ...copy, buttonUrl: entry.buttonUrl };
}
