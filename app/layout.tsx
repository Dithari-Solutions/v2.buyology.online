import type { Metadata, Viewport } from "next";
import { Raleway, Geist_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { jsonLdScript, siteJsonLd } from "@/lib/structured-data";
import { dirFor } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { FlyProvider } from "@/components/fx/FlyProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Footer } from "@/components/footer/Footer";
import { HideOnAuth } from "@/components/layout/HideOnAuth";
import { PasswordGate } from "@/components/gate/PasswordGate";

// Raleway is the site typeface, carrying both body and headings. This
// supersedes the Brand Identity Guidelines (Biennale for display, Manrope for
// body) — changed on request.
const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  alternates: { canonical: "/" },
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

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      suppressHydrationWarning
      className={`${raleway.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd()) }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LanguageProvider locale={locale} dict={dictionaries[locale]}>
          <CartProvider>
            <WishlistProvider>
              <FlyProvider>
                {children}
                <HideOnAuth>
                  <Footer />
                  <ChatWidget />
                </HideOnAuth>
                <CartDrawer />
              </FlyProvider>
            </WishlistProvider>
          </CartProvider>
          <PasswordGate />
        </LanguageProvider>
      </body>
    </html>
  );
}
