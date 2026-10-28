import React from "react";
import Link from "next/link";
import {
  MAIN_NAV_LINKS,
  STEAM_STORE_URL,
  type NavLinkItem,
} from "@/data/gameData";
import {
  BrushstrokeButtonBg,
  CanvasStar,
  SteamLogoSvg,
} from "@/components/ui/CanvasFrames";

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
  navLinks = MAIN_NAV_LINKS,
  logoHref = "#top",
  enableFlyingCta = true,
}: HeaderBarProps) {
  const isAnchorLogo = logoHref.startsWith("#");

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
            {navLinks.map((link) =>
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
          {enableFlyingCta ? (
            <div ref={navBtnSlotRef} className="lunoris-steam-nav-slot">
              <a
                ref={steamBtnRef}
                href={STEAM_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Play Free Demo and Wishlist on Steam"
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

                {/* Clean white transparent Steam logo in top header & during right-edge flight */}
                <SteamLogoSvg className="steam-nav-solo-icon" />

                {/* Larger full brushstroke Steam CTA button revealed at the bottom of the page */}
                <div className="steam-cta-full-body">
                  <BrushstrokeButtonBg />
                  <SteamLogoSvg className="steam-icon" />
                  <div className="steam-btn-text">
                    <span className="steam-btn-main">Play Free Demo</span>
                    <span className="steam-btn-sub">Wishlist on Steam</span>
                  </div>
                </div>
              </a>
            </div>
          ) : (
            <a
              href={STEAM_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Play Free Demo and Wishlist on Steam"
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
