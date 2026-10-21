import React from "react";
import {
  ROW_ONE_CAST,
  ROW_TWO_CAST,
  type CharacterCardItem,
} from "@/data/gameData";
import { DeckledCanvasFrame } from "@/components/ui/CanvasFrames";

function CharacterMarqueeRow({
  characters,
  directionClass,
  rowKeyPrefix,
}: {
  characters: CharacterCardItem[];
  directionClass: "lunoris-row-left" | "lunoris-row-right";
  rowKeyPrefix: string;
}) {
  const tripledCast = [...characters, ...characters, ...characters];

  return (
    <div className={`lunoris-wall-row ${directionClass}`}>
      {tripledCast.map((char, idx) => (
        <div
          key={`${rowKeyPrefix}-${char.name}-${idx}`}
          className="lunoris-hero-tile"
          style={{ "--tile-accent": char.accent } as React.CSSProperties}
        >
          <img
            src={char.image}
            alt={char.name}
            className="lunoris-hero-tile-img"
            loading="lazy"
          />
          <div className="lunoris-canvas-weave" aria-hidden="true" />
          <div className="lunoris-hero-tile-gradient" />
          <DeckledCanvasFrame />
          <div className="lunoris-hero-tile-info">
            <h3 className="lunoris-hero-tile-name">{char.name}</h3>
            <p className="lunoris-hero-tile-lore">{char.lore}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CharactersWallSection() {
  return (
    <section id="characters" className="lunoris-heroes-section">
      <div className="lunoris-wide-wrap lunoris-mural-center">
        <div className="lunoris-heading-stack" data-reveal="up">
          <span className="lunoris-title-minor">Echoes of Wahm Lane</span>
          <h2 className="lunoris-title-major">Who Will Walk Beside You?</h2>
          <div className="lunoris-center-bar" />
          <p className="lunoris-mural-body">
            Meet the characters, childhood memories, and guardians who walk
            beside Lunora across her journey.
          </p>
        </div>
      </div>

      <div className="lunoris-hero-wall" data-reveal="scale">
        <CharacterMarqueeRow
          characters={ROW_ONE_CAST}
          directionClass="lunoris-row-left"
          rowKeyPrefix="r1"
        />
        <CharacterMarqueeRow
          characters={ROW_TWO_CAST}
          directionClass="lunoris-row-right"
          rowKeyPrefix="r2"
        />
      </div>
    </section>
  );
}
