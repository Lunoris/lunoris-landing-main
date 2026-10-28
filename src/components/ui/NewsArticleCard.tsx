import React from "react";
import Link from "next/link";
import type { NewsArticle } from "@/data/newsData";
import {
  DeckledCanvasFrame,
  TallDeckledCanvasFrame,
} from "@/components/ui/CanvasFrames";
import { ResilientVideo } from "@/components/ui/ResilientVideo";

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
  return (
    <Link
      href={`/news/${article.slug}`}
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
        {article.isVideo && article.videoSrc ? (
          <ResilientVideo
            className="lunoris-news-thumb"
            src={article.videoSrc}
            poster={article.image}
            preload="metadata"
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
  );
}
