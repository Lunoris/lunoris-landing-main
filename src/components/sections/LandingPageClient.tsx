"use client";

import React from "react";
import type { NewsArticle } from "@/data/newsData";
import type { TeamLeader } from "@/data/teamData";
import { useLunorisScrollEffects } from "@/hooks/useLunorisScrollEffects";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { HeroSection } from "@/components/sections/HeroSection";
import { LatestNewsSection } from "@/components/sections/LatestNewsSection";
import { WorldPortalsSection } from "@/components/sections/WorldPortalsSection";
import { CompanionsSection } from "@/components/sections/CompanionsSection";
import { CharactersWallSection } from "@/components/sections/CharactersWallSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { FooterBar } from "@/components/sections/FooterBar";

// Memoize sections whose props do not depend on `roadmapStep` so scroll progress updates
// only re-render `RoadmapSection` instead of the entire landing page.
const MemoHeaderBar = React.memo(HeaderBar);
const MemoHeroSection = React.memo(HeroSection);
const MemoLatestNewsSection = React.memo(LatestNewsSection);
const MemoWorldPortalsSection = React.memo(WorldPortalsSection);
const MemoCompanionsSection = React.memo(CompanionsSection);
const MemoCharactersWallSection = React.memo(CharactersWallSection);
const MemoTeamSection = React.memo(TeamSection);
const MemoFinalCtaSection = React.memo(FinalCtaSection);
const MemoFooterBar = React.memo(FooterBar);

export function LandingPageClient({
  initialArticles,
  initialLeaders,
}: {
  initialArticles: NewsArticle[];
  initialLeaders: TeamLeader[];
}) {
  const {
    heroRef,
    roadmapTimelineRef,
    navBtnSlotRef,
    steamBtnRef,
    finalCtaSlotRef,
    roadmapStep,
  } = useLunorisScrollEffects();

  return (
    <div className="lunoris-page">
      <MemoHeaderBar
        navBtnSlotRef={navBtnSlotRef}
        steamBtnRef={steamBtnRef}
        enableFlyingCta
      />

      <main id="top">
        <MemoHeroSection heroRef={heroRef} />
        <MemoLatestNewsSection initialArticles={initialArticles} />
        <MemoWorldPortalsSection />
        <MemoCompanionsSection />
        <MemoCharactersWallSection />
        <MemoTeamSection initialLeaders={initialLeaders} />
        <RoadmapSection
          roadmapTimelineRef={roadmapTimelineRef}
          roadmapStep={roadmapStep}
        />
        <MemoFinalCtaSection finalCtaSlotRef={finalCtaSlotRef} />
      </main>

      <MemoFooterBar />
    </div>
  );
}
