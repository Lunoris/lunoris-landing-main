"use client";

import React, { useEffect, useMemo, useRef } from "react";

export interface VoidDistortionLettersProps {
  text: string;
  className?: string;
  /** "heading" = per-letter void wave & chromatic rift on hover; "body" = subtle void ripple on hover */
  variant?: "heading" | "body";
  /** Accent void glow color */
  glowColor?: string;
  baseDelayMs?: number;
  replayKey?: number;
}

function seededWaveClass(seed: number): string {
  const mod = ((seed * 1103515245 + 12345) >>> 16) % 4;
  if (mod === 0) return "is-void-wave-a";
  if (mod === 1) return "is-void-wave-b";
  if (mod === 2) return "is-void-wave-c";
  return "is-void-wave-d";
}

/**
 * VoidDistortionLetters ("Void Distortion — лёгкое искажение текста при наведении"):
 * - Crisp, legible text at rest with a subtle violet-indigo aura.
 * - On hover (over the text or parent Nightmare portal card), letters gently warp with
 *   organic skew/wave distortion and a subtle twin-echo void split (violet + indigo),
 *   plus cursor-proximity spatial pull when moving the pointer across the letters.
 */
export function VoidDistortionLetters({
  text,
  className = "",
  variant = "heading",
  glowColor = "rgba(192, 132, 252, 0.48)",
}: VoidDistortionLettersProps) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const isArabicCursive = useMemo(() => /[\u0600-\u06FF]/.test(text), [text]);

  const wordTokens = useMemo(() => {
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
          globalIdx: idx,
          char: ch,
          waveClass: seededWaveClass(idx * 17 + code),
          phaseDelayMs: (idx * 65) % 520,
        };
      });

      return {
        wordIndex: wIdx,
        chars,
      };
    });
  }, [text, isArabicCursive]);

  // Smooth interactive cursor-proximity void distortion when moving pointer over the portal/text
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hostCard =
      (root.closest(".is-nightmare-portal") as HTMLElement | null) || root;

    let rafId: number | null = null;
    let pointerActive = false;
    let mouseX = -9999;
    let mouseY = -9999;

    const radius = variant === "heading" ? 135 : 95;
    const maxShiftX = variant === "heading" ? 3.2 : 1.6;
    const maxShiftY = variant === "heading" ? 2.4 : 1.2;
    const maxSkew = variant === "heading" ? 8.5 : 4.2;

    const currentX = new Float32Array(charRefs.current.length);
    const currentY = new Float32Array(charRefs.current.length);
    const currentSkew = new Float32Array(charRefs.current.length);

    const tick = () => {
      rafId = null;
      let stillMoving = false;
      const z =
        parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

      for (let i = 0; i < charRefs.current.length; i++) {
        const el = charRefs.current[i];
        if (!el) continue;

        let targetX = 0;
        let targetY = 0;
        let targetSkew = 0;

        if (pointerActive) {
          const rect = el.getBoundingClientRect();
          const cx = (rect.left + rect.width * 0.5) * z;
          const cy = (rect.top + rect.height * 0.5) * z;
          const dx = mouseX - cx;
          const dy = mouseY - cy;
          const dist = Math.hypot(dx, dy);

          if (dist < radius && dist > 0.1) {
            const falloff = Math.pow(1 - dist / radius, 1.6);
            const angle = Math.atan2(dy, dx);
            // Tangential swirl + slight pinch for a spatial void lens feel
            targetX = Math.sin(angle * 2 + i * 0.7) * maxShiftX * falloff;
            targetY = -Math.cos(angle * 1.5 + i * 0.5) * maxShiftY * falloff;
            targetSkew = (dx / radius) * maxSkew * falloff;
          }
        }

        currentX[i] += (targetX - currentX[i]) * 0.22;
        currentY[i] += (targetY - currentY[i]) * 0.22;
        currentSkew[i] += (targetSkew - currentSkew[i]) * 0.22;

        if (
          Math.abs(targetX - currentX[i]) > 0.04 ||
          Math.abs(targetY - currentY[i]) > 0.04 ||
          Math.abs(targetSkew - currentSkew[i]) > 0.06
        ) {
          stillMoving = true;
        }

        if (
          Math.abs(currentX[i]) < 0.03 &&
          Math.abs(currentY[i]) < 0.03 &&
          Math.abs(currentSkew[i]) < 0.05
        ) {
          el.style.removeProperty("--void-dx");
          el.style.removeProperty("--void-dy");
          el.style.removeProperty("--void-skew");
        } else {
          el.style.setProperty("--void-dx", `${currentX[i].toFixed(2)}px`);
          el.style.setProperty("--void-dy", `${currentY[i].toFixed(2)}px`);
          el.style.setProperty("--void-skew", `${currentSkew[i].toFixed(2)}deg`);
        }
      }

      if (stillMoving) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const schedule = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      pointerActive = true;
      schedule();
    };

    const onLeave = () => {
      pointerActive = false;
      schedule();
    };

    hostCard.addEventListener("mousemove", onMove, { passive: true });
    hostCard.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      hostCard.removeEventListener("mousemove", onMove);
      hostCard.removeEventListener("mouseleave", onLeave);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [variant, wordTokens]);

  charRefs.current = [];

  return (
    <span
      ref={rootRef}
      className={`void-distortion-root ${
        variant === "heading" ? "is-heading" : "is-body"
      } ${className}`.trim()}
      aria-label={text}
      style={
        {
          "--void-glow-color": glowColor,
        } as React.CSSProperties
      }
    >
      <span className="void-distortion-content" aria-hidden="true">
        {wordTokens.map((word, wIdx) => (
          <React.Fragment key={word.wordIndex}>
            <span className="void-distortion-word">
              {word.chars.map((c) => (
                <span
                  key={c.id}
                  ref={(el) => {
                    charRefs.current[c.globalIdx] = el;
                  }}
                  className={`void-distortion-char ${c.waveClass}`}
                  data-char={c.char}
                  style={
                    {
                      "--void-delay": `-${c.phaseDelayMs}ms`,
                    } as React.CSSProperties
                  }
                >
                  <span className="void-distortion-glyph">{c.char}</span>
                </span>
              ))}
            </span>
            {wIdx < wordTokens.length - 1 ? (
              <span className="void-distortion-space">{"\u00A0"}</span>
            ) : null}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
}

export const DreamRevealLetters = VoidDistortionLetters;
