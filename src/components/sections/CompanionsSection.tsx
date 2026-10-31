"use client";

import React, { useEffect, useState } from "react";
import { COMPANIONS_SHOWCASE } from "@/data/gameData";
import { SquareCompanionFrame } from "@/components/ui/CanvasFrames";
import { useLanguage } from "@/i18n/LanguageContext";

export function CompanionsSection() {
  const { t } = useLanguage();
  const [activeCompanion, setActiveCompanion] = useState(0);
  const [companionPaused, setCompanionPaused] = useState(false);

  // Auto-cycle the 4 companion pillars every 3.8s unless hovered
  useEffect(() => {
    if (companionPaused) return;
    const timer = window.setInterval(() => {
      setActiveCompanion((prev) => (prev + 1) % COMPANIONS_SHOWCASE.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [companionPaused]);

  return (
    <section id="companions" className="lunoris-companions-section">
      <div className="lunoris-wide-wrap">
        <div className="lunoris-heading-stack" data-reveal="up">
          <span className="lunoris-title-minor">{t.companions.minor}</span>
          <h2 className="lunoris-title-major">{t.companions.major}</h2>
          <div className="lunoris-center-bar" />
        </div>

        <div
          className="lunoris-pillars-stage"
          data-reveal="up"
          onMouseEnter={() => setCompanionPaused(true)}
          onMouseLeave={() => setCompanionPaused(false)}
        >
          {COMPANIONS_SHOWCASE.map((pet, idx) => {
            const isExpanded = activeCompanion === idx;
            const petKey = pet.name as
              | "Fareeda"
              | "Kurtam"
              | "Freddy"
              | "Centric";
            const trPet = t.companions.items[petKey];
            const displayName = trPet?.name ?? pet.name;
            const displaySpecies = trPet?.species ?? pet.species;
            const displayTitle = trPet?.title ?? pet.title;
            const displayDesc = trPet?.desc ?? pet.desc;

            return (
              <article
                key={pet.name}
                className={`lunoris-pillar ${isExpanded ? "is-active" : ""}`}
                onMouseEnter={() => setActiveCompanion(idx)}
                onClick={() => setActiveCompanion(idx)}
              >
                <img
                  src={pet.image}
                  alt={displayName}
                  className="lunoris-pillar-img"
                />
                <div className="lunoris-canvas-weave" aria-hidden="true" />
                <div className="lunoris-pillar-wash" />
                <div className="lunoris-pillar-shade" />
                <SquareCompanionFrame />

                <div className="lunoris-pillar-content">
                  <span className="lunoris-pillar-sub">
                    {displaySpecies} · {displayTitle}
                  </span>
                  <h3 className="lunoris-pillar-name">{displayName}</h3>
                  <p className="lunoris-pillar-desc">{displayDesc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
