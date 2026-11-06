"use client";

import React from "react";
import { FloatingLetters } from "@/components/ui/FloatingLetters";
import { MagneticLetters } from "@/components/ui/MagneticLetters";
import { useLanguage } from "@/i18n/LanguageContext";

export function FooterBar({
  floatingLetters = false,
  retroCrt = false,
  floatingGlowColor,
  floatingIntensity,
  floatingWordmark = false,
}: {
  floatingLetters?: boolean;
  retroCrt?: boolean;
  floatingGlowColor?: string;
  floatingIntensity?: number;
  floatingWordmark?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <footer className="lunoris-footer">
      <div className="lunoris-wide-wrap lunoris-footer-inner">
        {floatingWordmark ? (
          <FloatingLetters
            text="LUNORIS"
            className="dream-levels-footer-wordmark"
            glowColor={floatingGlowColor ?? "rgba(34, 211, 238, 0.88)"}
            intensity={floatingIntensity ?? 1.08}
          />
        ) : (
          <img
            src="/assets/logo-wordmark.svg"
            alt="Lunoris: Piece of Mind"
            className="lunoris-footer-logo"
          />
        )}
        <p className="lunoris-footer-legal">
          {retroCrt ? (
            <MagneticLetters
              text={t.footer.legal}
              glowColor="rgba(251, 191, 36, 0.78)"
              intensity={0.68}
            />
          ) : floatingLetters ? (
            <FloatingLetters
              text={t.footer.legal}
              glowColor={floatingGlowColor ?? "rgba(167, 139, 250, 0.72)"}
              intensity={floatingIntensity ?? 0.58}
            />
          ) : (
            t.footer.legal
          )}
        </p>
      </div>
    </footer>
  );
}
