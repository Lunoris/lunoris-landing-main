"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LUNORIS_NEWS } from "@/data/newsData";

const CATEGORIES = ["All", "Update", "World & Lore", "Video"] as const;

function NewsCanvasFrame() {
  return (
    <svg
      className="canvas-deckled-frame-svg"
      viewBox="0 0 500 620"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M36,14 C164,6 348,8 472,18 C486,20 492,34 490,62 C494,230 491,410 486,574 C484,598 470,608 446,606 C312,612 168,610 28,602 C14,598 8,584 10,554 C6,386 9,204 14,44 C16,22 24,15 36,14 Z"
        fill="none"
        stroke="rgba(251, 191, 36, 0.52)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="240 10 150 8 210 12"
      />
      <path
        d="M42,24 C178,18 340,20 464,28 C476,30 480,42 479,68 C481,234 479,408 475,564 C473,584 462,594 440,594 C308,598 170,596 36,590 C24,588 19,574 20,546 C18,384 20,208 24,52 C25,34 32,26 42,24 Z"
        fill="none"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth="1"
      />
      <path
        d="M26,28 L30,20 L34,28 L42,32 L34,36 L30,44 L26,36 L18,32 Z"
        fill="#fbbf24"
        opacity="0.85"
      />
      <path
        d="M468,576 L471,569 L474,576 L481,579 L474,582 L471,589 L468,582 L461,579 Z"
        fill="#fbbf24"
        opacity="0.85"
      />
    </svg>
  );
}

export default function LunorisNewsArchivePage() {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("All");

  const filteredNews =
    selectedCategory === "All"
      ? LUNORIS_NEWS
      : LUNORIS_NEWS.filter((item) => item.category === selectedCategory);

  const featuredArticle = LUNORIS_NEWS[0];

  return (
    <div className="lunoris-page news-archive-page">
      {/* TOP HEADER */}
      <header className="lunoris-header">
        <div className="lunoris-header-inner">
          <div className="lunoris-header-left">
            <Link href="/" className="lunoris-logo-link">
              <img
                src="/assets/logo-wordmark.svg"
                alt="Lunoris: Piece of Mind"
                className="lunoris-logo-img"
              />
            </Link>
            <nav className="lunoris-nav">
              <Link href="/">← Return to Game World</Link>
              <Link href="/#world">The World</Link>
              <Link href="/#companions">Companions</Link>
              <Link href="/#cast">Voice Cast</Link>
              <Link href="/#roadmap">Roadmap</Link>
            </nav>
          </div>

          <div className="lunoris-header-right">
            <a
              href="https://store.steampowered.com/app/3053030/Lunoris/"
              target="_blank"
              rel="noopener"
              className="lunoris-steam-btn lunoris-steam-btn-nav"
            >
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

      <main className="news-archive-main">
        {/* HERO BANNER */}
        <section className="news-page-hero">
          <div
            className="lunoris-mural-bg"
            style={{ backgroundImage: "url('/assets/elar-stillness.jpg')" }}
            aria-hidden="true"
          />
          <div className="lunoris-mural-fade-top" aria-hidden="true" />
          <div className="lunoris-mural-fade-bottom" aria-hidden="true" />

          <div className="lunoris-wide-wrap news-page-hero-inner">
            <div className="lunoris-ornament-divider" aria-hidden="true">
              <span className="ornament-line ornament-line-left" />
              <span className="ornament-diamond ornament-diamond-sm" />
              <span className="ornament-diamond ornament-diamond-lg">
                <span className="ornament-diamond-core" />
              </span>
              <span className="ornament-diamond ornament-diamond-sm" />
              <span className="ornament-line ornament-line-right" />
            </div>
            <span className="lunoris-title-minor">
              Chronicles of the Subconscious
            </span>
            <h1 className="lunoris-title-major">Latest News &amp; Updates</h1>
            <p className="lunoris-mural-body" style={{ marginTop: "1rem" }}>
              Dispatches from inside Lunora&apos;s dreamscape: major sanctuary
              updates, Gamescom accolades, playable memory teasers, and deep
              dives into the realms of Lunoris: Piece of Mind.
            </p>

            {/* FEATURED ARTICLE CANVAS */}
            <Link
              href={`/news/${featuredArticle.slug}`}
              className="news-featured-canvas"
            >
              <div className="news-featured-media">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="news-featured-img"
                />
                <div className="lunoris-canvas-weave" aria-hidden="true" />
                <span className="news-category-pill">Featured Chronicle</span>
              </div>
              <div className="news-featured-content">
                <div className="lunoris-news-meta">
                  <span>{featuredArticle.date}</span>
                  <span className="news-meta-sep">|</span>
                  <span>{featuredArticle.readTime}</span>
                </div>
                <h2 className="news-featured-title">{featuredArticle.title}</h2>
                <p className="news-featured-excerpt">
                  {featuredArticle.lead}
                </p>
                <span className="lunoris-news-cta">
                  {featuredArticle.ctaLabel}
                  <span className="lunoris-news-cta-line" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* FILTERABLE NEWS CANVAS GRID */}
        <section className="news-archive-grid-section">
          <div className="lunoris-wide-wrap">
            <div className="news-filter-bar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`news-filter-pill ${
                    selectedCategory === cat ? "is-active" : ""
                  }`}
                >
                  {cat === "All" ? "All Chronicles" : cat}
                </button>
              ))}
            </div>

            <div className="lunoris-news-grid lunoris-news-archive-grid">
              {filteredNews.map((article, idx) => (
                <Link
                  href={`/news/${article.slug}`}
                  key={article.slug}
                  className="lunoris-news-card is-visible"
                  style={
                    { "--news-stagger": `${idx * 90}ms` } as React.CSSProperties
                  }
                >
                  <div className="lunoris-canvas-weave" aria-hidden="true" />
                  <NewsCanvasFrame />

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
                      <div className="lunoris-news-play-circle" aria-hidden="true">
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
            Lunoris and the Lunoris logo are trademarks and/or registered
            trademarks. 2026 Lunoris: Piece of Mind, all rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
