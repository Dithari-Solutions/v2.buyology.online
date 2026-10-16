import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";
import { jsonLdScript, siteJsonLd } from "@/lib/structured-data";
import { dirFor } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { FlyProvider } from "@/components/fx/FlyProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LazyChatWidget } from "@/components/chat/LazyChatWidget";
import { GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManager";
import { CONSENT_COOKIE, consentDefaultsScript, parseConsent } from "@/lib/consent";
import { CookieConsentProvider } from "@/components/privacy/CookieConsentProvider";
import { CookieBanner } from "@/components/privacy/CookieBanner";
import { ConsentTracking } from "@/components/privacy/ConsentTracking";
import { ConsentPromotions } from "@/components/privacy/ConsentPromotions";
import { Footer } from "@/components/footer/Footer";
import { HideOnAuth } from "@/components/layout/HideOnAuth";

// Raleway is the site typeface, carrying both body and headings. This
// supersedes the Brand Identity Guidelines (Biennale for display, Manrope for
// body) — changed on request.
const raleway = localFont({
  src: "../public/fonts/raleway-latin-variable.woff2",
  variable: "--font-raleway",
  weight: "100 900",
  adjustFontFallback: "Arial",
  display: "swap",
});

const geistMono = localFont({
  src: "../public/fonts/geistmono-latin-variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: false,
  adjustFontFallback: false,
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  category: "shopping",
  verification: {
    google: "ZpXgRVAQRGLqC5BbwNwnoZBiafiJaxBgDCqj39SG760",
  },
  // Served straight from /public. The app/ file conventions (favicon.ico,
  // icon.png) were removed so this is the single source for the tab icon —
  // keeping both would emit competing <link rel="icon"> tags. The
  // apple-touch-icon still comes from app/apple-icon.tsx.
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "445x445" }],
    shortcut: [{ url: "/favicon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: "en_US",
    // og:image is supplied automatically by app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    creator: "@buyology",
    site: "@buyology",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  referrer: "origin-when-cross-origin",
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.colors.lightBg },
    { media: "(prefers-color-scheme: dark)", color: site.colors.darkBg },
  ],
};

/**
 * Applies the persisted theme before first paint to avoid a flash. Reads
 * localStorage, else falls back to the OS preference. Kept tiny and inlined.
 */
const themeScript = `(function(){try{var s=localStorage.getItem('buyology-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const initialConsent = parseConsent((await cookies()).get(CONSENT_COOKIE)?.value);

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      suppressHydrationWarning
      className={`${raleway.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <Script id="google-consent-default" strategy="beforeInteractive">{consentDefaultsScript}</Script>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {initialConsent?.analytics && initialConsent.marketing && <GoogleTagManagerNoScript />}
        <LanguageProvider locale={locale} dict={dictionaries[locale]}>
          <CookieConsentProvider initialConsent={initialConsent}>
          <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <FlyProvider>
                {children}
                <HideOnAuth>
                  <Footer />
                  <LazyChatWidget />
                </HideOnAuth>
                <ConsentPromotions />
                <CartDrawer />
                {/* Analytics tags belong on every page, sign-up included. */}
                <ConsentTracking />
                <CookieBanner />
              </FlyProvider>
            </WishlistProvider>
          </CartProvider>
          </AuthProvider>
          </CookieConsentProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
