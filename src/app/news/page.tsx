"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LUNORIS_NEWS, type NewsArticle } from "@/data/newsData";
import type { NavLinkItem } from "@/data/gameData";
import { OrnamentDivider } from "@/components/ui/CanvasFrames";
import { NewsArticleCard } from "@/components/ui/NewsArticleCard";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";

const CATEGORIES = ["All", "Update", "World & Lore", "Video"] as const;

const NEWS_ARCHIVE_NAV: NavLinkItem[] = [
  { href: "/", label: "← Return to Game World" },
  { href: "/#world", label: "The World" },
  { href: "/#companions", label: "Companions" },
  { href: "/#characters", label: "Characters" },
  { href: "/#roadmap", label: "Roadmap" },
];

export default function LunorisNewsArchivePage() {
  const [articles, setArticles] = useState<NewsArticle[]>(LUNORIS_NEWS);
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("All");

  useEffect(() => {
    let active = true;
    fetch("/api/news", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.articles)) {
          setArticles(data.articles);
        }
      })
      .catch(() => {
        // Fallback to bundled LUNORIS_NEWS
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredNews =
    selectedCategory === "All"
      ? articles
      : articles.filter((item) => item.category === selectedCategory);

  const featuredArticle = articles[0];

  return (
    <div className="lunoris-page news-archive-page">
      <HeaderBar
        logoHref="/"
        navLinks={NEWS_ARCHIVE_NAV}
        enableFlyingCta={false}
      />

      <main className="news-archive-main">
        <section className="news-page-hero">
          <div
            className="lunoris-mural-bg"
            style={{ backgroundImage: "url('/assets/elar-stillness.jpg')" }}
            aria-hidden="true"
          />
          <div className="lunoris-mural-fade-top" aria-hidden="true" />
          <div className="lunoris-mural-fade-bottom" aria-hidden="true" />

          <div className="lunoris-wide-wrap news-page-hero-inner">
            <OrnamentDivider />
            <span className="lunoris-title-minor">
              Chronicles of the Subconscious
            </span>
            <h1 className="lunoris-title-major">Latest News &amp; Updates</h1>
            <p className="lunoris-mural-body" style={{ marginTop: "1rem" }}>
              Dispatches from inside Lunora&apos;s dreamscape: major sanctuary
              updates, Gamescom accolades, playable memory teasers, and deep
              dives into the realms of Lunoris: Piece of Mind.
            </p>

            {featuredArticle && (
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
                  <h2 className="news-featured-title">
                    {featuredArticle.title}
                  </h2>
                  <p className="news-featured-excerpt">
                    {featuredArticle.lead}
                  </p>
                  <span className="lunoris-news-cta">
                    {featuredArticle.ctaLabel}
                    <span className="lunoris-news-cta-line" />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </section>

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

            {filteredNews.length > 0 ? (
              <div className="lunoris-news-grid lunoris-news-archive-grid">
                {filteredNews.map((article, idx) => (
                  <NewsArticleCard
                    key={article.slug}
                    article={article}
                    staggerMs={idx * 90}
                    forceVisible
                    frameVariant="tall"
                  />
                ))}
              </div>
            ) : (
              <p
                className="lunoris-mural-body"
                style={{
                  margin: "0 auto",
                  textAlign: "center",
                  padding: "3rem 0",
                  opacity: 0.72,
                }}
              >
                No chronicles published yet.
              </p>
            )}
          </div>
        </section>
      </main>

      <FooterBar />
    </div>
  );
}
