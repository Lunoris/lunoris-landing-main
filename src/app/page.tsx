"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CHARACTERS_GALLERY, GAME_ROADMAP } from "@/data/gameData";
import { LUNORIS_NEWS } from "@/data/newsData";

const COMPANIONS_SHOWCASE = [
  {
    name: "Fareeda",
    title: "Sanity & Vision Anchor",
    species: "Scottish Fold Munchkin Cat",
    image: "/assets/fareeda-portrait.png",
    desc: "Glowing Arabic calligraphy of serenity ripples across her fur, projecting a warmth aura that suppresses Fear distortion and keeps shifting corridors stable.",
  },
  {
    name: "Kurtam",
    title: "Aerial Dream Mount",
    species: "Sugar Glider Companion",
    image: "/assets/kurtam-portrait.png",
    desc: "A tiny pocket glider from Lunora's waking life who transforms into a bear-sized aerial mount, riding thermal updrafts across shattered Dream Island chasms.",
  },
  {
    name: "Freddy",
    title: "Ambush Radar & Tracker",
    species: "Miniature Dachshund",
    image: "/assets/freddy-portrait.png",
    desc: "His collar and tail blaze with blue fire whenever unseen threats or buried Echo Shards are near, warning you seconds before Nightmare stalkers strike.",
  },
  {
    name: "Centric",
    title: "High-Altitude Spotter",
    species: "Blue & Gold Macaw",
    image: "/assets/centric-portrait.png",
    desc: "Soars above floating ruins on translucent wings, revealing secret memory doors through dense mist and marking boss weak points from the sky.",
  },
];

const ROW_ONE_CAST = CHARACTERS_GALLERY.slice(0, 5);
const ROW_TWO_CAST = CHARACTERS_GALLERY.slice(5, 10);

const ROADMAP_VISUALS = [
  "/assets/dream-level-1.png",
  "/assets/elar-joy.jpg",
  "/assets/fearclaw-boss.png",
  "/assets/elar-hope.jpg",
];

const WORLD_LOCATIONS_SHOWCASE = [
  {
    id: "dream-levels",
    title: "Dream Levels",
    image: "/assets/dream-level-1.png",
    isVideo: false,
    accentColor: "#22d3ee",
    strokeColor: "rgba(34, 211, 238, 0.95)",
    innerColor: "rgba(165, 243, 252, 0.72)",
    glowColor: "rgba(34, 211, 238, 0.48)",
    glowStrong: "rgba(6, 182, 212, 0.78)",
    desc: "Step through Lunora's School doors into all three Dream Levels—soaring across floating islands in The World That Answers, entering the living Van Gogh canvas of The Man in the Memory, and ascending toward Breakthrough's golden portal of hope.",
  },
  {
    id: "retro-games",
    title: "Retro Games",
    image: "/assets/car-level-poster.jpg",
    videoSrc: "/assets/car-level-loop.mp4",
    isVideo: true,
    accentColor: "#fbbf24",
    strokeColor: "rgba(251, 191, 36, 0.96)",
    innerColor: "rgba(254, 240, 138, 0.75)",
    glowColor: "rgba(251, 191, 36, 0.48)",
    glowStrong: "rgba(245, 158, 11, 0.78)",
    desc: "Cruise a 1967 Chevrolet Impala down an endless midnight highway between dreams, where family keepsakes and dashboard radio frequencies transform 3D memories into playable 2D retro arcade chapters.",
  },
  {
    id: "nightmare",
    title: "Nightmare",
    image: "/assets/fearclaw-boss.png",
    isVideo: false,
    accentColor: "#a855f7",
    strokeColor: "rgba(192, 132, 252, 0.96)",
    innerColor: "rgba(232, 121, 249, 0.75)",
    glowColor: "rgba(168, 85, 247, 0.52)",
    glowStrong: "rgba(147, 51, 234, 0.82)",
    desc: "Plunge through the fogged mirror or the basement's violet-indigo vortex into shifting Nightmare corridors—crossing magenta dissolve rifts to confront FearClaw or catch your breath at the Matchi Matchi sanctuary.",
  },
];

