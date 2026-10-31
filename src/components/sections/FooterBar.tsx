"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export function FooterBar() {
  const { t } = useLanguage();

  return (
    <footer className="lunoris-footer">
      <div className="lunoris-wide-wrap lunoris-footer-inner">
        <img
          src="/assets/logo-wordmark.svg"
          alt="Lunoris: Piece of Mind"
          className="lunoris-footer-logo"
        />
        <p className="lunoris-footer-legal">{t.footer.legal}</p>
      </div>
    </footer>
  );
}
