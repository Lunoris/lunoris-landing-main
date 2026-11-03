"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  WORLD_LOCATIONS_SHOWCASE,
  type WorldLocationItem,
} from "@/data/gameData";
import { ArchedCanvasFrame } from "@/components/ui/CanvasFrames";
import {
  triggerShatteredReality,
  unlockShatteredAudio,
} from "@/components/ui/DreamDissolveTransition";
import {
  triggerNightmareRift,
  unlockNightmareAudio,
} from "@/components/ui/NightmareRiftTransition";
import {
  triggerRetroTransition,
  unlockRetroAudio,
} from "@/components/ui/RetroArcadeTransition";
import { FloatingLetters } from "@/components/ui/FloatingLetters";
import { MagneticLetters } from "@/components/ui/MagneticLetters";
import { DreamRevealLetters } from "@/components/ui/DreamRevealLetters";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import { ScrollTextReveal } from "@/components/ui/ScrollTextReveal";
import { useLanguage } from "@/i18n/LanguageContext";

const PORTAL_ENTER_LABELS: Record<string, string> = {
  en: "ENTER DREAM PORTAL",
  ru: "ВОЙТИ В ПОРТАЛ СНОВ",
  de: "TRAUMPORTAL BETRETEN",
  fr: "ENTRER DANS LE PORTAIL",
  es: "ENTRAR AL PORTAL",
  zh: "进入梦境传送门",
  ja: "ドリームポータルへ入る",
  ar: "ادخل بوابة الأحلام",
};

type PortalTransitionPhase = "idle" | "centering" | "expanding";

