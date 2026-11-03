"use client";

import React, { useMemo } from "react";

export interface RetroArcadeTextProps {
  text: string;
  className?: string;
  /** "heading" = Arcade Neon Flicker + CRT scanlines; "body" = CRT monitor scanlines + phosphor flicker */
  variant?: "heading" | "body";
  /** Optional accent glow color */
  glowColor?: string;
  /** Intensity multiplier */
  intensity?: number;
}

function seededFlickerClass(seed: number): string {
  const mod = ((seed * 1103515245 + 12345) >>> 16) % 7;
  if (mod === 0) return "is-flicker-a";
  if (mod === 3) return "is-flicker-b";
  if (mod === 5) return "is-flicker-c";
  return "is-pulse-steady";
}

/**
 * RetroArcadeText ("CRT Effect + Neon Flicker"):
 * - Horizontal CRT scanlines clipped strictly to the letter glyphs (no rectangular box)
 * - Subtle CRT phosphor flicker & occasional barely-perceptible H-sync distortion
 * - Arcade cabinet Neon Flicker glow around letters with smooth intensity breathing
 * - Intensifies glow & phosphor brilliance on hover
 */
export function RetroArcadeText({
  text,
  className = "",
  variant,
  glowColor = "rgba(251, 191, 36, 0.92)",
  intensity = 1,
}: RetroArcadeTextProps) {
  const resolvedVariant = variant ?? (intensity >= 0.85 ? "heading" : "body");
  const isArabicCursive = useMemo(() => /[\u0600-\u06FF]/.test(text), [text]);

  const wordTokens = useMemo(() => {
    if (resolvedVariant === "body") return [];
    const cleanText = (text || "").trim();
    const rawWords = cleanText.split(/\s+/).filter(Boolean);
    let globalIdx = 0;

    return rawWords.map((word, wIdx) => {
      const units = isArabicCursive ? [word] : Array.from(word);

      const chars = units.map((ch) => {
        const idx = globalIdx++;
        const code = ch.charCodeAt(0) || 65;
        return {
          id: `${wIdx}-${idx}`,
          char: ch,
          flickerClass: seededFlickerClass(idx * 13 + code),
        };
      });

      return {
        wordIndex: wIdx,
        chars,
      };
    });
  }, [text, isArabicCursive, resolvedVariant]);

  if (resolvedVariant === "body") {
    return (
      <span
        className={`retro-crt-neon-root is-body ${className}`.trim()}
        aria-label={text}
        style={{ "--retro-neon-color": glowColor } as React.CSSProperties}
      >
        <span
          className="retro-crt-line-glyphs"
          data-text={text}
          aria-hidden="true"
        >
          {text}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`retro-crt-neon-root is-heading ${className}`.trim()}
      aria-label={text}
      style={{ "--retro-neon-color": glowColor } as React.CSSProperties}
    >
      <span className="retro-crt-content" aria-hidden="true">
        {wordTokens.map((word, wIdx) => (
          <React.Fragment key={word.wordIndex}>
            <span className="retro-crt-word">
              {word.chars.map((c) => (
                <span
                  key={c.id}
                  className={`retro-crt-char ${c.flickerClass}`}
                  data-text={c.char}
                >
                  {c.char}
                </span>
              ))}
            </span>
            {wIdx < wordTokens.length - 1 ? (
              <span className="retro-crt-space">{"\u00A0"}</span>
            ) : null}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
}

export const MagneticLetters = RetroArcadeText;
