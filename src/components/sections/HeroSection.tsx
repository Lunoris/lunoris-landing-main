import React from "react";
import { AwardBrushWash, LaurelBranchSvg } from "@/components/ui/CanvasFrames";
import { ResilientVideo } from "@/components/ui/ResilientVideo";

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLElement | null>;
}

export function HeroSection({ heroRef }: HeroSectionProps) {
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
              &ldquo;Some dreams aren&apos;t sleep.
              <br />
              <span>They&apos;re worlds you can&apos;t leave.&rdquo;</span>
            </h1>

            <div className="lunoris-quote-source">
              LUNORIS: PIECE OF MIND · PC, PLAYSTATION 5 &amp; XBOX SERIES X|S
            </div>

            <div className="lunoris-divider-bar" />
          </div>

          <div className="lunoris-hero-actions-bar lunoris-hero-award-center-row">
            {/* CENTERED & WIDE FLOATING GAMESCOM VAN GOGH AWARD CREST */}
            <div id="awards" className="lunoris-single-award-crest">
              <AwardBrushWash />
              <LaurelBranchSvg />
              <div className="lunoris-laurel-copy">
                <span className="lunoris-laurel-kicker">
                  WINNER · INDIE CASTLE AWARDS · GAMESCOM COLOGNE 2026
                </span>
                <h3>The &ldquo;Van Gogh&rdquo; Award</h3>
                <p>&ldquo;For the game that should be in an art museum&rdquo;</p>
              </div>
              <LaurelBranchSvg flip />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
