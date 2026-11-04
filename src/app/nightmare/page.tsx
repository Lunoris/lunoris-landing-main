"use client";

import React from "react";
import type { NavLinkItem } from "@/data/gameData";
import { getNightmarePageCopy } from "@/data/nightmareData";
import { DreamRevealLetters } from "@/components/ui/DreamRevealLetters";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";
import { useLanguage } from "@/i18n/LanguageContext";

function NightmareGlowText({
  text,
  className = "",
  glowColor = "rgba(192, 132, 252, 0.34)",
}: {
  text: string;
  className?: string;
  glowColor?: string;
}) {
  return (
    <span
      className={"nightmare-glow-text " + className}
      style={
        {
          "--nm-glow": glowColor,
        } as React.CSSProperties
      }
    >
      {text}
    </span>
  );
}

export default function NightmareRealmPage() {
  const { locale, t } = useLanguage();
  const copy = getNightmarePageCopy(locale);
  const text = t.portalPages.nightmare;
  const wasteland = copy.architectureCards.find((card) => card.id === "seven-wasteland-zones");
  const matchi = copy.architectureCards.find((card) => card.id === "matchi-mountain-sanctuary");
  const fearclaw = copy.zones.find((zone) => zone.id === "fearclaw-boss-arena");

  const navItems: NavLinkItem[] = [
    { label: t.portalPages.navWorld, href: "/#world" },
    { label: text.navWasteland, href: "#nightmare-world" },
    { label: "Matchi Matchi", href: "#matchi-sanctuary" },
    { label: "FearClaw", href: "#fearclaw-arena" },
  ];

  return (
    <div className="lunoris-page dream-levels-page nightmare-realm-page nightmare-editorial-page">
      <div
        className="dream-levels-page-backdrop nightmare-realm-page-backdrop"
        aria-hidden="true"
      />

      <HeaderBar
        logoHref="/"
        navLinks={navItems}
        enableFlyingCta={false}
        voidDistortion
      />

      <main className="dream-levels-main nightmare-editorial-main">
        <header className="nightmare-editorial-hero">
          <span className="nightmare-editorial-kicker">
            <NightmareGlowText
              text={text.kicker}
              glowColor="rgba(217, 70, 239, 0.82)"
            />
          </span>
          <h1 className="nightmare-editorial-title">
            <DreamRevealLetters
              text={copy.heroTitle}
              variant="heading"
              glowColor="rgba(217, 70, 239, 0.95)"
            />
          </h1>
        </header>

        <section id="nightmare-world" className="nightmare-wasteland-section">
          <div className="nightmare-section-heading">
            <span className="nightmare-section-index">
              <NightmareGlowText text={text.settingIndex} />
            </span>
            <h2 className="nightmare-section-title">
              <DreamRevealLetters
                text={text.settingTitle}
                variant="heading"
                glowColor="rgba(192, 132, 252, 0.9)"
              />
            </h2>
          </div>

          <figure className="nightmare-wasteland-panorama">
            <img
              src={wasteland?.image ?? "/assets/dream-level-1.png"}
              alt={text.panoramaAlt}
              loading="eager"
            />
            <figcaption>
              <NightmareGlowText
                text={text.panoramaCaption}
                glowColor="rgba(221, 214, 254, 0.82)"
              />
            </figcaption>
          </figure>

          <div className="nightmare-wasteland-notes">
            <p>
              <NightmareGlowText
                text={
                  text.notes
                }
                glowColor="rgba(221, 214, 254, 0.76)"
              />
            </p>
            <div className="nightmare-wasteland-counts" aria-label={text.countsLabel}>
              <span><strong>7</strong> {text.safeSpots}</span>
              <span><strong>3</strong> Dream Pockets</span>
              <span><strong>20</strong> Echo Shards</span>
            </div>
          </div>
        </section>

        <section id="matchi-sanctuary" className="nightmare-matchi-section">
          <div className="nightmare-matchi-image-wrap">
            <img
              src={matchi?.image ?? "/assets/dreamhub-scene.png"}
              alt={text.matchiAlt}
              loading="lazy"
            />
            <span className="nightmare-matchi-image-caption">
              <NightmareGlowText
                text={text.matchiCaption}
                glowColor="rgba(52, 211, 153, 0.88)"
              />
            </span>
          </div>
          <div className="nightmare-matchi-copy">
            <span className="nightmare-section-index nightmare-matchi-index">
              <NightmareGlowText
                text={text.matchiIndex}
                glowColor="rgba(52, 211, 153, 0.88)"
              />
            </span>
            <h2 className="nightmare-section-title">
              <DreamRevealLetters
                text="Matchi Matchi"
                variant="heading"
                glowColor="rgba(52, 211, 153, 0.92)"
              />
            </h2>
            <p>
              <NightmareGlowText
                text={
                  text.matchiBody
                }
                glowColor="rgba(226, 232, 240, 0.8)"
              />
            </p>
            <div className="nightmare-matchi-condition">
              <span className="nightmare-matchi-condition-mark" aria-hidden="true">↳</span>
              <NightmareGlowText
                text={
                  text.matchiCondition
                }
                glowColor="rgba(52, 211, 153, 0.9)"
              />
            </div>
            <p className="nightmare-matchi-reward">
              <NightmareGlowText
                text={text.matchiReward}
                glowColor="rgba(52, 211, 153, 0.74)"
              />
            </p>
          </div>
        </section>

        <section id="fearclaw-arena" className="nightmare-fearclaw-section">
          <div className="nightmare-fearclaw-image">
            <img
              src={fearclaw?.image ?? "/assets/fearclaw-boss.png"}
              alt={text.fearclawAlt}
              loading="lazy"
            />
          </div>
          <div className="nightmare-fearclaw-copy">
            <span className="nightmare-section-index nightmare-fearclaw-index">
              <NightmareGlowText
                text={text.fearclawIndex}
                glowColor="rgba(251, 113, 133, 0.9)"
              />
            </span>
            <h2 className="nightmare-fearclaw-title">
              <DreamRevealLetters
                text="FearClaw"
                variant="heading"
                glowColor="rgba(251, 113, 133, 0.96)"
              />
            </h2>
            <p className="nightmare-fearclaw-description">
              <NightmareGlowText
                text={
                  text.fearclawBody
                }
                glowColor="rgba(255, 228, 230, 0.84)"
              />
            </p>
            <div className="nightmare-fearclaw-phases">
              <div>
                <span>01</span>
                <p><NightmareGlowText text={text.phases[0]} /></p>
              </div>
              <div>
                <span>02</span>
                <p><NightmareGlowText text={text.phases[1]} /></p>
              </div>
              <div>
                <span>03</span>
                <p><NightmareGlowText text={text.phases[2]} /></p>
              </div>
            </div>
            <p className="nightmare-fearclaw-reward">
              <NightmareGlowText
                text={text.fearclawReward}
                glowColor="rgba(251, 113, 133, 0.86)"
              />
            </p>
          </div>
        </section>
      </main>

      <FooterBar />
    </div>
  );
}
