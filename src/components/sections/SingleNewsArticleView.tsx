"use client";

import React from "react";
import Link from "next/link";
import type { NavLinkItem } from "@/data/gameData";
import type { NewsArticle } from "@/data/newsData";
import { BrushstrokeButtonBg } from "@/components/ui/CanvasFrames";
import { NewsArticleCard } from "@/components/ui/NewsArticleCard";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeNewsArticle, localizeNewsCategory } from "@/i18n/helpers";

export function SingleNewsArticleView({
  article: rawArticle,
  relatedArticles,
}: {
  article: NewsArticle;
  relatedArticles: NewsArticle[];
}) {
  const { locale, t } = useLanguage();
  const article = localizeNewsArticle(rawArticle, locale, t);
  const categoryLabel = localizeNewsCategory(article.category, t);

  const singleNewsNav: NavLinkItem[] = [
    { href: "/news", label: t.nav.allNewsBack },
    { href: "/", label: t.nav.gameHome },
    { href: "/#world", label: t.nav.theWorld },
    { href: "/#companions", label: t.nav.companions },
    { href: "/#roadmap", label: t.nav.roadmap },
  ];

  return (
    <div className="lunoris-page news-article-page">
      <HeaderBar
        logoHref="/"
        navLinks={singleNewsNav}
        enableFlyingCta={false}
      />

      <main className="news-article-main">
        <section className="news-article-hero">
          <div
            className="lunoris-mural-bg"
            style={{ backgroundImage: `url('${article.image}')` }}
            aria-hidden="true"
          />
          <div className="lunoris-mural-fade-top" aria-hidden="true" />
          <div className="lunoris-mural-fade-bottom" aria-hidden="true" />

          <div className="lunoris-news-full-wrap news-article-hero-inner">
            <div className="news-breadcrumb">
              <Link href="/">{t.news.article.breadcrumbHome}</Link>
              <span>/</span>
              <Link href="/news">{t.news.article.breadcrumbNews}</Link>
              <span>/</span>
              <span className="news-breadcrumb-current">{categoryLabel}</span>
            </div>

            <div className="lunoris-news-meta news-article-meta">
              <span className="news-category-inline">{categoryLabel}</span>
              <span className="news-meta-sep">|</span>
              <span>{article.date}</span>
              <span className="news-meta-sep">|</span>
              <span>{article.readTime}</span>
            </div>

            <h1 className="news-article-title news-article-main-title">
              {article.title}
            </h1>
            <div className="lunoris-center-bar" style={{ margin: "1.5rem 0" }} />
            <p className="news-article-lead">{article.lead}</p>
          </div>
        </section>

        <section className="news-article-content-section">
          <div className="lunoris-news-full-wrap news-article-container">
            <article className="news-article-canvas">
              <div className="lunoris-canvas-weave" aria-hidden="true" />

              <div className="news-article-showcase-frame">
                <div className="news-article-showcase-clip">
                  {article.isVideo && article.videoSrc ? (
                    <ResilientVideo
                      className="news-article-video"
                      src={article.videoSrc}
                      poster={article.image}
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="news-article-banner-img"
                    />
                  )}
                </div>
              </div>

              {article.highlights.length > 0 && (
                <div className="news-highlights-canvas">
                  <span className="news-highlights-kicker">
                    {t.news.article.highlightsKicker}
                  </span>
                  <ul className="news-highlights-list">
                    {article.highlights.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {article.sections.map((sec) => (
                <div key={sec.heading} className="news-article-block">
                  <h2>{sec.heading}</h2>
                  {sec.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}

                  {sec.quote && (
                    <blockquote className="news-painterly-quote">
                      <p>&ldquo;{sec.quote}&rdquo;</p>
                    </blockquote>
                  )}

                  {sec.image && (
                    <figure className="news-inline-figure">
                      <img src={sec.image} alt={sec.heading} />
                      {sec.imageCaption && (
                        <figcaption>{sec.imageCaption}</figcaption>
                      )}
                    </figure>
                  )}
                </div>
              ))}

              <div className="news-article-actions">
                <Link href="/news" className="lunoris-all-news-btn">
                  <BrushstrokeButtonBg />
                  <span>{t.news.article.allChroniclesBtn}</span>
                </Link>
                <Link href="/" className="lunoris-all-news-btn">
                  <BrushstrokeButtonBg />
                  <span>{t.news.article.returnMainWorldBtn}</span>
                </Link>
              </div>
            </article>

            <div className="news-related-wrap">
              <div className="lunoris-ornament-divider" aria-hidden="true">
                <span className="ornament-line" />
                <span className="ornament-diamond">
                  <span className="ornament-diamond-core" />
                </span>
                <span className="ornament-line" />
              </div>
              <h2
                className="lunoris-title-major"
                style={{
                  fontSize: "clamp(2.2rem, calc(3.6vw * var(--vu)), 3.6rem)",
                  textAlign: "center",
                  marginBottom: "2.5rem",
                }}
              >
                {t.news.article.moreDispatchesHeading}
              </h2>

              <div className="lunoris-news-grid news-related-grid">
                {relatedArticles.map((rel) => (
                  <NewsArticleCard
                    key={rel.slug}
                    article={rel}
                    forceVisible
                    frameVariant="none"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterBar />
    </div>
  );
}
