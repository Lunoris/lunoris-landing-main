"use client";

import React from "react";
import {
  ROW_ONE_CAST,
  ROW_TWO_CAST,
  type CharacterCardItem,
} from "@/data/gameData";
import { DeckledCanvasFrame } from "@/components/ui/CanvasFrames";
import { useLanguage } from "@/i18n/LanguageContext";
import type { SiteTranslations } from "@/i18n/types";

function CharacterMarqueeRow({
  characters,
  directionClass,
  rowKeyPrefix,
  t,
}: {
  characters: CharacterCardItem[];
  directionClass: "lunoris-row-left" | "lunoris-row-right";
  rowKeyPrefix: string;
  t: SiteTranslations;
}) {
  const tripledCast = [...characters, ...characters, ...characters];

  return (
    <div className={`lunoris-wall-row ${directionClass}`}>
      {tripledCast.map((char, idx) => {
        const charKey = char.name as keyof SiteTranslations["characters"]["items"];
        const trChar = t.characters.items[charKey];
        const displayName = trChar?.name ?? char.name;
        const displayLore = trChar?.lore ?? char.lore;

        return (
          <div
            key={`${rowKeyPrefix}-${char.name}-${idx}`}
            className="lunoris-hero-tile"
            style={{ "--tile-accent": char.accent } as React.CSSProperties}
          >
            <img
              src={char.image}
              alt={displayName}
              className="lunoris-hero-tile-img"
              loading="lazy"
            />
            <div className="lunoris-canvas-weave" aria-hidden="true" />
            <div className="lunoris-hero-tile-gradient" />
            <DeckledCanvasFrame />
            <div className="lunoris-hero-tile-info">
              <h3 className="lunoris-hero-tile-name">{displayName}</h3>
              <p className="lunoris-hero-tile-lore">{displayLore}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CharactersWallSection() {
  const { t } = useLanguage();

  return (
    <section id="characters" className="lunoris-heroes-section">
      <div className="lunoris-wide-wrap lunoris-mural-center">
        <div className="lunoris-heading-stack" data-reveal="up">
          <span className="lunoris-title-minor">{t.characters.minor}</span>
          <h2 className="lunoris-title-major">{t.characters.major}</h2>
          <div className="lunoris-center-bar" />
          <p className="lunoris-mural-body">{t.characters.body}</p>
        </div>
      </div>

      <div className="lunoris-hero-wall" data-reveal="scale">
        <CharacterMarqueeRow
          characters={ROW_ONE_CAST}
          directionClass="lunoris-row-left"
          rowKeyPrefix="r1"
          t={t}
        />
        <CharacterMarqueeRow
          characters={ROW_TWO_CAST}
          directionClass="lunoris-row-right"
          rowKeyPrefix="r2"
          t={t}
        />
      </div>
    </section>
  );
}
