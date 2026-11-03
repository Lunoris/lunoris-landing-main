"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { NavLinkItem } from "@/data/gameData";
import {
  getNightmarePageCopy,
  type NightmareZoneShowcaseItem,
} from "@/data/nightmareData";
import {
  BrushstrokeButtonBg,
  DeckledCanvasFrame,
  OrnamentDivider,
  WideDeckledCanvasFrame,
} from "@/components/ui/CanvasFrames";
import { DreamRevealLetters } from "@/components/ui/DreamRevealLetters";
import { ScrollTextReveal } from "@/components/ui/ScrollTextReveal";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";
import { useLanguage } from "@/i18n/LanguageContext";

/* Lightweight glow text for body copy — avoids per-letter DOM explosion */
function NightmareGlowText({
  text,
  className = "",
  glowColor = "rgba(192, 132, 252, 0.34)",
}: {
  text: string;
  className?: string;
  glowColor?: string;
}) {
  return (
    <span
      className={`nightmare-glow-text ${className}`}
      style={
        {
          "--nm-glow": glowColor,
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
}

function NightmareZoneDetailBlock({
  zone,
  chapter1Badge,
  chapter2Badge,
  connectedSystemsLabel,
  inGameCapturesLabel,
}: {
  zone: NightmareZoneShowcaseItem;
  chapter1Badge: string;
  chapter2Badge: string;
  connectedSystemsLabel: string;
  inGameCapturesLabel: string;
}) {
  const allMedia = [
    { url: zone.image, caption: `${zone.title} — ${zone.roleSuffix}` },
    ...zone.secondaryImages,
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
      id={zone.id}
      className="dream-level-showcase-card nightmare-zone-showcase-card"
      style={
        {
          "--dl-accent": zone.accentColor,
          "--dl-glow": zone.glowColor,
        } as React.CSSProperties
      }
    >
      <div className="lunoris-canvas-weave" aria-hidden="true" />
      <WideDeckledCanvasFrame />

      <div className="dream-level-showcase-header">
        <div className="dream-level-showcase-badges">
          <span className="dream-level-num-pill">
            <NightmareGlowText text={zone.number} glowColor={zone.glowColor} />
          </span>
          <span className="dream-level-realm-pill">
            <NightmareGlowText
              text={zone.realmBadge}
              glowColor={zone.glowColor}
            />
          </span>
          {zone.emotions.map((emo) => (
            <span key={emo} className="dream-level-emotion-tag">
              <NightmareGlowText
                text={`✦ ${emo}`}
                glowColor={zone.glowColor}
              />
            </span>
          ))}
        </div>

        <div className="dream-level-title-row">
          <h3 className="dream-level-showcase-title">
            <DreamRevealLetters
              text={zone.title}
              variant="heading"
              glowColor={zone.glowColor}
            />
          </h3>
          <p className="dream-level-showcase-subtitle">
            <NightmareGlowText
              text={zone.roleSuffix}
              glowColor={zone.glowColor}
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
                <NightmareGlowText
                  text={inGameCapturesLabel}
                  glowColor={zone.glowColor}
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

        {/* Right column: Overview, Dual-Beat Cards & Mechanics */}
        <div className="dream-level-info-col">
          <p className="dream-level-overview-text">
            <NightmareGlowText
              text={zone.overview}
              glowColor={zone.glowColor}
            />
          </p>

          <div className="dream-level-chapters-grid">
            {/* Sub-block 1 */}
            <div
              className="dream-level-chapter-box is-chapter-1"
              onClick={() =>
                selectMedia(
                  zone.chapter1Image,
                  `${zone.title} — ${zone.chapter1Title}`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectMedia(
                    zone.chapter1Image,
                    `${zone.title} — ${zone.chapter1Title}`
                  );
                }
              }}
            >
              <div className="dream-level-chapter-img-wrap">
                <img
                  src={zone.chapter1Image}
                  alt={zone.chapter1Title}
                  className="dream-level-chapter-img"
                  loading="lazy"
                />
                <div className="dream-level-chapter-img-shade" />
                <span className="dream-level-chapter-badge">
                  <NightmareGlowText
                    text={chapter1Badge}
                    glowColor={zone.glowColor}
                  />
                </span>
                <span className="dream-level-door-tag">
                  <NightmareGlowText
                    text={zone.chapter1Door}
                    glowColor={zone.glowColor}
                  />
                </span>
              </div>
              <div className="dream-level-chapter-copy">
                <h4 className="dream-level-chapter-title">
                  <NightmareGlowText
                    text={zone.chapter1Title}
                    glowColor={zone.glowColor}
                  />
                </h4>
                <ul className="dream-level-bullet-list">
                  {zone.chapter1Bullets.map((b, i) => (
                    <li key={i}>
                      <NightmareGlowText
                        text={b}
                        glowColor={zone.glowColor}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sub-block 2 */}
            <div
              className="dream-level-chapter-box is-chapter-2"
              onClick={() =>
                selectMedia(
                  zone.chapter2Image,
                  `${zone.title} — ${zone.chapter2Title}`
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectMedia(
                    zone.chapter2Image,
                    `${zone.title} — ${zone.chapter2Title}`
                  );
                }
              }}
            >
              <div className="dream-level-chapter-img-wrap">
                <img
                  src={zone.chapter2Image}
                  alt={zone.chapter2Title}
                  className="dream-level-chapter-img"
                  loading="lazy"
                />
                <div className="dream-level-chapter-img-shade" />
                <span className="dream-level-chapter-badge">
                  <NightmareGlowText
                    text={chapter2Badge}
                    glowColor="rgba(232, 121, 249, 0.85)"
                  />
                </span>
                <span className="dream-level-door-tag">
                  <NightmareGlowText
                    text={zone.chapter2Door}
                    glowColor="rgba(232, 121, 249, 0.85)"
                  />
                </span>
              </div>
              <div className="dream-level-chapter-copy">
                <h4 className="dream-level-chapter-title">
                  <NightmareGlowText
                    text={zone.chapter2Title}
                    glowColor="rgba(232, 121, 249, 0.88)"
                  />
                </h4>
                <ul className="dream-level-bullet-list">
                  {zone.chapter2Bullets.map((b, i) => (
                    <li key={i}>
                      <NightmareGlowText
                        text={b}
                        glowColor="rgba(232, 121, 249, 0.78)"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="dream-level-mechanics-strip">
            <span className="dream-level-mechanics-label">
              <NightmareGlowText
                text={`${connectedSystemsLabel}:`}
                glowColor={zone.glowColor}
              />
            </span>
            <div className="dream-level-mechanics-tags">
              {zone.keyMechanics.map((mech) => (
                <span key={mech} className="dream-level-mechanic-chip">
                  <NightmareGlowText
                    text={mech}
                    glowColor={zone.glowColor}
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

export default function NightmareRealmPage() {
  const { locale } = useLanguage();
  const router = useRouter();
  const copy = getNightmarePageCopy(locale);

  const handleReturnHome = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      router.push("/#world");
    },
    [router]
  );

  const navItems: NavLinkItem[] = [
    { label: copy.navWorld, href: "/#world" },
    { label: copy.navArchitecture, href: "#nightmare-architecture" },
    { label: copy.navZones, href: "#nightmare-zones" },
    { label: copy.navSystems, href: "#nightmare-systems" },
    { label: "Companions", href: "/#companions" },
  ];

  return (
    <div className="lunoris-page dream-levels-page nightmare-realm-page">
      <div
        className="dream-levels-page-backdrop nightmare-realm-page-backdrop"
        aria-hidden="true"
      />

      <HeaderBar
        logoHref="/"
        navLinks={navItems}
        enableFlyingCta={false}
        voidDistortion
      />

      <main id="top" className="dream-levels-main">
        {/* 1. HERO & FOUR-PHASE NIGHTMARE CYCLE */}
        <section className="dream-levels-hero">
          <div className="lunoris-wide-wrap dream-levels-hero-inner">
            <a
              href="/#world"
              onClick={handleReturnHome}
              className="dream-levels-back-pill nightmare-back-pill"
            >
              <span aria-hidden="true">←</span>
              <span>
                <NightmareGlowText
                  text={copy.backToWorld}
                  glowColor="rgba(217, 70, 239, 0.85)"
                />
              </span>
            </a>

            <OrnamentDivider />
            <span className="lunoris-title-minor">
              <NightmareGlowText
                text={copy.heroMinor}
                glowColor="rgba(217, 70, 239, 0.85)"
              />
            </span>
            <h1 className="lunoris-title-major dream-levels-hero-title">
              <DreamRevealLetters
                text={copy.heroTitle}
                variant="heading"
                glowColor="rgba(217, 70, 239, 0.92)"
              />
            </h1>
            <p className="dream-levels-hero-subtitle">
              <NightmareGlowText
                text={copy.heroSubtitle}
                glowColor="rgba(192, 132, 252, 0.85)"
              />
            </p>
            <div className="lunoris-center-bar" />

            <ScrollTextReveal
              text={copy.heroOverview}
              className="lunoris-mural-body dream-levels-hero-body"
              startViewportRatio={0.98}
              endViewportRatio={0.78}
            />

            {/* Four-Beat Emotional Arc Strip — Visual Cards */}
            <div className="dream-levels-arc-panel">
              <div className="lunoris-canvas-weave" aria-hidden="true" />
              <WideDeckledCanvasFrame />
              <span className="dream-levels-arc-heading">
                <DreamRevealLetters
                  text={copy.arcLabel}
                  variant="heading"
                  glowColor="rgba(217, 70, 239, 0.88)"
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
                        <NightmareGlowText
                          text={beat.step}
                          glowColor="rgba(217, 70, 239, 0.88)"
                        />
                      </span>
                    </div>
                    <div className="dream-levels-arc-body">
                      <h2 className="dream-levels-arc-name">
                        <DreamRevealLetters
                          text={beat.name}
                          variant="heading"
                          glowColor="rgba(232, 121, 249, 0.9)"
                        />
                      </h2>
                      <p className="dream-levels-arc-desc">
                        <NightmareGlowText
                          text={beat.desc}
                          glowColor="rgba(192, 132, 252, 0.75)"
                        />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. SPATIAL ARCHITECTURE (7 ZONES, MIRROR, MATCHI MOUNTAIN & SHRINES) */}
        <section
          id="nightmare-architecture"
          className="dream-levels-section"
        >
          <div className="lunoris-wide-wrap">
            <div className="lunoris-heading-stack">
              <span className="lunoris-title-minor">
                <NightmareGlowText
                  text={copy.architectureMinor}
                  glowColor="rgba(217, 70, 239, 0.85)"
                />
              </span>
              <h2 className="lunoris-title-major">
                <DreamRevealLetters
                  text={copy.architectureMajor}
                  variant="heading"
                  glowColor="rgba(217, 70, 239, 0.92)"
                />
              </h2>
              <div className="lunoris-center-bar" />
              <ScrollTextReveal
                text={copy.architectureBody}
                className="lunoris-mural-body"
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
                      <NightmareGlowText
                        text={card.badge}
                        glowColor={card.accentColor}
                      />
                    </span>
                  </div>
                  <div className="dream-architecture-body">
                    <h3 className="dream-architecture-title">
                      <DreamRevealLetters
                        text={card.title}
                        variant="heading"
                        glowColor={card.accentColor}
                      />
                    </h3>
                    <p className="dream-architecture-desc">
                      <NightmareGlowText
                        text={card.subtitle}
                        glowColor={card.accentColor}
                      />
                    </p>
                    <p className="dream-architecture-desc">
                      <NightmareGlowText
                        text={card.desc}
                        glowColor={card.accentColor}
                      />
                    </p>
                    <div className="dream-architecture-chips">
                      {card.highlights.map((h) => (
                        <span key={h} className="dream-architecture-chip">
                          <NightmareGlowText
                            text={h}
                            glowColor={card.accentColor}
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

        {/* 3. NIGHTMARE ZONES & BOSS ARENAS */}
        <section
          id="nightmare-zones"
          className="dream-levels-section"
        >
          <div className="lunoris-wide-wrap">
            <div className="lunoris-heading-stack">
              <span className="lunoris-title-minor">
                <NightmareGlowText
                  text={copy.levelsMinor}
                  glowColor="rgba(217, 70, 239, 0.85)"
                />
              </span>
              <h2 className="lunoris-title-major">
                <DreamRevealLetters
                  text={copy.levelsMajor}
                  variant="heading"
                  glowColor="rgba(217, 70, 239, 0.92)"
                />
              </h2>
              <div className="lunoris-center-bar" />
              <ScrollTextReveal
                text={copy.levelsBody}
                className="lunoris-mural-body"
              />
            </div>

            <div className="dream-levels-showcase-stack">
              {copy.zones.map((zone) => (
                <NightmareZoneDetailBlock
                  key={zone.id}
                  zone={zone}
                  chapter1Badge={copy.chapter1Badge}
                  chapter2Badge={copy.chapter2Badge}
                  connectedSystemsLabel={copy.connectedSystemsLabel}
                  inGameCapturesLabel={copy.inGameCapturesLabel}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. CORE NIGHTMARE SYSTEMS */}
        <section
          id="nightmare-systems"
          className="dream-levels-section"
        >
          <div className="lunoris-wide-wrap">
            <div className="lunoris-heading-stack">
              <span className="lunoris-title-minor">
                <NightmareGlowText
                  text={copy.systemsMinor}
                  glowColor="rgba(217, 70, 239, 0.85)"
                />
              </span>
              <h2 className="lunoris-title-major">
                <DreamRevealLetters
                  text={copy.systemsMajor}
                  variant="heading"
                  glowColor="rgba(217, 70, 239, 0.92)"
                />
              </h2>
              <div className="lunoris-center-bar" />
              <ScrollTextReveal
                text={copy.systemsBody}
                className="lunoris-mural-body"
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
                      <NightmareGlowText
                        text={sys.category}
                        glowColor={sys.accentColor}
                      />
                    </span>
                  </div>
                  <div className="dream-system-content">
                    <h3 className="dream-system-title">
                      <DreamRevealLetters
                        text={sys.title}
                        variant="heading"
                        glowColor={sys.accentColor}
                      />
                    </h3>
                    <p className="dream-system-summary">
                      <NightmareGlowText
                        text={sys.summary}
                        glowColor={sys.accentColor}
                      />
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="dream-levels-return-cta">
              <OrnamentDivider />
              <h3 className="dream-levels-return-title">
                <DreamRevealLetters
                  text={copy.returnCtaTitle}
                  variant="heading"
                  glowColor="rgba(217, 70, 239, 0.92)"
                />
              </h3>
              <p className="dream-levels-return-body">
                <NightmareGlowText
                  text={copy.returnCtaBody}
                  glowColor="rgba(192, 132, 252, 0.78)"
                />
              </p>
              <a
                href="/#world"
                onClick={handleReturnHome}
                className="lunoris-cta-primary lunoris-cta-lg"
              >
                <BrushstrokeButtonBg />
                <span className="canvas-btn-text">
                  <NightmareGlowText
                    text={copy.returnCtaBtn}
                    glowColor="rgba(217, 70, 239, 0.9)"
                  />
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <FooterBar />
    </div>
  );
}
