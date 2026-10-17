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
    <div className="dota-page news-archive-page">
      {/* TOP HEADER */}
      <header className="dota-header">
        <div className="dota-header-inner">
          <div className="dota-header-left">
            <Link href="/" className="dota-logo-link">
              <img
                src="/assets/logo-wordmark.svg"
                alt="Lunoris: Piece of Mind"
                className="dota-logo-img"
              />
            </Link>
            <nav className="dota-nav">
              <Link href="/">← Return to Game World</Link>
              <Link href="/#world">The World</Link>
              <Link href="/#companions">Companions</Link>
              <Link href="/#cast">Voice Cast</Link>
              <Link href="/#roadmap">Roadmap</Link>
            </nav>
          </div>

          <div className="dota-header-right">
            <a
              href="https://store.steampowered.com/app/3053030/Lunoris/"
              target="_blank"
              rel="noopener"
              className="dota-steam-btn dota-steam-btn-nav"
            >
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
            className="dota-mural-bg"
            style={{ backgroundImage: "url('/assets/elar-stillness.jpg')" }}
            aria-hidden="true"
          />
          <div className="dota-mural-fade-top" aria-hidden="true" />
          <div className="dota-mural-fade-bottom" aria-hidden="true" />

          <div className="dota-wide-wrap news-page-hero-inner">
            <div className="dota-ornament-divider" aria-hidden="true">
              <span className="ornament-line ornament-line-left" />
              <span className="ornament-diamond ornament-diamond-sm" />
              <span className="ornament-diamond ornament-diamond-lg">
                <span className="ornament-diamond-core" />
              </span>
              <span className="ornament-diamond ornament-diamond-sm" />
              <span className="ornament-line ornament-line-right" />
            </div>
            <span className="dota-title-minor">
              Chronicles of the Subconscious
            </span>
            <h1 className="dota-title-major">Latest News &amp; Updates</h1>
            <p className="dota-mural-body" style={{ marginTop: "1rem" }}>
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
                <div className="dota-canvas-weave" aria-hidden="true" />
                <span className="news-category-pill">Featured Chronicle</span>
              </div>
              <div className="news-featured-content">
                <div className="dota-news-meta">
                  <span>{featuredArticle.date}</span>
                  <span className="news-meta-sep">|</span>
                  <span>{featuredArticle.readTime}</span>
                </div>
                <h2 className="news-featured-title">{featuredArticle.title}</h2>
                <p className="news-featured-excerpt">
                  {featuredArticle.lead}
                </p>
                <span className="dota-news-cta">
                  {featuredArticle.ctaLabel}
                  <span className="dota-news-cta-line" />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* FILTERABLE NEWS CANVAS GRID */}
        <section className="news-archive-grid-section">
          <div className="dota-wide-wrap">
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

            <div className="dota-news-grid dota-news-archive-grid">
              {filteredNews.map((article, idx) => (
                <Link
                  href={`/news/${article.slug}`}
                  key={article.slug}
                  className="dota-news-card is-visible"
                  style={
                    { "--news-stagger": `${idx * 90}ms` } as React.CSSProperties
                  }
                >
                  <div className="dota-canvas-weave" aria-hidden="true" />
                  <NewsCanvasFrame />

                  <div className="dota-news-media">
                    {article.isVideo && article.videoSrc ? (
                      <video
                        className="dota-news-thumb"
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
                        className="dota-news-thumb"
                      />
                    )}
                    <div className="dota-news-media-shade" />
                    <span className="news-corner-tag">{article.category}</span>
                    {article.isVideo && (
                      <div className="dota-news-play-circle" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="dota-news-body">
                    <div className="dota-news-meta">
                      <span>{article.date}</span>
                      <span className="news-meta-sep">|</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="dota-news-title">{article.title}</h3>
                    <p className="dota-news-excerpt">{article.excerpt}</p>
                    <div className="dota-news-footer">
                      <span className="dota-news-cta">
                        {article.ctaLabel}
                        <span className="dota-news-cta-line" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="dota-footer">
        <div className="dota-wide-wrap dota-footer-inner">
          <img
            src="/assets/logo-wordmark.svg"
            alt="Lunoris: Piece of Mind"
            className="dota-footer-logo"
          />
          <p className="dota-footer-legal">
            Lunoris and the Lunoris logo are trademarks and/or registered
            trademarks. 2026 Lunoris: Piece of Mind, all rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
