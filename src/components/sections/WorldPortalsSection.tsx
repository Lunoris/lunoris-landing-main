"use client";

import React from "react";
import {
  WORLD_LOCATIONS_SHOWCASE,
  type WorldLocationItem,
} from "@/data/gameData";
import { ArchedCanvasFrame } from "@/components/ui/CanvasFrames";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import { useLanguage } from "@/i18n/LanguageContext";

function WorldPortalCard({
  location,
  index,
  title,
  desc,
}: {
  location: WorldLocationItem;
  index: number;
  title: string;
  desc: string;
}) {
  const positionClass =
    index % 3 === 1
      ? "canvas-portal-center"
      : index % 3 === 0
        ? "canvas-portal-left"
        : "canvas-portal-right";

  return (
    <article
      className={`lunoris-media-tile ${positionClass}`}
      data-reveal="up"
      style={
        {
          "--stagger": index % 3,
          "--portal-accent": location.accentColor,
          "--portal-glow": location.glowColor,
          "--portal-glow-strong": location.glowStrong,
        } as React.CSSProperties
      }
    >
      <div className="lunoris-tile-media-clip">
        {location.isVideo && location.videoSrc ? (
          <ResilientVideo
            className="lunoris-tile-bg"
            src={location.videoSrc}
            poster={location.image}
            preload="metadata"
          />
        ) : (
          <img src={location.image} alt={title} className="lunoris-tile-bg" />
        )}
        <div className="lunoris-canvas-weave" aria-hidden="true" />
        <div className="lunoris-tile-shade" />
      </div>
      <ArchedCanvasFrame
        strokeColor={location.strokeColor}
        accentColor={location.accentColor}
      />
      <div className="lunoris-tile-caption">
        <h3>{title}</h3>
        <div className="lunoris-tile-divider" aria-hidden="true">
          <span className="lunoris-tile-divider-gem" />
        </div>
        <p>{desc}</p>
      </div>
    </article>
  );
}

export function WorldPortalsSection() {
  const { t } = useLanguage();

  return (
    <section id="world" className="lunoris-mural-section">
      <div
        className="lunoris-mural-bg"
        style={{ backgroundImage: "url('/assets/elar-joy.jpg')" }}
        aria-hidden="true"
      />
      <div className="lunoris-mural-fade-top" aria-hidden="true" />
      <div className="lunoris-mural-fade-bottom" aria-hidden="true" />

      <div className="lunoris-wide-wrap lunoris-mural-center">
        <div className="lunoris-heading-stack" data-reveal="up">
          <span className="lunoris-title-minor">{t.world.minor}</span>
          <h2 className="lunoris-title-major">{t.world.major}</h2>
          <div className="lunoris-center-bar" />
          <p className="lunoris-mural-body">{t.world.body}</p>
        </div>

        <div className="lunoris-3tile-row lunoris-locations-grid">
          {WORLD_LOCATIONS_SHOWCASE.map((loc, idx) => {
            const locKey = loc.id as "dream-levels" | "retro-games" | "nightmare";
            const localizedLoc = t.world.locations[locKey];
            return (
              <WorldPortalCard
                key={loc.id}
                location={loc}
                index={idx}
                title={localizedLoc?.title ?? loc.title}
                desc={localizedLoc?.desc ?? loc.desc}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
