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

function BrushstrokeButtonBg() {
  return (
    <svg
      className="canvas-brush-btn-svg"
      viewBox="0 0 420 110"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brushFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(52, 28, 88, 0.94)" />
          <stop offset="52%" stopColor="rgba(26, 16, 48, 0.96)" />
          <stop offset="100%" stopColor="rgba(68, 34, 96, 0.92)" />
        </linearGradient>
        <linearGradient id="brushStrokeRim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.25)" />
          <stop offset="50%" stopColor="rgba(251, 191, 36, 0.92)" />
          <stop offset="100%" stopColor="rgba(232, 121, 249, 0.55)" />
        </linearGradient>
      </defs>
      {/* Organic tapered oil-paint brushstroke shape */}
      <path
        d="M22,20 C78,8 190,11 334,13 C378,14 404,22 412,37 C418,49 406,66 414,78 C402,91 368,98 310,97 C194,96 86,101 28,92 C10,89 4,74 11,59 C5,45 9,25 22,20 Z"
        fill="url(#brushFillGrad)"
      />
      {/* Hand-painted gold brushstroke outline */}
      <path
        d="M18,24 C86,10 218,12 384,17 C404,19 412,36 407,56 C413,75 396,92 356,94 C216,99 88,96 24,89 C9,85 8,66 14,52 C7,38 10,27 18,24 Z"
        fill="none"
        stroke="url(#brushStrokeRim)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="260 12 140 8"
      />
      {/* Subtle inner palette-knife highlight */}
      <path
        d="M38,26 C130,19 260,20 374,25"
        fill="none"
        stroke="rgba(255, 243, 196, 0.38)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Astral star accents */}
      <path
        d="M26,55 L30,51 L34,55 L30,59 Z M390,55 L394,51 L398,55 L394,59 Z"
        fill="#fbbf24"
        opacity="0.85"
      />
    </svg>
  );
}

