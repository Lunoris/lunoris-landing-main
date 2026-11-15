import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nightmare Realm | Lunoris: Piece of Mind",
  description:
    "Confront the Seven Wasteland Zones, Matchi Matchi Sanctuary, and FearClaw inside the Nightmare Realm of Lunoris.",
  openGraph: {
    title: "Nightmare Realm | Lunoris: Piece of Mind",
    description:
      "Confront the Seven Wasteland Zones, Matchi Matchi Sanctuary, and FearClaw inside the Nightmare Realm of Lunoris.",
  },
};

export default function NightmareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
