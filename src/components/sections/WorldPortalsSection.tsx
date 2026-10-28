import React from "react";
import {
  WORLD_LOCATIONS_SHOWCASE,
  type WorldLocationItem,
} from "@/data/gameData";
import { ArchedCanvasFrame } from "@/components/ui/CanvasFrames";
import { ResilientVideo } from "@/components/ui/ResilientVideo";

function WorldPortalCard({
  location,
  index,
}: {
  location: WorldLocationItem;
  index: number;
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
      {location.isVideo && location.videoSrc ? (
        <ResilientVideo
          className="lunoris-tile-bg"
          src={location.videoSrc}
          poster={location.image}
          preload="metadata"
        />
      ) : (
        <img
          src={location.image}
          alt={location.title}
          className="lunoris-tile-bg"
        />
      )}
      <div className="lunoris-canvas-weave" aria-hidden="true" />
      <div className="lunoris-tile-shade" />
      <ArchedCanvasFrame
        strokeColor={location.strokeColor}
        accentColor={location.accentColor}
      />
      <div className="lunoris-tile-caption">
        <h3>{location.title}</h3>
        <div className="lunoris-tile-divider" aria-hidden="true">
          <span className="lunoris-tile-divider-gem" />
        </div>
        <p>{location.desc}</p>
      </div>
    </article>
  );
}

export function WorldPortalsSection() {
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
          <span className="lunoris-title-minor">Awaken the Inner Sanctuary</span>
          <h2 className="lunoris-title-major">Break the Endless Dream Loop</h2>
          <div className="lunoris-center-bar" />
          <p className="lunoris-mural-body">
            From the lavender-lit sanctuary of Lunora&apos;s House, step through
            stroked Dream Doors, swirling Van Gogh canvases, the sky-cyan Well
            of Elar, and deep-indigo Nightmare rifts—each realm bound by its own
            living portal spectrum.
          </p>
        </div>

        <div className="lunoris-3tile-row lunoris-locations-grid">
          {WORLD_LOCATIONS_SHOWCASE.map((loc, idx) => (
            <WorldPortalCard key={loc.id} location={loc} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
