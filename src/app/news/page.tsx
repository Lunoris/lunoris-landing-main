import React from "react";
import type { Metadata } from "next";
import { getCachedAllNews } from "@/lib/newsStore";
import { NewsArchiveClient } from "@/components/sections/NewsArchiveClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Chronicles & News | Lunoris: Piece of Mind",
  description:
    "Latest development updates, world lore dispatches, and gameplay teasers for Lunoris: Piece of Mind.",
  openGraph: {
    title: "Chronicles & News | Lunoris: Piece of Mind",
    description:
      "Latest development updates, world lore dispatches, and gameplay teasers for Lunoris: Piece of Mind.",
  },
};

export default async function LunorisNewsArchivePage() {
  const initialArticles = await getCachedAllNews();
  return <NewsArchiveClient initialArticles={initialArticles} />;
}
