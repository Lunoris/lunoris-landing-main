import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LUNORIS_NEWS } from "@/data/newsData";

export function generateStaticParams() {
  return LUNORIS_NEWS.map((item) => ({
    slug: item.slug,
  }));
}

// Each article shares with its own headline, excerpt and cover image.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = LUNORIS_NEWS.find((item) => item.slug === slug);
  if (!article) return {};

  const title = `${article.title} | Lunoris: Piece of Mind`;
  return {
    title,
    description: article.excerpt,
    openGraph: {
      type: "article",
      siteName: "Lunoris: Piece of Mind",
      title,
      description: article.excerpt,
      images: [{ url: article.image, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function SingleNewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = LUNORIS_NEWS.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = LUNORIS_NEWS.filter(
    (item) => item.slug !== article.slug
  ).slice(0, 3);

  return (
    <div className="lunoris-page news-article-page">
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
              <Link href="/news">← All News</Link>
              <Link href="/">Game Home</Link>
              <Link href="/#world">The World</Link>
              <Link href="/#companions">Companions</Link>
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

      <main className="news-article-main">
        {/* ARTICLE HERO MURAL */}
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
              <Link href="/">Lunoris</Link>
              <span>/</span>
              <Link href="/news">Latest News</Link>
              <span>/</span>
              <span className="news-breadcrumb-current">{article.category}</span>
            </div>

            <div className="lunoris-news-meta news-article-meta">
              <span className="news-category-inline">{article.category}</span>
              <span className="news-meta-sep">|</span>
              <span>{article.date}</span>
              <span className="news-meta-sep">|</span>
              <span>{article.readTime}</span>
            </div>

            <h1 className="news-article-title news-article-main-title">{article.title}</h1>
            <div className="lunoris-center-bar" style={{ margin: "1.5rem 0" }} />
            <p className="news-article-lead">{article.lead}</p>
          </div>
        </section>

        {/* ARTICLE BODY CANVAS */}
        <section className="news-article-content-section">
          <div className="lunoris-news-full-wrap news-article-container">
            <article className="news-article-canvas">
              <div className="lunoris-canvas-weave" aria-hidden="true" />

              {/* Featured Video or Key Artwork */}
              <div className="news-article-showcase-frame">
                {article.isVideo && article.videoSrc ? (
                  <video
                    className="news-article-video"
                    src={article.videoSrc}
                    poster={article.image}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="news-article-banner-img"
                  />
                )}
              </div>

              {/* Key Highlights */}
              {article.highlights.length > 0 && (
                <div className="news-highlights-canvas">
                  <span className="news-highlights-kicker">
                    Key Chronicle Highlights
                  </span>
                  <ul className="news-highlights-list">
                    {article.highlights.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Sections */}
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
                  ← All News Chronicles
                </Link>
                <Link href="/" className="lunoris-all-news-btn">
                  Return to Main World
                </Link>
              </div>
            </article>

            {/* MORE NEWS SECTION */}
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
                More Dispatches From the Dream
              </h2>

              <div className="lunoris-news-grid news-related-grid">
                {relatedArticles.map((rel) => (
                  <Link
                    href={`/news/${rel.slug}`}
                    key={rel.slug}
                    className="lunoris-news-card is-visible"
                  >
                    <div className="lunoris-canvas-weave" aria-hidden="true" />
                    <div className="lunoris-news-media">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="lunoris-news-thumb"
                      />
                      <div className="lunoris-news-media-shade" />
                      <span className="news-corner-tag">{rel.category}</span>
                    </div>
                    <div className="lunoris-news-body">
                      <div className="lunoris-news-meta">
                        <span>{rel.date}</span>
                        <span className="news-meta-sep">|</span>
                        <span>{rel.readTime}</span>
                      </div>
                      <h3 className="lunoris-news-title">{rel.title}</h3>
                      <p className="lunoris-news-excerpt">{rel.excerpt}</p>
                      <div className="lunoris-news-footer">
                        <span className="lunoris-news-cta">
                          {rel.ctaLabel}
                          <span className="lunoris-news-cta-line" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
