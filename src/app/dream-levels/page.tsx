"use client";

import React, { useCallback, useEffect, useRef } from "react";
import type { NavLinkItem } from "@/data/gameData";
import { getDreamLevelsPageCopy } from "@/data/dreamLevelsData";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";
import { FloatingLetters } from "@/components/ui/FloatingLetters";
import {
  DreamLevelEmblem,
  type DreamLevelEmblemKind,
} from "@/components/ui/DreamLevelEmblems";
import { useLanguage } from "@/i18n/LanguageContext";

const LEVEL_EMBLEMS: DreamLevelEmblemKind[] = ["pain", "guilt", "breakthrough"];
const TOTAL_STAGES = 6; // 0: Riddle Plaque, 1: Dream Levels Intro, 2: Pain, 3: Guilt, 4: Breakthrough, 5: Finale (?)

/**
 * Winding zigzag route drawn in the gap between two stacked waypoints.
 * Alternate connectors are mirrored so the path swings left, then right.
 */
function DreamLevelRoute({ index }: { index: number }) {
  const gradientId = "dream-level-route-gradient-" + index;
  const d =
    "M 120 0 C 120 34 205 28 205 64 C 205 104 35 96 35 136 C 35 170 120 166 120 200";
  return (
    <div
      className={
        "dream-level-route" + (index % 2 === 1 ? " is-mirrored" : "")
      }
      aria-hidden="true"
    >
      <svg viewBox="0 0 240 200" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f5c451" />
          </linearGradient>
        </defs>
        <path
          className="dream-level-route-glow"
          stroke={"url(#" + gradientId + ")"}
          d={d}
        />
        <path
          className="dream-level-route-dashes"
          stroke={"url(#" + gradientId + ")"}
          d={d}
        />
      </svg>
    </div>
  );
}

const DREAM_LEVELS_TEXT_GLOW = "rgba(34, 211, 238, 0.88)";
const DREAM_LEVELS_TEXT_INTENSITY = 1.08;

function DreamLevelsText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <FloatingLetters
      text={text}
      className={className}
      glowColor={DREAM_LEVELS_TEXT_GLOW}
      intensity={DREAM_LEVELS_TEXT_INTENSITY}
    />
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Maps normalized scroll progress `p in [0, 1]` to continuous stage index `s in [0, TOTAL_STAGES - 1]`
 * with a comfortable dwell plateau around each integer stop so each card/plaque settles cleanly
 * at the user's stationary position before gliding onward along the Dream Route.
 */
function progressToStage(p: number): number {
  const scaled = clamp(p, 0, 1) * (TOTAL_STAGES - 1);
  const idx = Math.min(TOTAL_STAGES - 2, Math.floor(scaled));
  const frac = scaled - idx;

  // Dwell plateau: first 18% and last 18% of each segment hold near the integer stop,
  // while the middle 64% glides smoothly along the winding path.
  const plateau = 0.18;
  let easedFrac = 0;
  if (frac <= plateau) {
    easedFrac = (frac / plateau) * 0.06;
  } else if (frac >= 1 - plateau) {
    easedFrac = 0.94 + ((frac - (1 - plateau)) / plateau) * 0.06;
  } else {
    const mid = (frac - plateau) / (1 - 2 * plateau);
    easedFrac = 0.06 + smoothstep(0, 1, mid) * 0.88;
  }
  return idx + easedFrac;
}

