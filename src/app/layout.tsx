import type { Metadata } from "next";
import localFont from "next/font/local";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { GlobalStageOverlays } from "@/components/ui/GlobalStageOverlays";
import { RouteReadySignal } from "@/components/ui/routeReady";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "@/i18n/types";
import "./globals.css";

const ovoFont = localFont({
  src: "./fonts/Ovo-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-ovo-local",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
});

const siteUrl = (
  process.env.LUNORIS_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  // Vercel's own production domain (follows a custom domain once one is added), else the live alias.
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  "https://lunoris-landing-main.vercel.app"
).replace(/\/+$/, "");

const title = "Lunoris: Piece of Mind | Official Game Experience";
const description =
  "Explore five interconnected realms inside a young artist's fractured subconscious in Lunoris: Piece of Mind, an emotional 3D action-adventure for PC, PlayStation 5, and Xbox Series X|S.";

// Synchronously aligns <html lang> and <html dir> before first paint without forcing dynamic SSR cookies()
const LOCALE_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  LOCALE_COOKIE_NAME
)};var m=document.cookie.match(new RegExp("(?:^|;\\\\s*)"+k+"=([^;]+)"));var v=m?decodeURIComponent(m[1]):localStorage.getItem(k);var ok={en:1,ru:1,ar:1,de:1,fr:1,es:1,zh:1,ja:1};var l=v&&ok[v]?v:"en";var d=document.documentElement;d.lang=l;d.dir=l==="ar"?"rtl":"ltr";}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: "/assets/logo-square.png",
  },
  openGraph: {
    type: "website",
    siteName: "Lunoris: Piece of Mind",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir="ltr"
      data-scroll-behavior="smooth"
      className={ovoFont.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_BOOT_SCRIPT }} />
      </head>
      <body>
        <LanguageProvider>
          <GlobalStageOverlays />
          <RouteReadySignal />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
