"use client";

import React from "react";
import dynamic from "next/dynamic";

const LivingPaintingBackground = dynamic(
  () =>
    import("@/components/ui/LivingPaintingBackground").then(
      (mod) => mod.LivingPaintingBackground
    ),
  { ssr: false }
);

const DreamParticles = dynamic(
  () =>
    import("@/components/ui/DreamParticles").then((mod) => mod.DreamParticles),
  { ssr: false }
);

const DreamDissolveTransition = dynamic(
  () =>
    import("@/components/ui/DreamDissolveTransition").then(
      (mod) => mod.DreamDissolveTransition
    ),
  { ssr: false }
);

const NightmareRiftTransition = dynamic(
  () =>
    import("@/components/ui/NightmareRiftTransition").then(
      (mod) => mod.NightmareRiftTransition
    ),
  { ssr: false }
);

const RetroArcadeTransition = dynamic(
  () =>
    import("@/components/ui/RetroArcadeTransition").then(
      (mod) => mod.RetroArcadeTransition
    ),
  { ssr: false }
);

export function GlobalStageOverlays() {
  return (
    <>
      <LivingPaintingBackground />
      <DreamParticles />
      <DreamDissolveTransition />
      <NightmareRiftTransition />
      <RetroArcadeTransition />
    </>
  );
}
