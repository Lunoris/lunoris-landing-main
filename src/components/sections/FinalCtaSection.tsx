"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

interface FinalCtaSectionProps {
  finalCtaSlotRef: React.RefObject<HTMLDivElement | null>;
}

export function FinalCtaSection({ finalCtaSlotRef }: FinalCtaSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="lunoris-final-cta">
      <div
        className="lunoris-mural-bg"
        style={{ backgroundImage: "url('/assets/elar-hope.jpg')" }}
        aria-hidden="true"
      />
      <div className="lunoris-mural-fade-top" aria-hidden="true" />
      <div className="lunoris-mural-fade-bottom" aria-hidden="true" />

      <div className="lunoris-wide-wrap lunoris-final-cta-inner">
        <div className="lunoris-final-cta-headings">
          <span className="lunoris-title-minor">{t.finalCta.minor}</span>
          <h2 className="lunoris-title-major">{t.finalCta.major}</h2>
          <div
            className="lunoris-center-bar"
            style={{ margin: "1.5rem auto 2.6rem" }}
          />
        </div>
        <div
          ref={finalCtaSlotRef}
          className="lunoris-steam-cta-landing-slot"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
