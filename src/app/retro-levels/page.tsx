"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { NavLinkItem } from "@/data/gameData";
import { MYSTERY_CABINETS, RETRO_LEVELS } from "@/data/retroLevels";
import { MagneticLetters } from "@/components/ui/MagneticLetters";
import { observeInView } from "@/components/ui/inViewObserver";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";
import { RetroCabinet } from "@/components/retro/RetroCabinet";
import { RetroLevelPanel } from "@/components/retro/RetroLevelPanel";
import { useLanguage } from "@/i18n/LanguageContext";
import { getTranslations, type RetroLevelText } from "@/i18n";

// The 1967 Impala easter-egg cabinet (~1.3k lines incl. the game loop) only matters
// once someone finds the corner trigger, so keep it out of the page's initial JS.
const ImpalaArcadeCabinet = dynamic(
  () =>
    import("@/components/ui/ImpalaArcadeCabinet").then(
      (mod) => mod.ImpalaArcadeCabinet
    ),
  { ssr: false }
);

const PLAYABLE_LEVELS = RETRO_LEVELS.filter((level) => !level.underRepair);
const EN_LEVEL_TEXT = getTranslations("en").portalPages.retro.levels;
const EMPTY_TEXT: RetroLevelText = { roleSuffix: "", overview: "", challenge: "", chapters: [] };
const PANEL_ID = "retro-arcade-panel";
const tabIdFor = (levelId: string) => `retro-cabinet-${levelId}`;
const cabinetNumber = (index: number) => String(index + 1).padStart(2, "0");

/** Level id from the URL hash, if it names a playable cabinet. */
function levelFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  return PLAYABLE_LEVELS.some((level) => level.id === id) ? id : null;
}

export default function RetroLevelsPage() {
  const { t } = useLanguage();
  const text = t.portalPages.retro;
  const [selectedId, setSelectedId] = useState<string>(PLAYABLE_LEVELS[0]?.id ?? "");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hallRef = useRef<HTMLElement | null>(null);

  // Hash deep link (#car-level): read on mount and on back/forward.
  useEffect(() => {
    const sync = () => {
      const fromHash = levelFromHash();
      if (fromHash) setSelectedId(fromHash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Marquee flicker / screen static only animate while the row is on screen.
  useEffect(() => {
    const hall = hallRef.current;
    if (!hall) return;
    return observeInView(hall);
  }, []);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    // replaceState: no history entry per click, and no jump to an element with that id.
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  const onTabKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, playableIndex: number) => {
      const last = PLAYABLE_LEVELS.length - 1;
      if (last <= 0) return;
      let next = -1;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = playableIndex === last ? 0 : playableIndex + 1;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = playableIndex === 0 ? last : playableIndex - 1;
      } else if (event.key === "Home") {
        next = 0;
      } else if (event.key === "End") {
        next = last;
      }
      if (next < 0) return;
      event.preventDefault();
      select(PLAYABLE_LEVELS[next].id);
      tabRefs.current[next]?.focus();
    },
    [select]
  );

  const selectedPlayableIndex = Math.max(
    0,
    PLAYABLE_LEVELS.findIndex((level) => level.id === selectedId)
  );
  const selected = PLAYABLE_LEVELS[selectedPlayableIndex];
  const selectedCabinetIndex = selected
    ? RETRO_LEVELS.findIndex((level) => level.id === selected.id)
    : 0;
  // Per-level fallback: a level without a translation yet shows its English text.
  const selectedText = selected
    ? text.levels[selected.id] ?? EN_LEVEL_TEXT[selected.id] ?? EMPTY_TEXT
    : EMPTY_TEXT;

  const pageNav: NavLinkItem[] = [{ href: "/#world", label: t.portalPages.navWorld }];

  return (
    <div className="lunoris-page dream-levels-page retro-games-page retro-arcade-page">
      <div
        className="dream-levels-page-backdrop retro-games-page-backdrop retro-arcade-backdrop"
        aria-hidden="true"
      />
      <HeaderBar logoHref="/" navLinks={pageNav} enableFlyingCta={false} retroCrt />

      <main className="retro-arcade-main">
        <header className="retro-arcade-intro">
          <span className="retro-arcade-kicker">
            <MagneticLetters text={text.introMinor} glowColor="rgba(251, 191, 36, 0.88)" intensity={0.88} />
          </span>
          <h1 className="retro-arcade-title">
            <MagneticLetters text="RETRO LEVELS" glowColor="rgba(251, 191, 36, 0.96)" intensity={1.08} />
          </h1>
          <p className="retro-arcade-subtitle">{text.introSubtitle}</p>
        </header>

        <section ref={hallRef} className="retro-arcade-hall">
          <div className="retro-arcade-lamps" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="retro-arcade-row-scroller">
            <div className="retro-arcade-row" role="tablist" aria-label={text.ui.rowLabel}>
              {RETRO_LEVELS.map((level, index) => {
                const playableIdx = PLAYABLE_LEVELS.findIndex((l) => l.id === level.id);
                return (
                  <RetroCabinet
                    key={level.id}
                    ref={(el) => {
                      if (playableIdx >= 0) {
                        tabRefs.current[playableIdx] = el;
                      }
                    }}
                    number={cabinetNumber(index)}
                    marquee={level.marquee}
                    poster={level.poster}
                    accentColor={level.accentColor}
                    glowColor={level.glowColor}
                    selected={!level.underRepair && level.id === selected?.id}
                    underRepair={level.underRepair}
                    tapeVariant={1}
                    mysteryHint={text.ui.mysteryHint}
                    nowPlayingLabel={text.ui.nowPlaying}
                    tabId={tabIdFor(level.id)}
                    panelId={PANEL_ID}
                    onSelect={() => {
                      if (!level.underRepair) select(level.id);
                    }}
                    onKeyDown={(event) => {
                      if (playableIdx >= 0) onTabKeyDown(event, playableIdx);
                    }}
                  />
                );
              })}
              {Array.from({ length: MYSTERY_CABINETS }, (_, i) => (
                <RetroCabinet
                  key={`mystery-${i}`}
                  number="??"
                  marquee="???"
                  mystery
                  tapeVariant={(i === 0 ? 2 : 3) as 2 | 3}
                  mysteryHint={text.ui.mysteryHint}
                />
              ))}
            </div>
          </div>
          <p className="retro-arcade-hint">{text.ui.selectHint}</p>
          <p className="retro-arcade-coming">
            <span>{t.portalPages.retroComingSoon.kicker}</span>
            <span aria-hidden="true">·</span>
            <span>{t.portalPages.retroComingSoon.title}</span>
          </p>
        </section>

        {selected ? (
          <RetroLevelPanel
            level={selected}
            text={selectedText}
            number={cabinetNumber(selectedCabinetIndex)}
            cabinetLabel={text.ui.cabinetLabel}
            challengeLabel={text.ui.challengeLabel}
            panelId={PANEL_ID}
            tabId={tabIdFor(selected.id)}
          />
        ) : null}
      </main>

      <ImpalaArcadeCabinet />
      <FooterBar retroCrt />
    </div>
  );
}
