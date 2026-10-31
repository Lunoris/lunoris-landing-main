"use client";

import React from "react";
import { AwardBrushWash, LaurelBranchSvg } from "@/components/ui/CanvasFrames";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import { useLanguage } from "@/i18n/LanguageContext";

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLElement | null>;
}

export function HeroSection({ heroRef }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="lunoris-hero" ref={heroRef}>
      <div className="lunoris-hero-video-bg" aria-hidden="true">
        <ResilientVideo
          className="lunoris-hero-video"
          src="/assets/PressAnyKeyVideo.mp4"
          poster="/assets/dream-level-1.png"
          preload="auto"
        />
        <div className="lunoris-hero-vignette" />
        <div className="lunoris-hero-bottom-fade" />
      </div>

      <div className="lunoris-wide-wrap lunoris-hero-foreground">
        <div className="lunoris-hero-clean-layout">
          <div className="lunoris-hero-quote-block">
            <h1 className="lunoris-hero-quote">
              &ldquo;{t.hero.quoteLine1}
              <br />
              <span>{t.hero.quoteLine2}&rdquo;</span>
            </h1>

            <div className="lunoris-quote-source">{t.hero.platformsLine}</div>

            <div className="lunoris-divider-bar" />
          </div>

          <div className="lunoris-hero-actions-bar lunoris-hero-award-center-row">
            {/* CENTERED & WIDE FLOATING GAMESCOM VAN GOGH AWARD CREST */}
            <div id="awards" className="lunoris-single-award-crest">
              <AwardBrushWash />
              <LaurelBranchSvg />
              <div className="lunoris-laurel-copy">
                <span className="lunoris-laurel-kicker">
                  {t.hero.awardKicker}
                </span>
                <h3>{t.hero.awardTitle}</h3>
                <p>{t.hero.awardQuote}</p>
              </div>
              <LaurelBranchSvg flip />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