function WorldPortalCard({
  location,
  index,
  title,
  desc,
  isInteractivePortal,
  isMagneticPortal,
  isNightmarePortal,
  enterLabel,
  onPortalActivate,
  activePhase,
  zoomOffset,
  isHiddenSibling,
}: {
  location: WorldLocationItem;
  index: number;
  title: string;
  desc: string;
  isInteractivePortal?: boolean;
  isMagneticPortal?: boolean;
  isNightmarePortal?: boolean;
  enterLabel?: string;
  onPortalActivate?: (cardEl: HTMLElement) => void;
  activePhase?: PortalTransitionPhase;
  zoomOffset?: { dx: number; dy: number };
  isHiddenSibling?: boolean;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [nightmareReplayKey, setNightmareReplayKey] = useState(0);
  const lastNightmareHoverRef = useRef<number>(0);

  const handleMouseEnter = () => {
    if (!isNightmarePortal) return;
    const now = performance.now();
    if (now - lastNightmareHoverRef.current > 1600) {
      lastNightmareHoverRef.current = now;
      setNightmareReplayKey((k) => k + 1);
    }
  };

  const positionClass =
    index % 3 === 1
      ? "canvas-portal-center"
      : index % 3 === 0
        ? "canvas-portal-left"
        : "canvas-portal-right";

  const isClickablePortal = Boolean(onPortalActivate);

  const handleClick = () => {
    if (!isClickablePortal || !onPortalActivate || !cardRef.current) return;
    onPortalActivate(cardRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!isClickablePortal || !onPortalActivate || !cardRef.current) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPortalActivate(cardRef.current);
    }
  };

  const phaseClass =
    activePhase === "centering"
      ? "is-portal-centering"
      : activePhase === "expanding"
        ? "is-portal-expanding"
        : "";

  return (
    <article
      ref={cardRef}
      className={`lunoris-media-tile ${positionClass} ${
        isClickablePortal ? "is-interactive-portal" : ""
      } ${isMagneticPortal ? "is-retro-portal" : ""} ${
        isNightmarePortal ? "is-nightmare-portal" : ""
      } ${phaseClass} ${
        isHiddenSibling ? "is-portal-sibling-hidden" : ""
      } ${
        activePhase !== "idle" || isHiddenSibling ? "is-visible" : ""
      }`.trim()}
      data-reveal="up"
      role={isClickablePortal ? "button" : undefined}
      tabIndex={isClickablePortal ? 0 : undefined}
      aria-label={isClickablePortal ? `${title} — ${enterLabel}` : undefined}
      onClick={isClickablePortal ? handleClick : undefined}
      onKeyDown={isClickablePortal ? handleKeyDown : undefined}
      onMouseEnter={isNightmarePortal ? handleMouseEnter : undefined}
      style={
        {
          "--stagger": index % 3,
          "--portal-accent": location.accentColor,
          "--portal-glow": location.glowColor,
          "--portal-glow-strong": location.glowStrong,
          "--portal-zoom-dx": zoomOffset ? `${zoomOffset.dx.toFixed(1)}px` : "0px",
          "--portal-zoom-dy": zoomOffset ? `${zoomOffset.dy.toFixed(1)}px` : "0px",
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
        {isMagneticPortal ? (
          <div className="lunoris-retro-crt-screen" aria-hidden="true" />
        ) : null}
        {isInteractivePortal || isNightmarePortal ? (
          <>
            <div className="lunoris-portal-vortex-glow" aria-hidden="true" />
            <div
              className="lunoris-portal-impasto-fracture"
              aria-hidden="true"
            />
          </>
        ) : null}
      </div>
      <ArchedCanvasFrame
        strokeColor={location.strokeColor}
        accentColor={location.accentColor}
      />
      <div className="lunoris-tile-caption">
        <h3>
          {isInteractivePortal ? (
            <FloatingLetters
              text={title}
              glowColor={location.glowStrong || "rgba(34, 211, 238, 0.85)"}
            />
          ) : isMagneticPortal ? (
            <MagneticLetters
              text={title}
              glowColor={location.glowStrong || "rgba(251, 191, 36, 0.9)"}
              intensity={1.08}
            />
          ) : isNightmarePortal ? (
            <DreamRevealLetters
              text={title}
              variant="heading"
              glowColor={location.glowStrong || "rgba(192, 132, 252, 0.42)"}
              replayKey={nightmareReplayKey}
            />
          ) : (
            title
          )}
        </h3>
        <div className="lunoris-tile-divider" aria-hidden="true">
          <span className="lunoris-tile-divider-gem" />
        </div>
        <ScrollTextReveal
          text={desc}
          startViewportRatio={0.97}
          endViewportRatio={0.78}
          floatingLetters={isInteractivePortal}
          floatingIntensity={0.62}
          floatingGlowColor={location.glowStrong || "rgba(34, 211, 238, 0.8)"}
          magneticLetters={isMagneticPortal}
          magneticIntensity={0.68}
          magneticGlowColor={location.glowStrong || "rgba(251, 191, 36, 0.85)"}
          dreamRevealLetters={isNightmarePortal}
          dreamRevealGlowColor={
            location.glowStrong || "rgba(192, 132, 252, 0.36)"
          }
          dreamRevealReplayKey={nightmareReplayKey}
        />
      </div>
    </article>
  );
}

export function WorldPortalsSection() {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const [activePortalId, setActivePortalId] = useState<string | null>(null);
  const [portalPhase, setPortalPhase] = useState<PortalTransitionPhase>("idle");
  const [zoomOffset, setZoomOffset] = useState<{ dx: number; dy: number }>({
    dx: 0,
    dy: 0,
  });
  const [veilActive, setVeilActive] = useState(false);

  const resetPortalState = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setActivePortalId(null);
    setPortalPhase("idle");
    setVeilActive(false);
    setZoomOffset({ dx: 0, dy: 0 });
  }, []);

  useEffect(() => {
    router.prefetch("/dream-levels");
    router.prefetch("/retro-games");
    router.prefetch("/nightmare");
    resetPortalState();

    // Ensure reveal elements inside #world remain visible when returning via Back button
    const sec = sectionRef.current;
    if (sec) {
      sec
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-visible"));
    }

    const onPageShowOrPop = () => {
      resetPortalState();
      if (sectionRef.current) {
        sectionRef.current
          .querySelectorAll<HTMLElement>("[data-reveal]")
          .forEach((el) => el.classList.add("is-visible"));
      }
    };

    window.addEventListener("pageshow", onPageShowOrPop);
    window.addEventListener("popstate", onPageShowOrPop);
    return () => {
      window.removeEventListener("pageshow", onPageShowOrPop);
      window.removeEventListener("popstate", onPageShowOrPop);
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [router, resetPortalState]);

  const computePortalCenterOffset = useCallback(
    (cardEl: HTMLElement): { dx: number; dy: number } => {
      // Measure both the fullscreen fixed veil and the portal card using getBoundingClientRect()
      // while temporarily neutralizing any active :hover / card CSS transform so the delta and
      // CSS translate unit ratio are 100% exact under html { zoom: 0.8 }.
      const veilRect = veilRef.current?.getBoundingClientRect();
      const vpCenterX =
        veilRect && veilRect.width > 0
          ? veilRect.left + veilRect.width * 0.5
          : window.innerWidth * 0.5;
      const vpCenterY =
        veilRect && veilRect.height > 0
          ? veilRect.top + veilRect.height * 0.5
          : window.innerHeight * 0.5;

      const prevTransition = cardEl.style.transition;
      const prevTransform = cardEl.style.transform;
      cardEl.style.transition = "none";
      cardEl.style.transform = "translate3d(0px, 0px, 0)";
      const r0 = cardEl.getBoundingClientRect();

      cardEl.style.transform = "translate3d(100px, 0px, 0)";
      const r1 = cardEl.getBoundingClientRect();

      cardEl.style.transform = prevTransform;
      cardEl.style.transition = prevTransition;
      // Force layout flush so the subsequent class addition transitions smoothly from hover state
      void cardEl.offsetWidth;

      const measuredRatio = (r1.left - r0.left) / 100;
      const fallbackRatio =
        cardEl.offsetWidth > 0 ? r0.width / cardEl.offsetWidth : 1;
      const pxPerCssUnit =
        Math.abs(measuredRatio) > 0.05
          ? measuredRatio
          : fallbackRatio > 0.05
            ? fallbackRatio
            : 1;

      const cardCenterX = r0.left + r0.width * 0.5;
      const cardCenterY = r0.top + r0.height * 0.5;

      return {
        dx: (vpCenterX - cardCenterX) / pxPerCssUnit,
        dy: (vpCenterY - cardCenterY) / pxPerCssUnit,
      };
    },
    []
  );

  const handleDreamPortalActivate = useCallback(
    (cardEl: HTMLElement) => {
      if (activePortalId) return;

      // Unlock Web Audio API synchronously inside the user's click gesture
      unlockShatteredAudio();

      const { dx, dy } = computePortalCenterOffset(cardEl);

      setZoomOffset({ dx, dy });
      setActivePortalId("dream-levels");

      // Phase 1 (0 - 460ms): Other portals disappear & Dream Levels portal moves to the center
      setPortalPhase("centering");

      // Phase 2 (460 - 860ms): Portal cell expands across the screen
      const t1 = window.setTimeout(() => {
        setPortalPhase("expanding");
        setVeilActive(true);
      }, 460);

      // Phase 3 (840ms+): Trigger in-game "Shattered Reality" WebGL Voronoi shader + game SFX
      const t2 = window.setTimeout(() => {
        triggerShatteredReality({
          sourceImageUrl: "/assets/dream-level-1.png",
          onMidTransition: () => {
            resetPortalState();
            router.push("/dream-levels");
            window.scrollTo({ top: 0, behavior: "instant" });
          },
        });
      }, 840);

      timersRef.current.push(t1, t2);
    },
    [router, activePortalId, resetPortalState, computePortalCenterOffset]
  );

  const handleRetroPortalActivate = useCallback(
    (cardEl: HTMLElement) => {
      if (activePortalId) return;

      unlockRetroAudio();

      const { dx, dy } = computePortalCenterOffset(cardEl);

      setZoomOffset({ dx, dy });
      setActivePortalId("retro-games");

      // Phase 1 (0 - 460ms): Other portals disappear & Retro Games portal moves to the center
      setPortalPhase("centering");

      // Phase 2 (460 - 820ms): Portal cell expands across the screen
      const t1 = window.setTimeout(() => {
        setPortalPhase("expanding");
        setVeilActive(true);
      }, 460);

      // Phase 3 (760ms+): Trigger Pixel Retro Arcade Transition
      const t2 = window.setTimeout(() => {
        triggerRetroTransition({
          mode: "pixel",
          onMidTransition: () => {
            resetPortalState();
            router.push("/retro-games");
            window.scrollTo({ top: 0, behavior: "instant" });
          },
        });
      }, 760);

      timersRef.current.push(t1, t2);
    },
    [router, activePortalId, resetPortalState, computePortalCenterOffset]
  );

  const handleNightmarePortalActivate = useCallback(
    (_cardEl: HTMLElement) => {
      if (activePortalId) return;

      // Unlock Web Audio API synchronously inside the user's click gesture
      unlockNightmareAudio();
      setActivePortalId("nightmare");

      // Immediately launch the full-screen, dead-center Breaker Sword Pull transition
      // (`VFX-42 Breaker Rift Pull` + `DeliverBreakerSword` + FMOD `The Breaker Rift Event.wav` & `The Breaker Equip-001.wav`)
      triggerNightmareRift({
        onMidTransition: () => {
          resetPortalState();
          router.push("/nightmare");
          window.scrollTo({ top: 0, behavior: "instant" });
        },
      });
    },
    [router, activePortalId, resetPortalState]
  );

  const enterLabel = PORTAL_ENTER_LABELS[locale] || PORTAL_ENTER_LABELS.en;

  return (
    <section
      ref={sectionRef}
      id="world"
      className={`lunoris-mural-section ${
        activePortalId ? "has-active-portal-zoom" : ""
      }`.trim()}
    >
      <div
        className="lunoris-mural-bg"
        style={{ backgroundImage: "url('/assets/elar-joy.jpg')" }}
        aria-hidden="true"
      />
      <div className="lunoris-mural-fade-top" aria-hidden="true" />
      <div className="lunoris-mural-fade-bottom" aria-hidden="true" />

      <div className="lunoris-wide-wrap lunoris-mural-center">
        <div
          className={`lunoris-heading-stack ${
            activePortalId ? "is-portal-heading-hidden" : ""
          }`.trim()}
          data-reveal="up"
        >
          <span className="lunoris-title-minor">{t.world.minor}</span>
          <h2 className="lunoris-title-major">{t.world.major}</h2>
          <div className="lunoris-center-bar" />
          <ScrollTextReveal
            text={t.world.body}
            className="lunoris-mural-body"
          />
        </div>

        <div className="lunoris-3tile-row lunoris-locations-grid">
          {WORLD_LOCATIONS_SHOWCASE.map((loc, idx) => {
            const locKey = loc.id as "dream-levels" | "retro-games" | "nightmare";
            const localizedLoc = t.world.locations[locKey];
            const isDreamPortal = loc.id === "dream-levels";
            const isRetroPortal = loc.id === "retro-games";
            const isNightmarePortal = loc.id === "nightmare";
            return (
              <WorldPortalCard
                key={loc.id}
                location={loc}
                index={idx}
                title={localizedLoc?.title ?? loc.title}
                desc={localizedLoc?.desc ?? loc.desc}
                isInteractivePortal={isDreamPortal}
                isMagneticPortal={isRetroPortal}
                isNightmarePortal={isNightmarePortal}
                enterLabel={enterLabel}
                onPortalActivate={
                  isDreamPortal
                    ? handleDreamPortalActivate
                    : isRetroPortal
                      ? handleRetroPortalActivate
                      : isNightmarePortal
                        ? handleNightmarePortalActivate
                        : undefined
                }
                activePhase={
                  activePortalId === loc.id ? portalPhase : "idle"
                }
                zoomOffset={activePortalId === loc.id ? zoomOffset : undefined}
                isHiddenSibling={Boolean(
                  activePortalId && activePortalId !== loc.id
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Fullscreen Dream Gate portal dissolve overlay during zoom-to-center transition */}
      <div
        ref={veilRef}
        className={`lunoris-portal-zoom-veil ${
          portalPhase !== "idle" ? "is-mounted" : ""
        } ${veilActive ? "is-blooming" : ""}`.trim()}
        aria-hidden="true"
      />
    </section>
  );
}
