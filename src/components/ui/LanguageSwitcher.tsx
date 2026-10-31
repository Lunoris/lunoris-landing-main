"use client";

import React, { useEffect, useRef, useState } from "react";
import { CanvasStar } from "@/components/ui/CanvasFrames";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  SUPPORTED_LOCALES,
  getLocaleOption,
  type Locale,
} from "@/i18n/types";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const currentOption = getLocaleOption(locale);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`lunoris-lang-switcher${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className="lunoris-lang-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.meta.languageSelectorLabel}
      >
        <svg
          className="lunoris-lang-globe"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.25" />
          <path d="M2.85 12h18.3" />
          <path d="M12 2.75c2.55 2.52 4 5.82 4 9.25s-1.45 6.73-4 9.25c-2.55-2.52-4-5.82-4-9.25s1.45-6.73 4-9.25Z" />
        </svg>
        <span className="lunoris-lang-code">{currentOption.shortLabel}</span>
        <svg
          className="lunoris-lang-chevron"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 6.25 8 10.25l4-4" />
        </svg>
      </button>

      {open && (
        <div
          className="lunoris-lang-menu"
          role="listbox"
          aria-label={t.meta.languageSelectorLabel}
        >
          <CanvasStar className="lunoris-lang-menu-star" />
          {SUPPORTED_LOCALES.map((option) => {
            const isSelected = option.code === locale;
            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                lang={option.code}
                dir={option.dir}
                onClick={() => handleSelect(option.code)}
                className={`lunoris-lang-option${
                  isSelected ? " is-active" : ""
                }`}
              >
                <span className="lunoris-lang-option-left">
                  <span className="lunoris-lang-option-badge">
                    {option.shortLabel}
                  </span>
                  <span className="lunoris-lang-option-name">
                    {option.nativeName}
                  </span>
                </span>
                {isSelected && (
                  <CanvasStar className="lunoris-lang-active-star" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
