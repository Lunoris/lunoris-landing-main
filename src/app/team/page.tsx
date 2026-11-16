import React from "react";
import type { Metadata } from "next";
import { getResolvedSiteTeamData } from "@/lib/teamStore";
import { TeamPageClient } from "@/components/sections/TeamPageClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Studio & Team | Lunoris: Piece of Mind",
  description:
    "Meet the artists, engineers, designers, and writers crafting the subconscious worlds of Lunoris: Piece of Mind.",
  openGraph: {
    title: "The Studio & Team | Lunoris: Piece of Mind",
    description:
      "Meet the artists, engineers, designers, and writers crafting the subconscious worlds of Lunoris: Piece of Mind.",
  },
};

export default async function LunorisTeamPage() {
  const resolved = await getResolvedSiteTeamData({ lang: "en" });

  return (
    <TeamPageClient
      initialLeaders={resolved.leaders}
      initialMembers={resolved.rosterMembers}
      initialDepartments={resolved.rosterDepartments}
    />
  );
}
