import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import { LanguageProvider } from "@/i18n/LanguageContext";
import {
  LOCALE_COOKIE_NAME,
  getLocaleOption,
  normalizeLocale,
} from "@/i18n/types";
import "./globals.css";

const ovoFont = localFont({
  src: "./fonts/Ovo-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-ovo-local",
  display: "swap",
  adjustFontFallback: false,
});

const title = "Lunoris: Piece of Mind | Official Game Experience";
const description =
  "Explore five interconnected realms inside a young artist's fractured subconscious in Lunoris: Piece of Mind, an emotional 3D action-adventure for PC, PlayStation 5, and Xbox Series X|S.";

// The share image comes from opengraph-image.tsx / twitter-image.tsx.
export const metadata: Metadata = {
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLocale = normalizeLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value
  );
  const localeMeta = getLocaleOption(initialLocale);

  return (
    <html
      lang={initialLocale}
      dir={localeMeta.dir}
      className={ovoFont.variable}
    >
      <head>
        <link
          rel="preload"
          href="/fonts/Ovo-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <LanguageProvider initialLocale={initialLocale}>
          <div className="ambient-stars" aria-hidden="true" />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