function AwardBrushWash() {
  return (
    <svg
      className="canvas-award-wash-svg"
      viewBox="0 0 560 130"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="awardWashGrad" cx="50%" cy="50%" r="54%">
          <stop offset="0%" stopColor="rgba(58, 36, 18, 0.72)" />
          <stop offset="65%" stopColor="rgba(24, 16, 38, 0.52)" />
          <stop offset="100%" stopColor="rgba(10, 7, 18, 0)" />
        </radialGradient>
      </defs>
      <path
        d="M34,26 C140,8 418,10 526,28 C552,42 548,88 518,102 C404,118 152,116 38,100 C10,86 12,40 34,26 Z"
        fill="url(#awardWashGrad)"
      />
      <path
        d="M72,22 C196,12 364,12 488,22"
        stroke="rgba(251, 191, 36, 0.48)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M88,108 C206,116 354,116 472,108"
        stroke="rgba(251, 191, 36, 0.48)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function ArchedCanvasFrame() {
  return (
    <svg
      className="canvas-arched-frame-svg"
      viewBox="0 0 400 520"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Outer hand-painted arched gallery canvas stroke */}
      <path
        d="M14,210 C14,88 94,14 200,14 C306,14 386,88 386,210 L386,482 C386,498 374,506 356,506 L44,506 C26,506 14,498 14,482 Z"
        fill="none"
        stroke="rgba(251, 191, 36, 0.62)"
        strokeWidth="2.2"
        strokeDasharray="180 8 95 6 240 10"
      />
      {/* Inner delicate canvas stretcher line */}
      <path
        d="M24,212 C24,98 100,26 200,26 C300,26 376,98 376,212 L376,474 C376,488 366,495 350,495 L50,495 C34,495 24,488 24,474 Z"
        fill="none"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1.1"
      />
      {/* Crown celestial four-point star */}
      <path
        d="M200,4 L204,13 L213,17 L204,21 L200,30 L196,21 L187,17 L196,13 Z"
        fill="#fbbf24"
      />
      {/* Bottom corner painterly flourishes */}
      <path
        d="M18,465 C18,492 26,500 52,500 M382,465 C382,492 374,500 348,500"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DeckledCanvasFrame() {
  return (
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
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="210 10 130 8 190 12"
      />
      {/* Inner sketchy artist pencil/chalk guide line */}
      <path
        d="M42,22 C178,17 340,18 464,25 C476,26 480,36 479,58 C481,142 479,224 475,296 C473,310 462,317 440,317 C308,321 170,319 36,314 C24,312 19,302 20,280 C18,194 20,108 24,42 C25,28 32,23 42,22 Z"
        fill="none"
        stroke="rgba(255, 255, 255, 0.18)"
        strokeWidth="1"
      />
      {/* Top-left & bottom-right painter's star marks */}
      <path
        d="M26,26 L30,18 L34,26 L42,30 L34,34 L30,42 L26,34 L18,30 Z"
        fill="#fbbf24"
        opacity="0.85"
      />
      <path
        d="M468,302 L471,295 L474,302 L481,305 L474,308 L471,315 L468,308 L461,305 Z"
        fill="#fbbf24"
        opacity="0.85"
      />
    </svg>
  );
}

function SquareCompanionFrame() {
  return (
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
        strokeWidth="2.2"
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
      />
      {/* Four square corner ornamental L-brackets */}
      <path
        d="M10,42 L10,10 L42,10 M358,10 L390,10 L390,42 M390,598 L390,630 L358,630 M42,630 L10,630 L10,598"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="3.5"
        strokeLinecap="square"
      />
      {/* Corner diamond rivets */}
      <rect x="17" y="17" width="6" height="6" fill="#fbbf24" />
      <rect x="377" y="17" width="6" height="6" fill="#fbbf24" />
      <rect x="377" y="617" width="6" height="6" fill="#fbbf24" />
      <rect x="17" y="617" width="6" height="6" fill="#fbbf24" />
    </svg>
  );
}

export default function LunorisLandingPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const roadmapTimelineRef = useRef<HTMLDivElement | null>(null);
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

          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
              <a href="#cast">Voice Cast</a>
              <a href="#roadmap">Roadmap</a>
            </nav>
          </div>

          <div className="lunoris-header-right">
            <a
              href="https://store.steampowered.com/app/3053030/Lunoris/"
              target="_blank"
              rel="noopener"
              className="lunoris-steam-btn lunoris-steam-btn-nav"
            >
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
            </a>
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
                      WINNER · INDIE CASTLE AWARDS · GAMESCOM COLOGNE
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
            2. FULL-BLEED MURAL: "BREAK THE ENDLESS DREAM LOOP" + 3 ARCHED DREAM CANVASES
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
                Adrift inside her own painted subconscious after a midnight crash on Wahm Lane, eighteen-year-old artist Lunora traverses floating Dream Islands, high-tension Nightmare arenas, playable 1988 Diriyah flashbacks, and the living 2000x2000 open garden of ELAR.
              </p>
            </div>

            {/* 3 Arched Painter's Canvases / Living Portals */}
            <div className="lunoris-3tile-row">
              <article
                className="lunoris-media-tile canvas-portal-left"
                data-reveal="up"
                style={{ "--stagger": 0 } as React.CSSProperties}
              >
                <img
                  src="/assets/elar-hope.jpg"
                  alt="ELAR Open Sanctuary"
                  className="lunoris-tile-bg"
                />
                <div className="lunoris-canvas-weave" aria-hidden="true" />
                <div className="lunoris-tile-shade" />
                <ArchedCanvasFrame />
                <div className="lunoris-tile-caption">
                  <span className="lunoris-tile-kicker">2000x2000 Open Sanctuary</span>
                  <h3>ELAR: The Living Inner Garden</h3>
                  <p>
                    Zero enemies, zero timers. Carry Echo Lights from the dark to awaken 32 creatures across nine emotional biomes.
                  </p>
                </div>
              </article>

              <article
                className="lunoris-media-tile canvas-portal-center"
                data-reveal="up"
                style={{ "--stagger": 1 } as React.CSSProperties}
              >
                <video
                  className="lunoris-tile-bg"
                  src="/assets/car-level-loop.mp4"
                  poster="/assets/car-level-poster.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="lunoris-canvas-weave" aria-hidden="true" />
                <div className="lunoris-tile-shade" />
                <ArchedCanvasFrame />
                <div className="lunoris-tile-caption">
                  <span className="lunoris-tile-kicker">Playable Nostalgia</span>
                  <h3>1988 Diriyah &amp; Retro Flashbacks</h3>
                  <p>
                    Drive a 1967 Chevrolet Impala through 1988 Diriyah and uncover family memories that shift into 2D arcade chapters.
                  </p>
                </div>
              </article>

              <article
                className="lunoris-media-tile canvas-portal-right"
                data-reveal="up"
                style={{ "--stagger": 2 } as React.CSSProperties}
              >
                <img
                  src="/assets/fearclaw-boss.png"
                  alt="FearClaw Boss in the Nightmare Realm"
                  className="lunoris-tile-bg"
                />
                <div className="lunoris-canvas-weave" aria-hidden="true" />
                <div className="lunoris-tile-shade" />
                <ArchedCanvasFrame />
                <div className="lunoris-tile-caption">
                  <span className="lunoris-tile-kicker">Beyond the Mirror</span>
                  <h3>Nightmare Realms &amp; Bosses</h3>
                  <p>
                    Step through the apartment mirror to confront towering manifestations of trauma like FearClaw.
                  </p>
                </div>
              </article>
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
        <section id="cast" className="lunoris-heroes-section">
          <div className="lunoris-wide-wrap lunoris-mural-center">
            <div className="lunoris-heading-stack" data-reveal="up">
              <span className="lunoris-title-minor">
                Echoes of Wahm Lane &amp; Voice Cast
              </span>
              <h2 className="lunoris-title-major">Who Will Walk Beside You?</h2>
              <div className="lunoris-center-bar" />
              <p className="lunoris-mural-body">
                Meet the voiced characters, childhood memories, and guardians whose voices echo across Lunora&apos;s journey.
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
                      <span
                        className="lunoris-hero-tile-role"
                        style={{ color: char.accent }}
                      >
                        {char.role} · {char.voiceOrTrait}
                      </span>
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
                      <span
                        className="lunoris-hero-tile-role"
                        style={{ color: char.accent }}
                      >
                        {char.role} · {char.voiceOrTrait}
                      </span>
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

          <div className="lunoris-wide-wrap lunoris-final-cta-inner" data-reveal="up">
            <span className="lunoris-title-minor">Step Inside the Dream</span>
            <h2 className="lunoris-title-major">Find Your Way Back</h2>
            <div
              className="lunoris-center-bar"
              style={{ margin: "1.5rem 0 2rem" }}
            />
            <a
              href="https://store.steampowered.com/app/3053030/Lunoris/"
              target="_blank"
              rel="noopener"
              className="lunoris-steam-btn lunoris-steam-btn-hero"
            >
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
                <span className="steam-btn-sub">Download Now on Steam</span>
              </div>
            </a>
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
