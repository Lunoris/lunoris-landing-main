"use client";

import React from "react";
import { useLunorisScrollEffects } from "@/hooks/useLunorisScrollEffects";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { HeroSection } from "@/components/sections/HeroSection";
import { LatestNewsSection } from "@/components/sections/LatestNewsSection";
import { WorldPortalsSection } from "@/components/sections/WorldPortalsSection";
import { CompanionsSection } from "@/components/sections/CompanionsSection";
import { CharactersWallSection } from "@/components/sections/CharactersWallSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { FooterBar } from "@/components/sections/FooterBar";

export default function LunorisLandingPage() {
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
      <HeaderBar
        navBtnSlotRef={navBtnSlotRef}
        steamBtnRef={steamBtnRef}
        enableFlyingCta
      />

      <main id="top">
        <HeroSection heroRef={heroRef} />
        <LatestNewsSection />
        <WorldPortalsSection />
        <CompanionsSection />
        <CharactersWallSection />
        <RoadmapSection
          roadmapTimelineRef={roadmapTimelineRef}
          roadmapStep={roadmapStep}
        />
        <FinalCtaSection finalCtaSlotRef={finalCtaSlotRef} />
      </main>

      <FooterBar />
    </div>
  );
}
