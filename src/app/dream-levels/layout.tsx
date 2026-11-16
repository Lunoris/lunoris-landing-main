import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dream Levels | Lunoris: Piece of Mind",
  description:
    "Journey through surreal 3D platforming Dream Doors — Pain, Guilt, and Breakthrough — inside Lunora's subconscious.",
  openGraph: {
    title: "Dream Levels | Lunoris: Piece of Mind",
    description:
      "Journey through surreal 3D platforming Dream Doors — Pain, Guilt, and Breakthrough — inside Lunora's subconscious.",
  },
};

export default function DreamLevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
