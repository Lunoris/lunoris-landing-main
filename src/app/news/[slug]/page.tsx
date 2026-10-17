import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LUNORIS_NEWS } from "@/data/newsData";

export function generateStaticParams() {
  return LUNORIS_NEWS.map((item) => ({
    slug: item.slug,
  }));
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
    <div className="dota-page news-article-page">
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
              <Link href="/news">← All News</Link>
              <Link href="/">Game Home</Link>
              <Link href="/#world">The World</Link>
              <Link href="/#companions">Companions</Link>
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

      <main className="news-article-main">
        {/* ARTICLE HERO MURAL */}
        <section className="news-article-hero">
          <div
            className="dota-mural-bg"
            style={{ backgroundImage: `url('${article.image}')` }}
            aria-hidden="true"
          />
          <div className="dota-mural-fade-top" aria-hidden="true" />
          <div className="dota-mural-fade-bottom" aria-hidden="true" />

          <div className="dota-news-full-wrap news-article-hero-inner">
            <div className="news-breadcrumb">
              <Link href="/">Lunoris</Link>
              <span>/</span>
              <Link href="/news">Latest News</Link>
              <span>/</span>
              <span className="news-breadcrumb-current">{article.category}</span>
            </div>

            <div className="dota-news-meta news-article-meta">
              <span className="news-category-inline">{article.category}</span>
              <span className="news-meta-sep">|</span>
              <span>{article.date}</span>
              <span className="news-meta-sep">|</span>
              <span>{article.readTime}</span>
            </div>

            <h1 className="news-article-title news-article-main-title">{article.title}</h1>
            <div className="dota-center-bar" style={{ margin: "1.5rem 0" }} />
            <p className="news-article-lead">{article.lead}</p>
          </div>
        </section>

        {/* ARTICLE BODY CANVAS */}
        <section className="news-article-content-section">
          <div className="dota-news-full-wrap news-article-container">
            <article className="news-article-canvas">
              <div className="dota-canvas-weave" aria-hidden="true" />

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
                <Link href="/news" className="dota-all-news-btn">
                  ← All News Chronicles
                </Link>
                <Link href="/" className="dota-all-news-btn">
                  Return to Main World
                </Link>
              </div>
            </article>

            {/* MORE NEWS SECTION */}
            <div className="news-related-wrap">
              <div className="dota-ornament-divider" aria-hidden="true">
                <span className="ornament-line" />
                <span className="ornament-diamond">
                  <span className="ornament-diamond-core" />
                </span>
                <span className="ornament-line" />
              </div>
              <h2
                className="dota-title-major"
                style={{
                  fontSize: "clamp(2.2rem, 3.6vw, 3.6rem)",
                  textAlign: "center",
                  marginBottom: "2.5rem",
                }}
              >
                More Dispatches From the Dream
              </h2>

              <div className="dota-news-grid news-related-grid">
                {relatedArticles.map((rel) => (
                  <Link
                    href={`/news/${rel.slug}`}
                    key={rel.slug}
                    className="dota-news-card is-visible"
                  >
                    <div className="dota-canvas-weave" aria-hidden="true" />
                    <div className="dota-news-media">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="dota-news-thumb"
                      />
                      <div className="dota-news-media-shade" />
                      <span className="news-corner-tag">{rel.category}</span>
                    </div>
                    <div className="dota-news-body">
                      <div className="dota-news-meta">
                        <span>{rel.date}</span>
                        <span className="news-meta-sep">|</span>
                        <span>{rel.readTime}</span>
                      </div>
                      <h3 className="dota-news-title">{rel.title}</h3>
                      <p className="dota-news-excerpt">{rel.excerpt}</p>
                      <div className="dota-news-footer">
                        <span className="dota-news-cta">
                          {rel.ctaLabel}
                          <span className="dota-news-cta-line" />
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