export default function DreamLevelsPage() {
  const { locale, t } = useLanguage();
  const copy = getDreamLevelsPageCopy(locale);
  const pageCopy = t.portalPages.dream;
  const teasers = pageCopy.levels;
  const riddle = t.portalPages.dreamRiddle;
  const pageNav: NavLinkItem[] = [
    { href: "/#world", label: t.portalPages.navWorld },
  ];

  const trackRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const stopRefs = useRef<(HTMLElement | null)[]>([]);
  const routeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tunnelRingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const compassDotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const scrollToStop = useCallback((targetStop: number) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport || typeof window === "undefined") return;
    const trackRect = track.getBoundingClientRect();
    const vpRect = viewport.getBoundingClientRect();
    const maxRectScroll = Math.max(1, trackRect.height - vpRect.height);
    const currentRawP = clamp(-trackRect.top / maxRectScroll, 0, 1);
    const targetP = clamp(targetStop / (TOTAL_STAGES - 1), 0, 1);
    const maxScrollCss = Math.max(1, track.offsetHeight - viewport.offsetHeight);
    const rootZoom =
      parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const deltaScrollY = (targetP - currentRawP) * maxScrollCss * rootZoom;
    window.scrollBy({
      top: deltaScrollY,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    let targetP = 0;
    let currentP = 0;
    let lastReportedStop = -1;

    // The active stop is shown by toggling classes directly: a React state update
    // here re-rendered the whole page (hundreds of letter spans) mid-scroll.
    const markActiveStop = (active: number) => {
      compassDotRefs.current.forEach((dot, idx) => {
        if (!dot) return;
        dot.classList.toggle("is-active", idx === active);
        dot.classList.toggle("is-passed", idx < active);
        if (idx === active) dot.setAttribute("aria-current", "step");
        else dot.removeAttribute("aria-current");
      });
      stopRefs.current.forEach((stop, idx) => {
        stop?.classList.toggle("is-current", idx === active);
      });
    };

    const measureTargetProgress = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track) return 0;
      const trackRect = track.getBoundingClientRect();
      const vpHeight = viewport
        ? viewport.getBoundingClientRect().height
        : window.innerHeight;
      const maxScroll = Math.max(1, trackRect.height - vpHeight);
      return clamp(-trackRect.top / maxScroll, 0, 1);
    };

    const applyStageTransforms = (p: number) => {
      const s = progressToStage(p);
      const nearestStop = Math.round(s);
      if (nearestStop !== lastReportedStop) {
        lastReportedStop = nearestStop;
        markActiveStop(nearestStop);
      }

      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleY(${clamp(
          s / (TOTAL_STAGES - 1),
          0,
          1
        ).toFixed(4)})`;
      }

      // 1. Animate 3D perspective tunnel rings so the user feels anchored in one place
      // while the Dream Realm flows radially toward and past them
      for (let i = 0; i < tunnelRingRefs.current.length; i++) {
        const ringEl = tunnelRingRefs.current[i];
        if (!ringEl) continue;
        const phase = ((s * 0.55 + i / tunnelRingRefs.current.length) % 1 + 1) % 1;
        const ringScale = 0.28 + phase * 1.65;
        const ringAlpha = Math.sin(phase * Math.PI) * 0.34;
        const swayX = Math.sin(s * Math.PI) * (1 - phase) * 42 * clamp(window.innerWidth / 1100, 0.3, 1);
        ringEl.style.transform = `translate3d(${swayX.toFixed(1)}px, 0px, 0px) scale(${ringScale.toFixed(3)})`;
        ringEl.style.opacity = ringAlpha.toFixed(3);
      }

      // Sideways swing of the route, scaled down on narrow screens so cards in
      // transit stay on screen (the full 96px swing pushed them off a phone).
      const sway = clamp(window.innerWidth / 1100, 0.3, 1);

      // 2. Position each waypoint stop (0..5) relative to the stationary observer at (50%, 50%)
      for (let k = 0; k < TOTAL_STAGES; k++) {
        const el = stopRefs.current[k];
        if (!el) continue;

        // delta = 0: stop is right at the user's stationary position
        // delta > 0: stop is ahead in the distance along the winding Dream Route
        // delta < 0: stop is passing around/behind the user as they travel forward
        const delta = k - s;
        const absDelta = Math.abs(delta);

        if (absDelta > 1.65) {
          el.style.opacity = "0";
          el.style.visibility = "hidden";
          el.style.pointerEvents = "none";
          continue;
        }

        const bendDir = k % 2 === 1 ? 1 : -1;
        let tx = 0;
        let ty = 0;
        let scale = 1;
        let opacity = 1;

        // Only transform + opacity change per frame (compositor-only). A per-frame
        // `filter: blur()` on these image cards repainted them on every scroll frame.
        if (delta >= 0) {
          // Approaching from the distant horizon along the winding S-curve route
          tx = bendDir * Math.sin(clamp(delta, 0, 1.2) * Math.PI * 0.85) * 124 * sway;
          ty = delta * 580;
          scale = clamp(1 - delta * 0.34, 0.44, 1);
          opacity = clamp(1 - Math.max(0, delta - 0.16) * 1.15, 0, 1);
        } else {
          // Gliding past the fixed viewpoint: grows slightly and clears quickly,
          // so the outgoing card no longer ghosts over the next one.
          const past = -delta;
          tx = -bendDir * Math.sin(clamp(past, 0, 1) * Math.PI * 0.6) * 68 * sway;
          ty = -past * 500;
          scale = 1 + past * 0.22;
          opacity = clamp(1 - Math.max(0, past - 0.06) * 2.4, 0, 1);
        }

        el.style.visibility = opacity > 0.01 ? "visible" : "hidden";
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0px) scale(${scale.toFixed(3)})`;
        el.style.pointerEvents = absDelta < 0.42 ? "auto" : "none";
        el.style.zIndex = String(20 - Math.round(absDelta * 10));
      }

      // 3. Position the 5 winding `<DreamLevelRoute>` SVG connectors between Stop r and Stop r+1
      for (let r = 0; r < TOTAL_STAGES - 1; r++) {
        const routeEl = routeRefs.current[r];
        if (!routeEl) continue;

        const routeCenterStage = r + 0.5;
        const rDelta = routeCenterStage - s;
        const absRDelta = Math.abs(rDelta);

        if (absRDelta > 1.35) {
          routeEl.style.opacity = "0";
          routeEl.style.visibility = "hidden";
          continue;
        }

        const rTy = rDelta * 540;
        const rScale = clamp(1 - rDelta * 0.24, 0.55, 1.35);
        const rOpacity = clamp(1 - Math.max(0, absRDelta - 0.35) * 1.25, 0, 0.92);

        routeEl.style.visibility = rOpacity > 0.01 ? "visible" : "hidden";
        routeEl.style.opacity = rOpacity.toFixed(3);
        routeEl.style.transform = `translate3d(0px, ${rTy.toFixed(1)}px, 0px) scale(${rScale.toFixed(3)})`;
      }
    };

    const tick = () => {
      rafId = null;
      targetP = measureTargetProgress();
      const diff = targetP - currentP;
      if (Math.abs(diff) > 0.0004) {
        // Light smoothing only; a heavier lag made the stage trail behind the wheel.
        currentP += diff * 0.22;
        applyStageTransforms(currentP);
        rafId = window.requestAnimationFrame(tick);
      } else {
        currentP = targetP;
        applyStageTransforms(currentP);
      }
    };

    const onScrollOrResize = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    targetP = measureTargetProgress();
    currentP = targetP;
    applyStageTransforms(currentP);

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const stopLabels = [
    riddle.title,
    copy.heroTitle,
    "Pain",
    "Guilt",
    "Breakthrough",
    "?",
  ];

  return (
    <div className="lunoris-page dream-levels-page dream-levels-journey-page">
      <div className="dream-levels-page-backdrop" aria-hidden="true" />
      <HeaderBar
        logoHref="/"
        navLinks={pageNav}
        enableFlyingCta={false}
        floatingLetters
        floatingGlowColor={DREAM_LEVELS_TEXT_GLOW}
        floatingIntensity={DREAM_LEVELS_TEXT_INTENSITY}
        floatingLanguageLetters
      />

      <main className="dream-levels-main dream-levels-journey-main">
        <div ref={trackRef} className="dream-levels-journey-scroll-track">
          <div
            ref={viewportRef}
            className="dream-levels-journey-sticky-viewport"
          >
            {/* Perspective depth rings that expand past the stationary observer */}
            <div className="dream-levels-journey-tunnel" aria-hidden="true">
              {[0, 1, 2, 3].map((ringIdx) => (
                <div
                  key={ringIdx}
                  ref={(el) => {
                    tunnelRingRefs.current[ringIdx] = el;
                  }}
                  className={`dream-levels-tunnel-ring is-ring-${ringIdx}`}
                />
              ))}
            </div>

            {/* Stationary camera stage: all waypoints & winding routes travel through (50%, 50%) */}
            <div
              className="dream-levels-journey-camera-stage"
              aria-label={pageCopy.mapLabel}
            >
              {/* Route Connectors (0..4) flowing through the center between waypoints */}
              {Array.from({ length: TOTAL_STAGES - 1 }).map((_, rIdx) => (
                <div
                  key={`route-${rIdx}`}
                  ref={(el) => {
                    routeRefs.current[rIdx] = el;
                  }}
                  className="dream-levels-journey-route-slot"
                  aria-hidden="true"
                >
                  <DreamLevelRoute index={rIdx} />
                </div>
              ))}

              {/* WAYPOINT 0 (FIRST): "Which door would you never open?" Riddle Plaque */}
              <section
                ref={(el) => {
                  stopRefs.current[0] = el;
                }}
                className="dream-levels-journey-stop dream-levels-entry is-riddle"
                aria-labelledby="dream-levels-entry-title"
              >
                <p className="dream-levels-entry-eyebrow">
                  <DreamLevelsText text={riddle.eyebrow} />
                </p>
                <h2
                  id="dream-levels-entry-title"
                  className="dream-levels-entry-title"
                >
                  <DreamLevelsText text={riddle.title} />
                </h2>
                <p className="dream-levels-entry-description">
                  <DreamLevelsText text={riddle.body} />
                </p>
                <button
                  type="button"
                  onClick={() => scrollToStop(1)}
                  className="dream-levels-entry-cue dream-levels-entry-cue-btn"
                >
                  <span>{riddle.cue}</span>
                  <span
                    className="dream-levels-entry-cue-arrow"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </button>
              </section>

              {/* WAYPOINT 1: Dream Levels Title & Realm Overview */}
              <header
                ref={(el) => {
                  stopRefs.current[1] = el;
                }}
                className="dream-levels-journey-stop dream-levels-cards-heading is-journey-heading-card"
              >
                <span className="dream-levels-cards-eyebrow">
                  <DreamLevelsText text={pageCopy.heroMinor} />
                </span>
                <h1 className="dream-levels-cards-title">
                  <DreamLevelsText text={copy.heroTitle} />
                </h1>
                <p className="dream-levels-cards-subtitle">
                  <DreamLevelsText text={pageCopy.heroSubtitle} />
                </p>
                <p className="dream-levels-cards-description">
                  <DreamLevelsText text={pageCopy.heroOverview} />
                </p>
                <button
                  type="button"
                  onClick={() => scrollToStop(2)}
                  className="dream-levels-entry-cue dream-levels-entry-cue-btn"
                >
                  <span>{riddle.cue}</span>
                  <span
                    className="dream-levels-entry-cue-arrow"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </button>
              </header>

              {/* WAYPOINTS 2, 3, 4: The Three Dream Doors (Pain, Guilt, Breakthrough) */}
              {copy.levels.map((level, index) => {
                const stopIdx = index + 2;
                return (
                  <div
                    key={level.id}
                    ref={(el) => {
                      stopRefs.current[stopIdx] = el;
                    }}
                    className={
                      "dream-levels-journey-stop dream-level-map-stop dream-level-map-stop-" +
                      (index + 1)
                    }
                    style={
                      {
                        "--dl-accent": level.accentColor,
                        "--dl-glow": level.glowColor,
                      } as React.CSSProperties
                    }
                  >
                    <span className="dream-level-map-node" aria-hidden="true">
                      <DreamLevelEmblem
                        kind={LEVEL_EMBLEMS[index] ?? "breakthrough"}
                        className="dream-level-map-emblem"
                      />
                    </span>
                    <article className="dream-level-teaser-card">
                      <img
                        className="dream-level-teaser-image"
                        src={level.image}
                        alt={level.title}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <div className="dream-level-teaser-content">
                        <h2 className="dream-level-teaser-title">
                          {index === 2 ? (
                            <em>
                              <DreamLevelsText text="Breakthrough" />
                            </em>
                          ) : (
                            <DreamLevelsText
                              text={index === 0 ? "Pain" : "Guilt"}
                            />
                          )}
                        </h2>
                        <p className="dream-level-teaser-description">
                          <DreamLevelsText
                            text={teasers[index]?.description ?? ""}
                          />
                        </p>
                        <p className="dream-level-teaser-hook">
                          <DreamLevelsText text={teasers[index]?.hook ?? ""} />
                        </p>
                      </div>
                    </article>
                  </div>
                );
              })}

              {/* WAYPOINT 5: Finale (? MORE LEVELS COMING SOON) */}
              <div
                ref={(el) => {
                  stopRefs.current[5] = el;
                }}
                className="dream-levels-journey-stop dream-level-map-finale is-journey-finale"
              >
                <span
                  className="dream-level-map-finale-node"
                  aria-hidden="true"
                >
                  <DreamLevelsText text="?" />
                </span>
                <p className="dream-levels-coming-soon">
                  <DreamLevelsText text={pageCopy.comingSoon} />
                </p>
              </div>
            </div>

            {/* Stationary Observer Compass Rail (shows your fixed position as stops pass through) */}
            <nav
              className="dream-levels-journey-compass"
              aria-label={pageCopy.mapLabel}
            >
              <div className="dream-levels-journey-compass-track">
                <div
                  ref={progressFillRef}
                  className="dream-levels-journey-compass-fill"
                />
              </div>
              {stopLabels.map((label, idx) => (
                <button
                  key={idx}
                  ref={(el) => {
                    compassDotRefs.current[idx] = el;
                  }}
                  type="button"
                  onClick={() => scrollToStop(idx)}
                  className="dream-levels-journey-compass-dot"
                  aria-label={label}
                  title={label}
                  data-label={label}
                >
                  <span className="dream-levels-journey-compass-core" />
                </button>
              ))}
            </nav>
          </div>
        </div>
      </main>

      <FooterBar
        floatingLetters
        floatingGlowColor={DREAM_LEVELS_TEXT_GLOW}
        floatingIntensity={DREAM_LEVELS_TEXT_INTENSITY}
        floatingWordmark
      />
    </div>
  );
}
