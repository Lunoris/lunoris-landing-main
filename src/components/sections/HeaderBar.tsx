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
}

export function HeaderBar({
  navBtnSlotRef,
  steamBtnRef,
  navLinks,
  logoHref = "#top",
  enableFlyingCta = true,
}: HeaderBarProps) {
  const { t } = useLanguage();
  const isAnchorLogo = logoHref.startsWith("#");

  const resolvedNavLinks: NavLinkItem[] = navLinks ?? [
    { href: "#news", label: t.nav.latestNews },
    { href: "#world", label: t.nav.theWorld },
    { href: "#companions", label: t.nav.companions },
    { href: "#characters", label: t.nav.characters },
    { href: "#team", label: t.nav.team },
    { href: "#roadmap", label: t.nav.roadmap },
  ];

  return (
    <header className="lunoris-header">
      <div className="lunoris-header-inner">
        <div className="lunoris-header-left">
          {isAnchorLogo ? (
            <a href={logoHref} className="lunoris-logo-link">
              <img
                src="/assets/logo-wordmark.svg"
                alt="Lunoris: Piece of Mind"
                className="lunoris-logo-img"
              />
            </a>
          ) : (
            <Link href={logoHref} className="lunoris-logo-link">
              <img
                src="/assets/logo-wordmark.svg"
                alt="Lunoris: Piece of Mind"
                className="lunoris-logo-img"
              />
            </Link>
          )}

          <nav className="lunoris-nav">
            {resolvedNavLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href}>
                  {link.label}
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
