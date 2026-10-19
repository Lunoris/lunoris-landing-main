import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ovoFont = localFont({
  src: "./fonts/Ovo-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-ovo-local",
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ovoFont.variable} ${ovoFont.className}`}>
      <head>
        <link
          rel="preload"
          href="/fonts/Ovo-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className={ovoFont.className}>
        <div className="ambient-stars" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
