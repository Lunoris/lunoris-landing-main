import React from "react";
import { getCachedAllNews } from "@/lib/newsStore";
import { getResolvedSiteTeamData } from "@/lib/teamStore";
import { LandingPageClient } from "@/components/sections/LandingPageClient";

export const revalidate = 300;

export default async function LunorisLandingPage() {
  const [initialArticles, teamData] = await Promise.all([
    getCachedAllNews(),
    getResolvedSiteTeamData({ lang: "en" }),
  ]);

  return (
    <LandingPageClient
      initialArticles={initialArticles}
      initialLeaders={teamData.leaders}
    />
  );
}
