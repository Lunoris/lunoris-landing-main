"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { NavLinkItem } from "@/data/gameData";
import {
  getDreamLevelsPageCopy,
  type DreamLevelShowcaseItem,
} from "@/data/dreamLevelsData";
import {
  BrushstrokeButtonBg,
  DeckledCanvasFrame,
  OrnamentDivider,
  WideDeckledCanvasFrame,
} from "@/components/ui/CanvasFrames";
import { FloatingLetters } from "@/components/ui/FloatingLetters";
import { ScrollTextReveal } from "@/components/ui/ScrollTextReveal";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";
import { useLanguage } from "@/i18n/LanguageContext";

function DreamLevelDetailBlock({
  level,
  chapter1Badge,
  chapter2Badge,
  connectedSystemsLabel,
  inGameCapturesLabel,
}: {
  level: DreamLevelShowcaseItem;
  chapter1Badge: string;
  chapter2Badge: string;
  connectedSystemsLabel: string;
  inGameCapturesLabel: string;
}) {
  const allMedia = [
    { url: level.image, caption: `${level.title} — ${level.roleSuffix}` },
    ...level.secondaryImages,
  ];
  const [activeMediaUrl, setActiveMediaUrl] = useState<string>(allMedia[0].url);
  const [activeMediaCaption, setActiveMediaCaption] = useState<string>(
    allMedia[0].caption
  );

  const selectMedia = (url: string, caption: string) => {
    setActiveMediaUrl(url);
    setActiveMediaCaption(caption);
  };

  return (
    <article
      id={level.id}
      className="dream-level-showcase-card"
      style={
        {
          "--dl-accent": level.accentColor,
          "--dl-glow": level.glowColor,
        } as React.CSSProperties
      }
    >
      <div className="lunoris-canvas-weave" aria-hidden="true" />
      <WideDeckledCanvasFrame />

      <div className="dream-level-showcase-header">
        <div className="dream-level-showcase-badges">
          <span className="dream-level-num-pill">
            <FloatingLetters
              text={level.number}
              glowColor={level.glowColor}
              intensity={0.65}
            />
          </span>
          <span className="dream-level-realm-pill">
            <FloatingLetters
              text={level.realmBadge}
              glowColor={level.glowColor}
              intensity={0.65}
            />
          </span>
          {level.emotions.map((emo) => (
            <span key={emo} className="dream-level-emotion-tag">
              <FloatingLetters
                text={`✦ ${emo}`}
                glowColor={level.glowColor}
                intensity={0.65}
              />
            </span>
          ))}
        </div>

        <div className="dream-level-title-row">
          <h3 className="dream-level-showcase-title">
            <FloatingLetters
              text={level.title}
              glowColor={level.glowColor}
              intensity={0.95}
            />
          </h3>
          <p className="dream-level-showcase-subtitle">
            <FloatingLetters
              text={level.roleSuffix}
              glowColor={level.glowColor}
              intensity={0.72}
            />
          </p>
        </div>
      </div>

      <div className="dream-level-showcase-body-grid">
        {/* Left column: Clean Level Screenshot + Interactive Gallery */}
        <div className="dream-level-media-col">
          <div className="dream-level-arched-preview">
            <img
              src={activeMediaUrl}
              alt={activeMediaCaption}
              className="dream-level-main-img"
            />
          </div>

          {allMedia.length > 1 ? (
            <div className="dream-level-thumbs-wrap">
              <span className="dream-level-thumbs-label">
                <FloatingLetters
                  text={inGameCapturesLabel}
                  glowColor={level.glowColor}
                  intensity={0.65}
                />
              </span>
              <div className="dream-level-thumbs-row">
                {allMedia.map((m, idx) => (
                  <button
                    key={`${m.url}-${idx}`}
                    type="button"
                    onClick={() => selectMedia(m.url, m.caption)}
                    className={`dream-level-thumb-btn ${
                      m.url === activeMediaUrl ? "is-active" : ""
                    }`}
                    title={m.caption}
                  >
                    <img src={m.url} alt={m.caption} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right column: Concise 1-sentence hook + 2 Visual Chapter Cards + Mechanic Chips */}
        <div className="dream-level-info-col">
          <p className="dream-level-overview-text">
            <FloatingLetters
              text={level.overview}
              glowColor={level.glowColor}
              intensity={0.64}
            />
          </p>

          <div className="dream-level-chapters-grid">
            {/* Chapter 1 Visual Card */}
            <div
              className="dream-level-chapter-box"
              onClick={() =>
                selectMedia(
                  level.chapter1Image,
                  `${level.chapter1Title} (${level.chapter1Door})`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectMedia(
                    level.chapter1Image,
                    `${level.chapter1Title} (${level.chapter1Door})`
                  );
                }
              }}
            >
              <div className="dream-level-chapter-img-wrap">
                <img
                  src={level.chapter1Image}
                  alt={level.chapter1Title}
                  className="dream-level-chapter-img"
                  loading="lazy"
                />
                <div className="dream-level-chapter-img-shade" />
                <span className="dream-level-chapter-badge">
                  <FloatingLetters
                    text={chapter1Badge}
                    glowColor="rgba(56, 189, 248, 0.85)"
                    intensity={0.65}
                  />
                </span>
                <span className="dream-level-door-tag">
                  <FloatingLetters
                    text={level.chapter1Door}
                    glowColor="rgba(253, 230, 138, 0.85)"
                    intensity={0.62}
                  />
                </span>
              </div>

              <div className="dream-level-chapter-copy">
                <h4 className="dream-level-chapter-title">
                  <FloatingLetters
                    text={level.chapter1Title}
                    glowColor={level.glowColor}
                    intensity={0.8}
                  />
                </h4>
                <ul className="dream-level-bullet-list">
                  {level.chapter1Bullets.map((b, i) => (
                    <li key={i}>
                      <FloatingLetters
                        text={b}
                        glowColor={level.glowColor}
                        intensity={0.58}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Chapter 2 Visual Card */}
            <div
              className="dream-level-chapter-box is-chapter-2"
              onClick={() =>
                selectMedia(
                  level.chapter2Image,
                  `${level.chapter2Title} (${level.chapter2Door})`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectMedia(
                    level.chapter2Image,
                    `${level.chapter2Title} (${level.chapter2Door})`
                  );
                }
              }}
            >
              <div className="dream-level-chapter-img-wrap">
                <img
                  src={level.chapter2Image}
                  alt={level.chapter2Title}
                  className="dream-level-chapter-img"
                  loading="lazy"
                />
                <div className="dream-level-chapter-img-shade" />
                <span className="dream-level-chapter-badge">
                  <FloatingLetters
                    text={chapter2Badge}
                    glowColor="rgba(167, 139, 250, 0.88)"
                    intensity={0.65}
                  />
                </span>
                <span className="dream-level-door-tag">
                  <FloatingLetters
                    text={level.chapter2Door}
                    glowColor="rgba(253, 230, 138, 0.85)"
                    intensity={0.62}
                  />
                </span>
              </div>

              <div className="dream-level-chapter-copy">
                <h4 className="dream-level-chapter-title">
                  <FloatingLetters
                    text={level.chapter2Title}
                    glowColor="rgba(167, 139, 250, 0.85)"
                    intensity={0.8}
                  />
                </h4>
                <ul className="dream-level-bullet-list">
                  {level.chapter2Bullets.map((b, i) => (
                    <li key={i}>
                      <FloatingLetters
                        text={b}
                        glowColor="rgba(167, 139, 250, 0.78)"
                        intensity={0.58}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="dream-level-mechanics-strip">
            <span className="dream-level-mechanics-label">
              <FloatingLetters
                text={`${connectedSystemsLabel}:`}
                glowColor={level.glowColor}
                intensity={0.68}
              />
            </span>
            <div className="dream-level-mechanics-tags">
              {level.keyMechanics.map((mech) => (
                <span key={mech} className="dream-level-mechanic-chip">
                  <FloatingLetters
                    text={mech}
                    glowColor={level.glowColor}
                    intensity={0.64}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DreamLevelsPage() {
  const { locale, t } = useLanguage();
  const copy = getDreamLevelsPageCopy(locale);

  const pageNav: NavLinkItem[] = [
    { href: "/#world", label: copy.navWorld },
    { href: "#architecture", label: copy.navArchitecture },
    { href: "#levels", label: copy.navLevels },
    { href: "#systems", label: copy.navSystems },
    { href: "/#companions", label: t.nav.companions },
  ];

  return (
    <div className="lunoris-page dream-levels-page">
      <div className="dream-levels-page-backdrop" aria-hidden="true" />
      <HeaderBar
        logoHref="/"
        navLinks={pageNav}
        enableFlyingCta={false}
        floatingLetters
      />

      <main className="dream-levels-main">
        {/* 1. Hero Portal Emergence Section */}
        <section className="dream-levels-hero">
          <div className="lunoris-wide-wrap dream-levels-hero-inner">
            <Link href="/#world" className="dream-levels-back-pill">
              <span>←</span>
              <span>
                <FloatingLetters
                  text={copy.backToWorld}
                  glowColor="rgba(34, 211, 238, 0.85)"
                  intensity={0.65}
                />
              </span>
            </Link>

            <OrnamentDivider />
            <span className="lunoris-title-minor">
              <FloatingLetters
                text={copy.heroMinor}
                glowColor="rgba(167, 139, 250, 0.82)"
                intensity={0.8}
              />
            </span>
            <h1 className="lunoris-title-major dream-levels-hero-title">
              <FloatingLetters
                text={copy.heroTitle}
                glowColor="rgba(34, 211, 238, 0.88)"
                intensity={1.15}
              />
            </h1>
            <p className="dream-levels-hero-subtitle">
              <FloatingLetters
                text={copy.heroSubtitle}
                glowColor="rgba(103, 232, 249, 0.82)"
                intensity={0.76}
              />
            </p>
            <div className="lunoris-center-bar" />

            <ScrollTextReveal
              text={copy.heroOverview}
              className="lunoris-mural-body dream-levels-hero-body"
              startViewportRatio={0.98}
              endViewportRatio={0.78}
              floatingLetters
              floatingIntensity={0.68}
              floatingGlowColor="rgba(34, 211, 238, 0.8)"
            />

            {/* Four-Beat Emotional Arc Strip — Visual Cards */}
            <div className="dream-levels-arc-panel">
              <span className="dream-levels-arc-heading">
                <FloatingLetters
                  text={copy.arcLabel}
                  glowColor="rgba(103, 232, 249, 0.85)"
                  intensity={0.75}
                />
              </span>
              <div className="dream-levels-arc-grid">
                {copy.arcBeats.map((beat) => (
                  <div key={beat.step} className="dream-levels-arc-card">
                    <div className="dream-levels-arc-img-wrap">
                      <img
                        src={beat.image}
                        alt={beat.name}
                        className="dream-levels-arc-img"
                        loading="lazy"
                      />
                      <div className="dream-levels-arc-img-shade" />
                      <span className="dream-levels-arc-step">
                        <FloatingLetters
                          text={beat.step}
                          glowColor="rgba(56, 189, 248, 0.9)"
                          intensity={0.72}
                        />
                      </span>
                    </div>
                    <div className="dream-levels-arc-body">
                      <h2 className="dream-levels-arc-name">
                        <FloatingLetters
                          text={beat.name}
                          glowColor="rgba(167, 139, 250, 0.82)"
                          intensity={0.82}
                        />
                      </h2>
                      <p className="dream-levels-arc-desc">
                        <FloatingLetters
                          text={beat.desc}
                          glowColor="rgba(167, 139, 250, 0.72)"
                          intensity={0.6}
                        />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Spatial Topology: Dream Hub -> 7 Dream Islands -> 3 Portal Doors -> Dream Gates */}
        <section id="architecture" className="dream-levels-section">
          <div className="lunoris-wide-wrap">
            <div className="lunoris-heading-stack">
              <span className="lunoris-title-minor">
                <FloatingLetters
                  text={copy.architectureMinor}
                  glowColor="rgba(167, 139, 250, 0.8)"
                  intensity={0.78}
                />
              </span>
              <h2 className="lunoris-title-major">
                <FloatingLetters
                  text={copy.architectureMajor}
                  glowColor="rgba(34, 211, 238, 0.75)"
                  intensity={0.9}
                />
              </h2>
              <div className="lunoris-center-bar" />
              <ScrollTextReveal
                text={copy.architectureBody}
                className="lunoris-mural-body"
                floatingLetters
                floatingIntensity={0.66}
                floatingGlowColor="rgba(34, 211, 238, 0.78)"
              />
            </div>

            <div className="dream-architecture-grid">
              {copy.architectureCards.map((card) => (
                <article
                  key={card.id}
                  className="dream-architecture-card"
                  style={
                    {
                      "--arch-accent": card.accentColor,
                    } as React.CSSProperties
                  }
                >
                  <div className="lunoris-canvas-weave" aria-hidden="true" />
                  <DeckledCanvasFrame />

                  <div className="dream-architecture-img-wrap">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="dream-architecture-img"
                      loading="lazy"
                    />
                    <div className="dream-architecture-img-shade" />
                    <span className="dream-architecture-badge">
                      <FloatingLetters
                        text={card.badge}
                        glowColor={card.accentColor}
                        intensity={0.66}
                      />
                    </span>
                  </div>

                  <div className="dream-architecture-body">
                    <h3 className="dream-architecture-title">
                      <FloatingLetters
                        text={card.title}
                        glowColor={card.accentColor}
                        intensity={0.82}
                      />
                    </h3>
                    <p className="dream-architecture-desc">
                      <FloatingLetters
                        text={card.desc}
                        glowColor={card.accentColor}
                        intensity={0.6}
                      />
                    </p>
                    <div className="dream-architecture-chips">
                      {card.highlights.map((h, i) => (
                        <span key={i} className="dream-architecture-chip">
                          <FloatingLetters
                            text={h}
                            glowColor={card.accentColor}
                            intensity={0.58}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. The Three Playable Dream Levels (DL1, DL2, DL3) */}
        <section id="levels" className="dream-levels-section">
          <div className="lunoris-wide-wrap">
            <div className="lunoris-heading-stack">
              <span className="lunoris-title-minor">
                <FloatingLetters
                  text={copy.levelsMinor}
                  glowColor="rgba(245, 196, 81, 0.8)"
                  intensity={0.78}
                />
              </span>
              <h2 className="lunoris-title-major">
                <FloatingLetters
                  text={copy.levelsMajor}
                  glowColor="rgba(245, 196, 81, 0.8)"
                  intensity={0.95}
                />
              </h2>
              <div className="lunoris-center-bar" />
              <ScrollTextReveal
                text={copy.levelsBody}
                className="lunoris-mural-body"
                floatingLetters
                floatingIntensity={0.66}
                floatingGlowColor="rgba(245, 196, 81, 0.78)"
              />
            </div>

            <div className="dream-levels-showcase-stack">
              {copy.levels.map((level) => (
                <DreamLevelDetailBlock
                  key={level.id}
                  level={level}
                  chapter1Badge={copy.chapter1Badge}
                  chapter2Badge={copy.chapter2Badge}
                  connectedSystemsLabel={copy.connectedSystemsLabel}
                  inGameCapturesLabel={copy.inGameCapturesLabel}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Core Dream Realm Mechanics & Systems */}
        <section id="systems" className="dream-levels-section">
          <div className="lunoris-wide-wrap">
            <div className="lunoris-heading-stack">
              <span className="lunoris-title-minor">
                <FloatingLetters
                  text={copy.systemsMinor}
                  glowColor="rgba(167, 139, 250, 0.8)"
                  intensity={0.78}
                />
              </span>
              <h2 className="lunoris-title-major">
                <FloatingLetters
                  text={copy.systemsMajor}
                  glowColor="rgba(167, 139, 250, 0.8)"
                  intensity={0.9}
                />
              </h2>
              <div className="lunoris-center-bar" />
              <ScrollTextReveal
                text={copy.systemsBody}
                className="lunoris-mural-body"
                floatingLetters
                floatingIntensity={0.66}
                floatingGlowColor="rgba(167, 139, 250, 0.78)"
              />
            </div>

            <div className="dream-systems-grid">
              {copy.systems.map((sys) => (
                <article
                  key={sys.id}
                  className="dream-system-card"
                  style={
                    {
                      "--sys-accent": sys.accentColor,
                    } as React.CSSProperties
                  }
                >
                  <div className="lunoris-canvas-weave" aria-hidden="true" />
                  <DeckledCanvasFrame />
                  <div className="dream-system-img-wrap">
                    <img
                      src={sys.image}
                      alt={sys.title}
                      className="dream-system-img"
                      loading="lazy"
                    />
                    <div className="dream-system-img-shade" />
                    <span className="dream-system-category">
                      <FloatingLetters
                        text={sys.category}
                        glowColor={sys.accentColor}
                        intensity={0.68}
                      />
                    </span>
                  </div>
                  <div className="dream-system-content">
                    <h3 className="dream-system-title">
                      <FloatingLetters
                        text={sys.title}
                        glowColor={sys.accentColor}
                        intensity={0.8}
                      />
                    </h3>
                    <p className="dream-system-summary">
                      <FloatingLetters
                        text={sys.summary}
                        glowColor={sys.accentColor}
                        intensity={0.64}
                      />
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Return to World Portals CTA */}
            <div className="dream-levels-return-cta">
              <OrnamentDivider />
              <h3 className="dream-levels-return-title">
                <FloatingLetters
                  text={copy.returnCtaTitle}
                  glowColor="rgba(34, 211, 238, 0.8)"
                  intensity={0.85}
                />
              </h3>
              <p className="dream-levels-return-body">
                <FloatingLetters
                  text={copy.returnCtaBody}
                  glowColor="rgba(34, 211, 238, 0.75)"
                  intensity={0.64}
                />
              </p>
              <Link href="/#world" className="lunoris-all-news-btn">
                <BrushstrokeButtonBg />
                <span>
                  <FloatingLetters
                    text={copy.returnCtaBtn}
                    glowColor="rgba(34, 211, 238, 0.9)"
                    intensity={0.7}
                  />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FooterBar floatingLetters />
    </div>
  );
}
