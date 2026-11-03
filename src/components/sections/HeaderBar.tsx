"use client";

import React from "react";
import Link from "next/link";
import { STEAM_STORE_URL, type NavLinkItem } from "@/data/gameData";
import {
  BrushstrokeButtonBg,
  CanvasStar,
  SteamLogoSvg,
} from "@/components/ui/CanvasFrames";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { FloatingLetters } from "@/components/ui/FloatingLetters";
import { MagneticLetters } from "@/components/ui/MagneticLetters";
import { DreamRevealLetters } from "@/components/ui/DreamRevealLetters";
import { useLanguage } from "@/i18n/LanguageContext";

const SPARKLE_STARS = [
  { className: "magic-sparkle sp-1", color: "#fbbf24" },
  { className: "magic-sparkle sp-2", color: "#e879f9" },
  { className: "magic-sparkle sp-3", color: "#38bdf8" },
  { className: "magic-sparkle sp-4", color: "#fbbf24" },
  { className: "magic-sparkle sp-5", color: "#c084fc" },
  { className: "magic-sparkle sp-6", color: "#fde68a" },
] as const;

interface HeaderBarProps {
  navBtnSlotRef?: React.RefObject<HTMLDivElement | null>;
  steamBtnRef?: React.RefObject<HTMLAnchorElement | null>;
  navLinks?: NavLinkItem[];
  logoHref?: string;
  enableFlyingCta?: boolean;
  floatingLetters?: boolean;
  retroCrt?: boolean;
  voidDistortion?: boolean;
}

export function HeaderBar({
  navBtnSlotRef,
  steamBtnRef,
  navLinks,
  logoHref = "#top",
  enableFlyingCta = true,
  floatingLetters = false,
  retroCrt = false,
  voidDistortion = false,
}: HeaderBarProps) {
  const { t } = useLanguage();
  const isAnchorLogo = logoHref.startsWith("#");
  const isStyledBrand = floatingLetters || retroCrt || voidDistortion;

  const resolvedNavLinks: NavLinkItem[] = navLinks ?? [
    { href: "#news", label: t.nav.latestNews },
    { href: "#world", label: t.nav.theWorld },
    { href: "#companions", label: t.nav.companions },
    { href: "#characters", label: t.nav.characters },
    { href: "#team", label: t.nav.team },
    { href: "#roadmap", label: t.nav.roadmap },
  ];

  const brandContent = voidDistortion ? (
    <span className="lunoris-dream-brand-wrap is-nightmare-brand">
      <span
        className="lunoris-dream-brand-star is-nightmare-star"
        aria-hidden="true"
      >
        ✦
      </span>
      <span className="lunoris-dream-brand-wordmark">
        <DreamRevealLetters
          text="LUNORIS"
          variant="heading"
          glowColor="rgba(217, 70, 239, 0.92)"
        />
      </span>
    </span>
  ) : retroCrt ? (
    <span className="lunoris-dream-brand-wrap is-retro-brand">
      <span className="lunoris-dream-brand-star is-retro-star" aria-hidden="true">
        ✦
      </span>
      <span className="lunoris-dream-brand-wordmark">
        <MagneticLetters
          text="LUNORIS"
          glowColor="rgba(251, 191, 36, 0.94)"
          intensity={1.08}
        />
      </span>
    </span>
  ) : floatingLetters ? (
    <span className="lunoris-dream-brand-wrap">
      <span className="lunoris-dream-brand-star" aria-hidden="true">
        ✦
      </span>
      <span className="lunoris-dream-brand-wordmark">
        <FloatingLetters
          text="LUNORIS"
          glowColor="rgba(34, 211, 238, 0.92)"
          intensity={0.95}
        />
      </span>
    </span>
  ) : (
    <img
      src="/assets/logo-wordmark.svg"
      alt="Lunoris: Piece of Mind"
      width={184}
      height={42}
      className="lunoris-logo-img"
    />
  );

  return (
    <header className="lunoris-header">
      <div className="lunoris-header-inner">
        <div className="lunoris-header-left">
          {isAnchorLogo ? (
            <a
              href={logoHref}
              className={`lunoris-logo-link ${
                isStyledBrand ? "is-dream-brand" : ""
              }`}
            >
              {brandContent}
            </a>
          ) : (
            <Link
              href={logoHref}
              className={`lunoris-logo-link ${
                isStyledBrand ? "is-dream-brand" : ""
              }`}
            >
              {brandContent}
            </Link>
          )}

          <nav className="lunoris-nav">
            {resolvedNavLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a key={link.href} href={link.href}>
                  {voidDistortion ? (
                    <DreamRevealLetters
                      text={link.label}
                      variant="body"
                      glowColor="rgba(217, 70, 239, 0.85)"
                    />
                  ) : retroCrt ? (
                    <MagneticLetters
                      text={link.label}
                      glowColor="rgba(251, 191, 36, 0.88)"
                      intensity={0.95}
                    />
                  ) : floatingLetters ? (
                    <FloatingLetters
                      text={link.label}
                      glowColor="rgba(34, 211, 238, 0.85)"
                      intensity={0.62}
                    />
                  ) : (
                    link.label
                  )}
                </a>
              ) : (
                <Link key={link.href} href={link.href}>
                  {voidDistortion ? (
                    <DreamRevealLetters
                      text={link.label}
                      variant="body"
                      glowColor="rgba(217, 70, 239, 0.85)"
                    />
                  ) : retroCrt ? (
                    <MagneticLetters
                      text={link.label}
                      glowColor="rgba(251, 191, 36, 0.88)"
                      intensity={0.95}
                    />
                  ) : floatingLetters ? (
                    <FloatingLetters
                      text={link.label}
                      glowColor="rgba(34, 211, 38, 0.85)"
                      intensity={0.62}
                    />
                  ) : (
                    link.label
                  )}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="lunoris-header-right">
          <LanguageSwitcher />

          {enableFlyingCta ? (
            <div ref={navBtnSlotRef} className="lunoris-steam-nav-slot">
              <a
                ref={steamBtnRef}
                href={STEAM_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.steamCta.ariaLabel}
                className="lunoris-steam-btn lunoris-steam-btn-nav"
              >
                <span className="steam-magic-sparkles" aria-hidden="true">
                  {SPARKLE_STARS.map((star) => (
                    <CanvasStar
                      key={star.className}
                      className={star.className}
                      color={star.color}
                    />
                  ))}
                </span>

                {/* Clean white transparent Steam logo in top header & during edge flight */}
                <SteamLogoSvg className="steam-nav-solo-icon" />

                {/* Larger full brushstroke Steam CTA button revealed at the bottom of the page */}
                <div className="steam-cta-full-body">
                  <BrushstrokeButtonBg />
                  <SteamLogoSvg className="steam-icon" />
                  <div className="steam-btn-text">
                    <span className="steam-btn-main">
                      {t.steamCta.playFreeDemo}
                    </span>
                    <span className="steam-btn-sub">
                      {t.steamCta.wishlistOnSteam}
                    </span>
                  </div>
                </div>
              </a>
            </div>
          ) : (
            <a
              href={STEAM_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.steamCta.ariaLabel}
              className="lunoris-steam-btn lunoris-steam-btn-nav"
            >
              <SteamLogoSvg className="steam-nav-solo-icon" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
