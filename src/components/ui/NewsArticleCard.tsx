"use client";

import React from "react";
import Link from "next/link";
import type { NewsArticle } from "@/data/newsData";
import {
  DeckledCanvasFrame,
  TallDeckledCanvasFrame,
} from "@/components/ui/CanvasFrames";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeNewsArticle, localizeNewsCategory } from "@/i18n/helpers";

interface NewsArticleCardProps {
  article: NewsArticle;
  staggerMs?: number;
  forceVisible?: boolean;
  frameVariant?: "standard" | "tall" | "none";
}

export function NewsArticleCard({
  article,
  staggerMs = 0,
  forceVisible = false,
  frameVariant = "standard",
}: NewsArticleCardProps) {
  const { locale, t } = useLanguage();
  const localized = localizeNewsArticle(article, locale, t);
  const categoryLabel = localizeNewsCategory(localized.category, t);

  return (
    <Link
      href={`/news/${localized.slug}`}
      className={`lunoris-news-card${forceVisible ? " is-visible" : ""}`}
      style={
        {
          "--news-stagger": `${staggerMs}ms`,
        } as React.CSSProperties
      }
    >
      <div className="lunoris-canvas-weave" aria-hidden="true" />
      {frameVariant === "standard" && <DeckledCanvasFrame />}
      {frameVariant === "tall" && <TallDeckledCanvasFrame />}

      <div className="lunoris-news-media">
        {localized.isVideo && localized.videoSrc ? (
          <ResilientVideo
            className="lunoris-news-thumb"
            src={localized.videoSrc}
            poster={localized.image}
            preload="metadata"
          />
        ) : (
          <img
            src={localized.image}
            alt={localized.title}
            className="lunoris-news-thumb"
          />
        )}
        <div className="lunoris-news-media-shade" />
        <span className="news-corner-tag">{categoryLabel}</span>

        {localized.isVideo && (
          <div className="lunoris-news-play-circle" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>

      <div className="lunoris-news-body">
        <div className="lunoris-news-meta">
          <span>{localized.date}</span>
          <span className="news-meta-sep">|</span>
          <span>{localized.readTime}</span>
        </div>
        <h3 className="lunoris-news-title">{localized.title}</h3>
        <p className="lunoris-news-excerpt">{localized.excerpt}</p>

        <div className="lunoris-news-footer">
          <span className="lunoris-news-cta">
            {t.news.readMore}
            <span className="lunoris-news-cta-line" />
          </span>
        </div>
      </div>
    </Link>
  );
}
