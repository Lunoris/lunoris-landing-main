"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LUNORIS_NEWS, type NewsArticle } from "@/data/newsData";
import {
  BrushstrokeButtonBg,
  OrnamentDivider,
} from "@/components/ui/CanvasFrames";
import { NewsArticleCard } from "@/components/ui/NewsArticleCard";

export function LatestNewsSection() {
  const [articles, setArticles] = useState<NewsArticle[]>(LUNORIS_NEWS);
  const [newsOffset, setNewsOffset] = useState(0);

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

  const visibleCount = Math.min(4, articles.length);
  const visibleNews =
    articles.length > 0
      ? Array.from({ length: visibleCount }, (_, i) => {
          const idx = (newsOffset + i) % articles.length;
          return articles[idx];
        })
      : [];

  const handlePrevNews = () => {
    if (articles.length === 0) return;
    setNewsOffset((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const handleNextNews = () => {
    if (articles.length === 0) return;
    setNewsOffset((prev) => (prev + 1) % articles.length);
  };

  return (
    <section id="news" className="lunoris-news-section">
      <div className="lunoris-wide-wrap">
        <div
          className="lunoris-heading-stack lunoris-news-header is-visible"
          data-reveal="up"
        >
          <OrnamentDivider />
          <h2 className="lunoris-title-major lunoris-news-heading">
            Latest News
          </h2>
        </div>

        {visibleNews.length > 0 ? (
          <>
            <div className="lunoris-news-stage is-visible">
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

              <div
                className="lunoris-news-grid"
                style={
                  visibleNews.length < 4
                    ? {
                        gridTemplateColumns: `repeat(${visibleNews.length}, minmax(280px, 410px))`,
                        justifyContent: "center",
                      }
                    : undefined
                }
              >
                {visibleNews.map((article, idx) => (
                  <NewsArticleCard
                    key={article.slug}
                    article={article}
                    staggerMs={idx * 85}
                    forceVisible
                    frameVariant="standard"
                  />
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

            <div className="lunoris-news-bottom-bar is-visible">
              <Link href="/news" className="lunoris-all-news-btn">
                <BrushstrokeButtonBg />
                <span>All News</span>
              </Link>
            </div>
          </>
        ) : (
          <p
            className="lunoris-mural-body"
            style={{
              margin: "0 auto",
              textAlign: "center",
              opacity: 0.72,
            }}
          >
            New chronicles from the subconscious will appear here soon.
          </p>
        )}
      </div>
    </section>
  );
}
