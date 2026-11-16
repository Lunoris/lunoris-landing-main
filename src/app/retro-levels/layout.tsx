import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retro Levels | Lunoris: Piece of Mind",
  description:
    "Step into John Ford's 1980s basement arcade and play memory-infused retro cabinets in Lunoris: Piece of Mind.",
  openGraph: {
    title: "Retro Levels | Lunoris: Piece of Mind",
    description:
      "Step into John Ford's 1980s basement arcade and play memory-infused retro cabinets in Lunoris: Piece of Mind.",
  },
};

export default function RetroLevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
