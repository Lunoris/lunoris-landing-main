"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { NavLinkItem } from "@/data/gameData";
import {
  getRetroGamesPageCopy,
  type RetroGameShowcaseItem,
} from "@/data/retroGamesData";
import { OrnamentDivider, WideDeckledCanvasFrame } from "@/components/ui/CanvasFrames";
import { MagneticLetters } from "@/components/ui/MagneticLetters";
import { ImpalaArcadeCabinet } from "@/components/ui/ImpalaArcadeCabinet";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import { triggerRetroTransition } from "@/components/ui/RetroArcadeTransition";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";
import { useLanguage } from "@/i18n/LanguageContext";

function RetroGameDetailBlock({
  game,
}: {
  game: RetroGameShowcaseItem;
}) {
  const setHoverAnimationSpeed = (card: HTMLElement, isHovering: boolean) => {
    card.getAnimations().forEach((animation) => {
      const name = (animation as CSSAnimation).animationName;
      if (name === "retroFramePulse") {
        animation.playbackRate = isHovering ? 4.6 / 2.2 : 1;
      }
    });
    card.querySelectorAll(".retro-energy-circuit-path").forEach((path) => {
      path.getAnimations().forEach((animation) => {
        if ((animation as CSSAnimation).animationName === "retroEnergyOrbit") {
          animation.playbackRate = isHovering ? 7 / 3 : 1;
        }
      });
    });
  };

  return (
    <article
      id={game.id}
      className="dream-level-showcase-card retro-game-showcase-card"
      onMouseEnter={(event) => setHoverAnimationSpeed(event.currentTarget, true)}
      onMouseLeave={(event) => setHoverAnimationSpeed(event.currentTarget, false)}
      style={
        {
          "--dl-accent": game.accentColor,
          "--dl-glow": game.glowColor,
        } as React.CSSProperties
      }
    >
      <div className="lunoris-canvas-weave" aria-hidden="true" />
      <WideDeckledCanvasFrame />

      <div className="dream-level-showcase-header retro-cabinet-header">
        <div className="dream-level-title-row">
          <h3 className="dream-level-showcase-title">
            <MagneticLetters
              text={game.title}
              glowColor={game.glowColor}
              intensity={1.08}
            />
          </h3>
          <p className="dream-level-showcase-subtitle">
            <MagneticLetters
              text={game.roleSuffix}
              glowColor={game.glowColor}
              intensity={0.75}
            />
          </p>
        </div>
      </div>

      <div className="dream-level-showcase-body-grid retro-cabinet-body">
        {/* Left column: Clean Level Screenshot / Video + Interactive Thumbnails */}
        <div className="dream-level-media-col">
          <div className="retro-cabinet-shell">
            <div className="retro-cabinet-marquee" aria-hidden="true">
              <span>DIRIYAH</span>
              <span>’88</span>
            </div>
          <div className="dream-level-arched-preview is-retro-arched-preview retro-cabinet-screen">
            {game.videoSrc ? (
              <ResilientVideo
                className="dream-level-main-img"
                src={game.videoSrc}
                poster={game.image}
                preload="metadata"
              />
            ) : (
              <img
                src={game.image}
                alt={`${game.title} — ${game.roleSuffix}`}
                className="dream-level-main-img"
              />
            )}
          </div>

            <div className="retro-cabinet-controls" aria-hidden="true">
              <span className="retro-cabinet-joystick"><i /></span>
              <span className="retro-cabinet-button" />
              <span className="retro-cabinet-button is-secondary" />
              <span className="retro-cabinet-controls-label">INSERT MEMORY · PRESS START</span>
            </div>
          </div>

        </div>

        {/* Keep the primary pitch compact; reveal the chapter wiring on request. */}
        <div className="dream-level-info-col">
          <p className="dream-level-overview-text">
            <MagneticLetters
              text={game.overview}
              glowColor={game.glowColor}
              intensity={0.68}
            />
          </p>

          <div className="retro-play-hook">
            <span className="retro-play-hook-label">
              <MagneticLetters text="YOUR CHALLENGE" glowColor={game.glowColor} intensity={0.68} />
            </span>
            <p>
              <MagneticLetters
                text="Weave through the 1988 highway and reach the doorway before the race timer runs out."
                glowColor={game.glowColor}
                intensity={0.68}
              />
            </p>
          </div>

          <div className="dream-level-chapters-grid">
            {/* Sub-Card 1 */}
            <div
              className="dream-level-chapter-box"
            >
              <div className="dream-level-chapter-img-wrap">
                <img
                  src={game.chapter1Image}
                  alt={game.chapter1Title}
                  className="dream-level-chapter-img"
                  loading="lazy"
                />
                <div className="dream-level-chapter-img-shade" />
              </div>

              <div className="dream-level-chapter-copy">
                <h4 className="dream-level-chapter-title">
                  <MagneticLetters
                    text={game.chapter1Title}
                    glowColor={game.glowColor}
                    intensity={0.92}
                  />
                </h4>
                <ul className="dream-level-bullet-list">
                  {game.chapter1Bullets.map((b, i) => (
                    <li key={i}>
                      <MagneticLetters
                        text={b}
                        glowColor={game.glowColor}
                        intensity={0.65}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sub-Card 2 */}
            <div
              className="dream-level-chapter-box is-chapter-2"
            >
              <div className="dream-level-chapter-img-wrap">
                <img
                  src={game.chapter2Image}
                  alt={game.chapter2Title}
                  className="dream-level-chapter-img"
                  loading="lazy"
                />
                <div className="dream-level-chapter-img-shade" />
              </div>

              <div className="dream-level-chapter-copy">
                <h4 className="dream-level-chapter-title">
                  <MagneticLetters
                    text={game.chapter2Title}
                    glowColor="rgba(232, 121, 249, 0.88)"
                    intensity={0.92}
                  />
                </h4>
                <ul className="dream-level-bullet-list">
                  {game.chapter2Bullets.map((b, i) => (
                    <li key={i}>
                      <MagneticLetters
                        text={b}
                        glowColor="rgba(232, 121, 249, 0.8)"
                        intensity={0.65}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RetroGamesPage() {
  const { locale } = useLanguage();
  const router = useRouter();
  const copy = getRetroGamesPageCopy(locale);

  const handleReturnWithTransition = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerRetroTransition({
      mode: "pixel",
      onMidTransition: () => {
        router.push("/#world");
      },
    });
  };

  const pageNav: NavLinkItem[] = [{ href: "/#world", label: copy.navWorld }];

  return (
    <div className="lunoris-page dream-levels-page retro-games-page">
      <div
        className="dream-levels-page-backdrop retro-games-page-backdrop"
        aria-hidden="true"
      />
      <HeaderBar
        logoHref="/"
        navLinks={pageNav}
        enableFlyingCta={false}
        retroCrt
      />

      <main className="dream-levels-main retro-single-game-main">
        <section id="games" className="dream-levels-section retro-single-game-section">
          <div className="lunoris-wide-wrap">
            <div className="retro-single-game-intro">
              <a
                href="/#world"
                onClick={handleReturnWithTransition}
                className="dream-levels-back-pill retro-games-back-pill"
              >
                <span aria-hidden="true">←</span>
                <span>
                  <MagneticLetters
                    text={copy.backToWorld}
                    glowColor="rgba(251, 191, 36, 0.9)"
                    intensity={0.92}
                  />
                </span>
              </a>
              <OrnamentDivider />
              <span className="lunoris-title-minor">
                <MagneticLetters text="1988 DIRIYAH · AN ECHO MEMORY" glowColor="rgba(251, 191, 36, 0.88)" intensity={0.88} />
              </span>
              <h1 className="lunoris-title-major dream-levels-hero-title">
                <MagneticLetters text="THE BABY RACE" glowColor="rgba(251, 191, 36, 0.96)" intensity={1.08} />
              </h1>
              <p className="dream-levels-hero-subtitle">
                <MagneticLetters
                  text={locale === "ru"
                    ? "Садитесь за руль Chevrolet Impala 1967 года и мчитесь сквозь воспоминание, изменившее всё."
                    : "Take the wheel of a 1967 Chevrolet Impala and race through a memory that changed everything."}
                  glowColor="rgba(253, 224, 71, 0.82)"
                  intensity={0.72}
                />
              </p>
            </div>
            <div className="dream-levels-showcase-stack">
              {copy.games.filter((game) => game.id === "car-level").map((game) => (
                <RetroGameDetailBlock
                  key={game.id}
                  game={game}
                />
              ))}
            </div>
            <div className="retro-coming-soon" aria-live="polite">
              <span className="retro-coming-soon-kicker">
                <MagneticLetters
                  text={locale === "ru" ? "АРКАДА ПРОДОЛЖАЕТСЯ" : "THE ARCADE CONTINUES"}
                  glowColor="rgba(251, 191, 36, 0.88)"
                  intensity={0.88}
                />
              </span>
              <p>
                <MagneticLetters
                  text={locale === "ru" ? "СКОРО ПОЯВЯТСЯ НОВЫЕ ИГРЫ" : "MORE GAMES COMING SOON"}
                  glowColor="rgba(255, 222, 120, 0.96)"
                  intensity={1.08}
                />
              </p>
            </div>
          </div>
        </section>
      </main>

      <ImpalaArcadeCabinet />
      <FooterBar retroCrt />
    </div>
  );
}