function CanvasStar({
  className,
  color = "#fbbf24",
}: {
  className: string;
  color?: string;
}) {
  return (
    <svg
      className={`canvas-fixed-star ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 2 L14.8 9.2 L22 12 L14.8 14.8 L12 22 L9.2 14.8 L2 12 L9.2 9.2 Z"
        fill={color}
      />
    </svg>
  );
}

function BrushstrokeButtonBg() {
  return (
    <svg
      className="canvas-brush-btn-svg"
      viewBox="0 0 460 116"
      aria-hidden="true"
    >
      <defs>
        {/* Deep velvety twilight-purple pill fill */}
        <linearGradient id="moonPillFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d1d54" />
          <stop offset="48%" stopColor="#1e133a" />
          <stop offset="100%" stopColor="#150d2a" />
        </linearGradient>

        {/* Pill rim gradient: bright near the left crescent, subtle violet around the capsule */}
        <linearGradient id="moonPillStroke" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="rgba(233, 213, 255, 0.9)" />
          <stop offset="28%" stopColor="rgba(192, 132, 252, 0.48)" />
          <stop offset="70%" stopColor="rgba(168, 85, 247, 0.28)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0.22)" />
        </linearGradient>

        {/* Crescent moon translucent lavender-purple fill */}
        <linearGradient id="crescentFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(243, 232, 255, 0.42)" />
          <stop offset="50%" stopColor="rgba(216, 180, 254, 0.28)" />
          <stop offset="100%" stopColor="rgba(192, 132, 252, 0.4)" />
        </linearGradient>

        {/* Crescent moon bright glowing rim */}
        <linearGradient id="crescentRim" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#faf5ff" />
          <stop offset="50%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#d8b4fe" />
        </linearGradient>

        {/* Soft radial moonlight glow behind the Steam icon */}
        <radialGradient id="iconMoonGlow" cx="20%" cy="50%" r="32%">
          <stop offset="0%" stopColor="rgba(233, 213, 255, 0.34)" />
          <stop offset="55%" stopColor="rgba(168, 85, 247, 0.14)" />
          <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
        </radialGradient>

        <filter id="crescentGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main capsule / pill body */}
      <rect
        x="18"
        y="8"
        width="430"
        height="100"
        rx="50"
        ry="50"
        fill="url(#moonPillFill)"
        stroke="url(#moonPillStroke)"
        strokeWidth="1.5"
      />

      {/* Ambient radial glow around the left Steam icon */}
      <rect
        x="18"
        y="8"
        width="430"
        height="100"
        rx="50"
        ry="50"
        fill="url(#iconMoonGlow)"
      />

      {/* Glowing Crescent Moon hugging the left semicircle of the pill */}
      <path
        d="M 68 8 A 62 50 0 0 0 68 108 A 50 50 0 0 1 68 8 Z"
        fill="url(#crescentFill)"
        stroke="url(#crescentRim)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        filter="url(#crescentGlow)"
      />
    </svg>
  );
}

function AwardBrushWash() {
  return (
    <>
      <svg
        className="canvas-square-frame-svg"
        viewBox="0 0 800 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Outer crisp square/rectangular gilded frame matching site cards */}
        <rect
          x="6"
          y="6"
          width="788"
          height="168"
          fill="none"
          stroke="rgba(251, 191, 36, 0.72)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner gallery mat line */}
        <rect
          x="14"
          y="14"
          width="772"
          height="152"
          fill="none"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* Four square corner ornamental L-brackets */}
        <path
          d="M6,34 L6,6 L34,6 M766,6 L794,6 L794,34 M794,146 L794,174 L766,174 M34,174 L6,174 L6,146"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="square"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-sq-tl" />
      <CanvasStar className="star-sq-tr" />
      <CanvasStar className="star-sq-br" />
      <CanvasStar className="star-sq-bl" />
    </>
  );
}

function ArchedCanvasFrame({
  strokeColor = "rgba(251, 191, 36, 0.85)",
  innerColor = "rgba(255, 255, 255, 0.35)",
  accentColor = "#fbbf24",
}: {
  strokeColor?: string;
  innerColor?: string;
  accentColor?: string;
}) {
  return (
    <>
      <svg
        className="canvas-arched-frame-svg"
        viewBox="0 0 400 520"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Constant pulsing neon portal halo along the arched perimeter */}
        <path
          className="portal-arch-neon-halo"
          d="M14,210 C14,88 94,14 200,14 C306,14 386,88 386,210 L386,482 C386,498 374,506 356,506 L44,506 C26,506 14,498 14,482 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth="5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Subtle continuous base track along outer arch */}
        <path
          d="M14,210 C14,88 94,14 200,14 C306,14 386,88 386,210 L386,482 C386,498 374,506 356,506 L44,506 C26,506 14,498 14,482 Z"
          fill="none"
          stroke={strokeColor}
          strokeOpacity="0.28"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
        {/* Outer animated glowing dashed segments flowing around the card contour */}
        <path
          className="portal-arch-flow-outer"
          d="M14,210 C14,88 94,14 200,14 C306,14 386,88 386,210 L386,482 C386,498 374,506 356,506 L44,506 C26,506 14,498 14,482 Z"
          pathLength="1000"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="65 22 110 26 42 18 95 22"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner animated glowing dashed segments flowing in reverse along the inner arch contour */}
        <path
          className="portal-arch-flow-inner"
          d="M24,212 C24,98 100,26 200,26 C300,26 376,98 376,212 L376,474 C376,488 366,495 350,495 L50,495 C34,495 24,488 24,474 Z"
          pathLength="1000"
          fill="none"
          stroke={innerColor}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeDasharray="48 26 84 22 34 22 78 26"
          vectorEffect="non-scaling-stroke"
        />
        {/* Bottom corner painterly flourishes */}
        <path
          d="M18,465 C18,492 26,500 52,500 M382,465 C382,492 374,500 348,500"
          fill="none"
          stroke={accentColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-arch-crown" color={accentColor} />
    </>
  );
}

function DeckledCanvasFrame() {
  return (
    <>
      <svg
        className="canvas-deckled-frame-svg"
        viewBox="0 0 500 340"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Organic brushstroke perimeter */}
        <path
          d="M36,12 C164,6 348,8 472,16 C486,18 492,30 490,54 C494,138 491,226 486,304 C484,322 470,329 446,328 C312,333 168,331 28,324 C14,322 8,310 10,286 C6,196 9,104 14,34 C16,18 24,13 36,12 Z"
          fill="none"
          stroke="rgba(251, 191, 36, 0.52)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="210 10 130 8 190 12"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner sketchy artist pencil/chalk guide line */}
        <path
          d="M42,22 C178,17 340,18 464,25 C476,26 480,36 479,58 C481,142 479,224 475,296 C473,310 462,317 440,317 C308,321 170,319 36,314 C24,312 19,302 20,280 C18,194 20,108 24,42 C25,28 32,23 42,22 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-card-tl" />
      <CanvasStar className="star-card-br" />
    </>
  );
}

function SquareCompanionFrame() {
  return (
    <>
      <svg
        className="canvas-square-frame-svg"
        viewBox="0 0 400 640"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Outer crisp square/rectangular gilded frame */}
        <rect
          x="10"
          y="10"
          width="380"
          height="620"
          fill="none"
          stroke="rgba(251, 191, 36, 0.72)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner gallery mat line */}
        <rect
          x="20"
          y="20"
          width="360"
          height="600"
          fill="none"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* Four square corner ornamental L-brackets */}
        <path
          d="M10,42 L10,10 L42,10 M358,10 L390,10 L390,42 M390,598 L390,630 L358,630 M42,630 L10,630 L10,598"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3.2"
          strokeLinecap="square"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-sq-tl" />
      <CanvasStar className="star-sq-tr" />
      <CanvasStar className="star-sq-br" />
      <CanvasStar className="star-sq-bl" />
    </>
  );
}

export default function LunorisLandingPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const roadmapTimelineRef = useRef<HTMLDivElement | null>(null);
  const navBtnSlotRef = useRef<HTMLDivElement | null>(null);
  const steamBtnRef = useRef<HTMLAnchorElement | null>(null);
  const finalCtaSlotRef = useRef<HTMLDivElement | null>(null);
  const [activeCompanion, setActiveCompanion] = useState(0);
  const [companionPaused, setCompanionPaused] = useState(false);
  const [roadmapStep, setRoadmapStep] = useState(0);
  const [newsOffset, setNewsOffset] = useState(0);

  const visibleNews = Array.from({ length: 4 }, (_, i) => {
    const idx = (newsOffset + i) % LUNORIS_NEWS.length;
    return LUNORIS_NEWS[idx];
  });

  const handlePrevNews = () => {
    setNewsOffset(
      (prev) => (prev - 1 + LUNORIS_NEWS.length) % LUNORIS_NEWS.length
    );
  };

  const handleNextNews = () => {
    setNewsOffset((prev) => (prev + 1) % LUNORIS_NEWS.length);
  };

  // Auto-cycle the 4 companion pillars every 3.8s unless hovered
  useEffect(() => {
    if (companionPaused) return;
    const timer = window.setInterval(() => {
      setActiveCompanion((prev) => (prev + 1) % COMPANIONS_SHOWCASE.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, [companionPaused]);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    elements.forEach((el) => observer.observe(el));

    let flightProgress = 0;
    let targetFlight = 0;
    let flightRafId: number | null = null;
    let lastTime = performance.now();

    const applySteamFlight = (p: number) => {
      const btn = steamBtnRef.current;
      const navSlot = navBtnSlotRef.current;
      const ctaSlot = finalCtaSlotRef.current;
      if (!btn || !navSlot || !ctaSlot) return;

      if (p <= 0.001) {
        btn.style.setProperty("--btn-fly-x", "0px");
        btn.style.setProperty("--btn-fly-y", "0px");
        btn.style.setProperty("--btn-fly-scale", "1");
        btn.style.setProperty("--btn-fly-rot", "0deg");
        btn.style.setProperty("--cta-morph", "0");
        btn.classList.remove(
          "is-magic-flying",
          "is-magic-landed",
          "is-cta-expanded"
        );
        return;
      }

      const navRect = navSlot.getBoundingClientRect();
      const ctaRect = ctaSlot.getBoundingClientRect();

      const startX = navRect.left + navRect.width / 2;
      const startY = navRect.top + navRect.height / 2;
      const endX = ctaRect.left + ctaRect.width / 2;
      const rawEndY = ctaRect.top + ctaRect.height / 2;
      const endY = Math.min(
        window.innerHeight - 68,
        Math.max(startY + 120, rawEndY)
      );

      // Comfortable margin from the right edge (aligned with the header right slot, ~110-140px from edge)
      const minRightMargin = Math.max(105, window.innerWidth * 0.06);
      const railX = Math.min(startX, window.innerWidth - minRightMargin);

      // Silky-smooth sine ease-in-out parameter u in [0, 1]
      const u = 0.5 - 0.5 * Math.cos(p * Math.PI);
      const inv = 1 - u;

      // Single continuous Cubic Bezier curve:
      // P0 = (startX, startY)
      // P1 = (railX, startY + (endY - startY) * 0.65)
      // P2 = (railX, endY)
      // P3 = (endX, endY)
      const p1y = startY + (endY - startY) * 0.65;
      const currentX =
        inv * inv * inv * startX +
        3 * inv * inv * u * railX +
        3 * inv * u * u * railX +
        u * u * u * endX;
      const currentY =
        inv * inv * inv * startY +
        3 * inv * inv * u * p1y +
        3 * inv * u * u * endY +
        u * u * u * endY;

      // Smoothstep morph between solo Steam icon and full Ethereal Moonlight button
      const rawMorph = Math.max(0, Math.min(1, (u - 0.48) / 0.48));
      const ctaMorph = rawMorph * rawMorph * (3 - 2 * rawMorph);

      const dx = currentX - startX;
      const dy = currentY - startY;
      const arc = Math.sin(u * Math.PI);
      const dir = targetFlight === 1 ? 1 : -1;
      const scale = 1 + arc * 0.08;
      const rot = Math.sin(u * Math.PI) * (-2.2 * dir);

      btn.style.setProperty("--btn-fly-x", `${dx.toFixed(2)}px`);
      btn.style.setProperty("--btn-fly-y", `${dy.toFixed(2)}px`);
      btn.style.setProperty("--btn-fly-scale", `${scale.toFixed(3)}`);
      btn.style.setProperty("--btn-fly-rot", `${rot.toFixed(2)}deg`);
      btn.style.setProperty("--cta-morph", `${ctaMorph.toFixed(3)}`);

      const isFlying = p > 0.015 && p < 0.985;
      const isLanded = p >= 0.985;
      btn.classList.toggle("is-magic-flying", isFlying);
      btn.classList.toggle("is-magic-landed", isLanded);
      btn.classList.toggle("is-cta-expanded", u > 0.5);
    };

    const stepFlight = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const speed = 1 / 1.12; // 1.12s smooth magical flight duration
      if (Math.abs(targetFlight - flightProgress) > 0.001) {
        if (flightProgress < targetFlight) {
          flightProgress = Math.min(targetFlight, flightProgress + dt * speed);
        } else {
          flightProgress = Math.max(targetFlight, flightProgress - dt * speed);
        }
        applySteamFlight(flightProgress);
        flightRafId = window.requestAnimationFrame(stepFlight);
      } else {
        flightProgress = targetFlight;
        applySteamFlight(flightProgress);
        flightRafId = null;
      }
    };

    const startFlightLoop = () => {
      if (flightRafId === null) {
        lastTime = performance.now();
        flightRafId = window.requestAnimationFrame(stepFlight);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (heroRef.current) {
            const y = Math.min(window.scrollY, 800);
            heroRef.current.style.setProperty("--hero-scroll", `${y}`);
          }

          if (roadmapTimelineRef.current) {
            const rect = roadmapTimelineRef.current.getBoundingClientRect();
            const triggerPoint = window.innerHeight * 0.68;
            const rawProgress = (triggerPoint - rect.top) / Math.max(1, rect.height);
            const clamped = Math.max(0, Math.min(1, rawProgress));
            roadmapTimelineRef.current.style.setProperty(
              "--roadmap-progress",
              `${clamped}`
            );

            // Determine how many milestones the scroll beam has reached
            const stepIndex = Math.min(
              GAME_ROADMAP.length - 1,
              Math.max(0, Math.floor(clamped * GAME_ROADMAP.length))
            );
            setRoadmapStep(clamped <= 0.02 ? 0 : stepIndex);
          }

          if (finalCtaSlotRef.current) {
            const ctaRect = finalCtaSlotRef.current.getBoundingClientRect();
            const shouldFlyDown = ctaRect.top < window.innerHeight * 0.88;
            const nextTarget = shouldFlyDown ? 1 : 0;
            if (nextTarget !== targetFlight) {
              targetFlight = nextTarget;
              startFlightLoop();
            } else if (flightProgress > 0.001 && flightRafId === null) {
              // Keep button locked to the bottom slot while scrolling
              applySteamFlight(flightProgress);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (flightRafId !== null) {
        window.cancelAnimationFrame(flightRafId);
      }
    };
  }, ["steam-flight-v4"]);

  return (
    <div className="lunoris-page">
      {/* OVERLAID TRANSPARENT TOP HEADER */}
      <header className="lunoris-header">
        <div className="lunoris-header-inner">
          <div className="lunoris-header-left">
            <a href="#top" className="lunoris-logo-link">
              <img
                src="/assets/logo-wordmark.svg"
                alt="Lunoris: Piece of Mind"
                className="lunoris-logo-img"
              />
            </a>
            <nav className="lunoris-nav">
              <a href="#news">Latest News</a>
              <a href="#world">The World</a>
              <a href="#companions">Companions</a>
              <a href="#characters">Characters</a>
              <a href="#roadmap">Roadmap</a>
            </nav>
          </div>

          <div className="lunoris-header-right">
            <div ref={navBtnSlotRef} className="lunoris-steam-nav-slot">
              <a
                ref={steamBtnRef}
                href="https://store.steampowered.com/app/3053030/Lunoris/"
                target="_blank"
                rel="noopener"
                aria-label="Play Free Demo and Wishlist on Steam"
                className="lunoris-steam-btn lunoris-steam-btn-nav"
              >
                <span className="steam-magic-sparkles" aria-hidden="true">
                  <CanvasStar className="magic-sparkle sp-1" color="#fbbf24" />
                  <CanvasStar className="magic-sparkle sp-2" color="#e879f9" />
                  <CanvasStar className="magic-sparkle sp-3" color="#38bdf8" />
                  <CanvasStar className="magic-sparkle sp-4" color="#fbbf24" />
                  <CanvasStar className="magic-sparkle sp-5" color="#c084fc" />
                  <CanvasStar className="magic-sparkle sp-6" color="#fde68a" />
                </span>

                {/* Clean white transparent Steam logo in top header & during right-edge flight */}
                <svg
                  className="steam-nav-solo-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
                </svg>

                {/* Larger full brushstroke Steam CTA button revealed at the bottom of the page */}
                <div className="steam-cta-full-body">
                  <BrushstrokeButtonBg />
                  <svg
                    className="steam-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
                  </svg>
                  <div className="steam-btn-text">
                    <span className="steam-btn-main">Play Free Demo</span>
                    <span className="steam-btn-sub">Wishlist on Steam</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main id="top">
        {/* =====================================================
            1. HERO VIDEO + CENTERED WIDE FLOATING LAUREL AWARD
           ===================================================== */}
        <section className="lunoris-hero" ref={heroRef}>
          <div className="lunoris-hero-video-bg" aria-hidden="true">
            <video
              className="lunoris-hero-video"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/assets/dream-level-1.png"
            >
              <source src="/assets/PressAnyKeyVideo.mp4" type="video/mp4" />
            </video>
            <div className="lunoris-hero-vignette" />
            <div className="lunoris-hero-bottom-fade" />
          </div>

          <div className="lunoris-wide-wrap lunoris-hero-foreground">
            <div className="lunoris-hero-clean-layout">
              <div className="lunoris-hero-quote-block">
                <h1 className="lunoris-hero-quote">
                  &ldquo;Some dreams aren&apos;t sleep.
                  <br />
                  <span>They&apos;re worlds you can&apos;t leave.&rdquo;</span>
                </h1>

                <div className="lunoris-quote-source">
                  LUNORIS: PIECE OF MIND · PC, PLAYSTATION 5 &amp; XBOX SERIES X|S
                </div>

                <div className="lunoris-divider-bar" />
              </div>

              <div className="lunoris-hero-actions-bar lunoris-hero-award-center-row">
                {/* CENTERED & WIDE FLOATING GAMESCOM VAN GOGH AWARD CREST */}
                <div id="awards" className="lunoris-single-award-crest">
                  <AwardBrushWash />
                  <svg
                    className="lunoris-laurel-icon"
                    viewBox="0 0 64 120"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M54 110C28 96 14 68 18 28C20 14 28 6 36 4C26 16 24 38 30 62C36 82 46 98 58 106"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M22 24C12 22 8 14 12 8C18 12 22 18 22 24ZM20 44C8 40 6 30 10 24C18 28 20 36 20 44ZM24 66C12 62 8 50 14 44C22 50 24 58 24 66ZM32 86C20 84 14 74 20 66C28 72 32 80 32 86Z"
                      fill="currentColor"
                    />
                  </svg>
                  <div className="lunoris-laurel-copy">
                    <span className="lunoris-laurel-kicker">
                      WINNER · INDIE CASTLE AWARDS · GAMESCOM COLOGNE 2026
                    </span>
                    <h3>The &ldquo;Van Gogh&rdquo; Award</h3>
                    <p>&ldquo;For the game that should be in an art museum&rdquo;</p>
                  </div>
                  <svg
                    className="lunoris-laurel-icon lunoris-laurel-flip"
                    viewBox="0 0 64 120"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M54 110C28 96 14 68 18 28C20 14 28 6 36 4C26 16 24 38 30 62C36 82 46 98 58 106"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M22 24C12 22 8 14 12 8C18 12 22 18 22 24ZM20 44C8 40 6 30 10 24C18 28 20 36 20 44ZM24 66C12 62 8 50 14 44C22 50 24 58 24 66ZM32 86C20 84 14 74 20 66C28 72 32 80 32 86Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            1.5 LATEST NEWS SECTION (OPENS FULL NEWS PAGE ON CLICK)
           ===================================================== */}
        <section id="news" className="lunoris-news-section">
          <div className="lunoris-wide-wrap">
            {/* Ornamental Diamond Divider + LATEST NEWS Heading */}
            <div className="lunoris-heading-stack lunoris-news-header" data-reveal="up">
              <div className="lunoris-ornament-divider" aria-hidden="true">
                <span className="ornament-line ornament-line-left" />
                <span className="ornament-diamond ornament-diamond-sm" />
                <span className="ornament-diamond ornament-diamond-lg">
                  <span className="ornament-diamond-core" />
                </span>
                <span className="ornament-diamond ornament-diamond-sm" />
                <span className="ornament-line ornament-line-right" />
              </div>
              <h2 className="lunoris-title-major lunoris-news-heading">
                Latest News
              </h2>
            </div>

            {/* 4-Card Painterly News Stage with Left/Right Carousel Controls */}
            <div className="lunoris-news-stage" data-reveal="up">
              <button
                type="button"
                onClick={handlePrevNews}
                className="lunoris-news-arrow-btn arrow-prev"
                aria-label="Previous news articles"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M19 12H5M12 19l-7-7 7-7"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="lunoris-news-grid">
                {visibleNews.map((article, idx) => (
                  <Link
                    href={`/news/${article.slug}`}
                    key={`${article.slug}-${newsOffset}-${idx}`}
                    className="lunoris-news-card"
                    style={
                      {
                        "--news-stagger": `${idx * 85}ms`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="lunoris-canvas-weave" aria-hidden="true" />
                    <DeckledCanvasFrame />

                    <div className="lunoris-news-media">
                      {article.isVideo && article.videoSrc ? (
                        <video
                          className="lunoris-news-thumb"
                          src={article.videoSrc}
                          poster={article.image}
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="lunoris-news-thumb"
                        />
                      )}
                      <div className="lunoris-news-media-shade" />
                      <span className="news-corner-tag">{article.category}</span>

                      {article.isVideo && (
                        <div
                          className="lunoris-news-play-circle"
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="lunoris-news-body">
                      <div className="lunoris-news-meta">
                        <span>{article.date}</span>
                        <span className="news-meta-sep">|</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="lunoris-news-title">{article.title}</h3>
                      <p className="lunoris-news-excerpt">{article.excerpt}</p>

                      <div className="lunoris-news-footer">
                        <span className="lunoris-news-cta">
                          {article.ctaLabel}
                          <span className="lunoris-news-cta-line" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextNews}
                className="lunoris-news-arrow-btn arrow-next"
                aria-label="Next news articles"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Bottom Centered ALL NEWS Button */}
            <div className="lunoris-news-bottom-bar" data-reveal="up">
              <Link href="/news" className="lunoris-all-news-btn">
                <BrushstrokeButtonBg />
                <span>All News</span>
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            2. FULL-BLEED MURAL: "BREAK THE ENDLESS DREAM LOOP" + ARCHED LOCATION PORTALS
           ===================================================== */}
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
                From the lavender-lit sanctuary of Lunora&apos;s House, step through stroked Dream Doors, swirling Van Gogh canvases, the sky-cyan Well of Elar, and deep-indigo Nightmare rifts—each realm bound by its own living portal spectrum.
              </p>
            </div>

            {/* Arched Painter's Canvases / Living Location Portals */}
            <div className="lunoris-3tile-row lunoris-locations-grid">
              {WORLD_LOCATIONS_SHOWCASE.map((loc, idx) => (
                <article
                  key={loc.id}
                  className={`lunoris-media-tile ${
                    idx % 3 === 1
                      ? "canvas-portal-center"
                      : idx % 3 === 0
                        ? "canvas-portal-left"
                        : "canvas-portal-right"
                  }`}
                  data-reveal="up"
                  style={
                    {
                      "--stagger": idx % 3,
                      "--portal-accent": loc.accentColor,
                      "--portal-glow": loc.glowColor,
                      "--portal-glow-strong": loc.glowStrong,
                    } as React.CSSProperties
                  }
                >
                  {loc.isVideo && loc.videoSrc ? (
                    <video
                      className="lunoris-tile-bg"
                      src={loc.videoSrc}
                      poster={loc.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={loc.image}
                      alt={loc.title}
                      className="lunoris-tile-bg"
                    />
                  )}
                  <div className="lunoris-canvas-weave" aria-hidden="true" />
                  <div className="lunoris-tile-shade" />
                  <ArchedCanvasFrame
                    strokeColor={loc.strokeColor}
                    innerColor={loc.innerColor}
                    accentColor={loc.accentColor}
                  />
                  <div className="lunoris-tile-caption">
                    <h3>{loc.title}</h3>
                    <div className="lunoris-tile-divider" aria-hidden="true">
                      <span className="lunoris-tile-divider-gem" />
                    </div>
                    <p>{loc.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            3. COMPANIONS: SQUARE / RECTANGULAR FRAMED GUARDIANS
           ===================================================== */}
        <section id="companions" className="lunoris-companions-section">
          <div className="lunoris-wide-wrap">
            <div className="lunoris-heading-stack" data-reveal="up">
              <span className="lunoris-title-minor">
                Four Guardians of the Subconscious
              </span>
              <h2 className="lunoris-title-major">Luminous Companions</h2>
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
                return (
                  <article
                    key={pet.name}
                    className={`lunoris-pillar ${isExpanded ? "is-active" : ""}`}
                    onMouseEnter={() => setActiveCompanion(idx)}
                    onClick={() => setActiveCompanion(idx)}
                  >
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="lunoris-pillar-img"
                    />
                    <div className="lunoris-canvas-weave" aria-hidden="true" />
                    <div className="lunoris-pillar-wash" />
                    <div className="lunoris-pillar-shade" />
                    <SquareCompanionFrame />

                    <div className="lunoris-pillar-content">
                      <span className="lunoris-pillar-sub">
                        {pet.species} · {pet.title}
                      </span>
                      <h3 className="lunoris-pillar-name">{pet.name}</h3>
                      <p className="lunoris-pillar-desc">{pet.desc}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            4. "WHO WILL WALK BESIDE YOU?" WATERCOLOR CANVAS GALLERY
           ===================================================== */}
        <section id="characters" className="lunoris-heroes-section">
          <div className="lunoris-wide-wrap lunoris-mural-center">
            <div className="lunoris-heading-stack" data-reveal="up">
              <span className="lunoris-title-minor">
                Echoes of Wahm Lane
              </span>
              <h2 className="lunoris-title-major">Who Will Walk Beside You?</h2>
              <div className="lunoris-center-bar" />
              <p className="lunoris-mural-body">
                Meet the characters, childhood memories, and guardians who walk beside Lunora across her journey.
              </p>
            </div>
          </div>

          <div className="lunoris-hero-wall" data-reveal="scale">
            <div className="lunoris-wall-row lunoris-row-left">
              {[...ROW_ONE_CAST, ...ROW_ONE_CAST, ...ROW_ONE_CAST].map(
                (char, idx) => (
                  <div
                    key={`r1-${char.name}-${idx}`}
                    className="lunoris-hero-tile"
                    style={
                      { "--tile-accent": char.accent } as React.CSSProperties
                    }
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
                )
              )}
            </div>

            <div className="lunoris-wall-row lunoris-row-right">
              {[...ROW_TWO_CAST, ...ROW_TWO_CAST, ...ROW_TWO_CAST].map(
                (char, idx) => (
                  <div
                    key={`r2-${char.name}-${idx}`}
                    className="lunoris-hero-tile"
                    style={
                      { "--tile-accent": char.accent } as React.CSSProperties
                    }
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
                )
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            5. SCROLL-DRIVEN CENTER-LINE ROADMAP & FINAL BANNER
           ===================================================== */}
        <section id="roadmap" className="lunoris-roadmap-section">
          <div className="lunoris-wide-wrap">
            <div className="lunoris-heading-stack" data-reveal="up">
              <span className="lunoris-title-minor">The Path to Awakening</span>
              <h2 className="lunoris-title-major">World &amp; Release Roadmap</h2>
              <div className="lunoris-center-bar" />
            </div>

            <div className="lunoris-center-timeline" ref={roadmapTimelineRef}>
              {/* Central Vertical Spine & Live Scroll Beam */}
              <div className="lunoris-timeline-spine" aria-hidden="true">
                <div className="lunoris-timeline-track" />
                <div className="lunoris-timeline-fill">
                  <span className="lunoris-timeline-spark" />
                </div>
              </div>

              {GAME_ROADMAP.map((item, idx) => {
                const isLeft = idx % 2 === 0;
                const isReached = idx <= roadmapStep;
                const isCurrent = idx === roadmapStep;
                const bgImage = ROADMAP_VISUALS[idx % ROADMAP_VISUALS.length];

                return (
                  <div
                    key={item.phase}
                    className={`lunoris-timeline-row ${
                      isLeft ? "row-left" : "row-right"
                    } ${isReached ? "is-reached" : ""} ${
                      isCurrent ? "is-current" : ""
                    }`}
                  >
                    {/* Opposite-side Date & Phase Counterbalance */}
                    <div className="lunoris-timeline-meta">
                      <span className="lunoris-timeline-phase">{item.phase}</span>
                      <div className="lunoris-timeline-date">{item.date}</div>
                      <span
                        className={`lunoris-roadmap-status status-${item.status}`}
                      >
                        {item.highlight}
                      </span>
                    </div>

                    {/* Center Line Node */}
                    <div className="lunoris-timeline-axis" aria-hidden="true">
                      <div
                        className={`lunoris-timeline-node status-${item.status}`}
                      >
                        <span className="lunoris-timeline-node-core" />
                      </div>
                    </div>

                    {/* Milestone Painted Canvas Card */}
                    <article
                      className={`lunoris-timeline-card status-${item.status}`}
                    >
                      <div
                        className="lunoris-timeline-card-bg"
                        style={{ backgroundImage: `url('${bgImage}')` }}
                        aria-hidden="true"
                      />
                      <div className="lunoris-canvas-weave" aria-hidden="true" />
                      <div
                        className="lunoris-timeline-card-shade"
                        aria-hidden="true"
                      />
                      <DeckledCanvasFrame />
                      <div className="lunoris-timeline-card-body">
                        <div className="lunoris-timeline-card-mobile-meta">
                          <span className="lunoris-roadmap-phase">
                            {item.phase}
                          </span>
                          <span
                            className={`lunoris-roadmap-status status-${item.status}`}
                          >
                            {item.highlight}
                          </span>
                        </div>
                        <div className="lunoris-timeline-card-mobile-date">
                          {item.date}
                        </div>
                        <h3 className="lunoris-roadmap-title">{item.title}</h3>
                        <p className="lunoris-roadmap-desc">{item.desc}</p>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="lunoris-final-cta">
          <div
            className="lunoris-mural-bg"
            style={{ backgroundImage: "url('/assets/elar-hope.jpg')" }}
            aria-hidden="true"
          />
          <div className="lunoris-mural-fade-top" aria-hidden="true" />
          <div className="lunoris-mural-fade-bottom" aria-hidden="true" />

          <div className="lunoris-wide-wrap lunoris-final-cta-inner">
            <div className="lunoris-final-cta-headings">
              <span className="lunoris-title-minor">Step Inside the Dream</span>
              <h2 className="lunoris-title-major">Find Your Way Back</h2>
              <div
                className="lunoris-center-bar"
                style={{ margin: "1.5rem auto 2.6rem" }}
              />
            </div>
            <div
              ref={finalCtaSlotRef}
              className="lunoris-steam-cta-landing-slot"
              aria-hidden="true"
            />
          </div>
        </section>
      </main>

      <footer className="lunoris-footer">
        <div className="lunoris-wide-wrap lunoris-footer-inner">
          <img
            src="/assets/logo-wordmark.svg"
            alt="Lunoris: Piece of Mind"
            className="lunoris-footer-logo"
          />
          <p className="lunoris-footer-legal">
            Lunoris and the Lunoris logo are trademarks and/or registered trademarks. 2026 Lunoris: Piece of Mind, all rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
