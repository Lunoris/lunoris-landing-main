"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { observeInView } from "@/components/ui/inViewObserver";

export interface FloatingLettersProps {
  text: string;
  className?: string;
  /** Optional accent glow color when cursor approaches letters */
  glowColor?: string;
  /** Amplitude multiplier (1 = default portal/hero intensity) */
  intensity?: number;
}

interface CharMotionSpec {
  id: string;
  char: string;
  variantClass: string;
}

function seededHash(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return Math.floor((x - Math.floor(x)) * 16);
}

// ============================================================================
// SHARED GLOBAL INTERSECTION OBSERVER & POINTER TRACKER
// 1 global mousemove listener + 1 IntersectionObserver for the whole page
// ============================================================================

interface RegisteredInstance {
  container: HTMLElement;
  inView: boolean;
  isAnimating: boolean;
  onPointerTick: (mouseX: number, mouseY: number, active: boolean) => boolean;
}

const activeInstances = new Set<RegisteredInstance>();

let globalMouseX = -9999;
let globalMouseY = -9999;
let globalPointerActive = false;
let globalRafId: number | null = null;
let listenersAttached = false;

function scheduleGlobalTick() {
  if (globalRafId !== null) return;
  globalRafId = window.requestAnimationFrame(runGlobalTick);
}

function runGlobalTick() {
  globalRafId = null;
  let anyStillMoving = false;

  activeInstances.forEach((inst) => {
    if (!inst.inView && !inst.isAnimating) return;
    const moving = inst.onPointerTick(
      globalMouseX,
      globalMouseY,
      globalPointerActive && inst.inView
    );
    inst.isAnimating = moving;
    if (moving) anyStillMoving = true;
  });

  if (anyStillMoving) {
    globalRafId = window.requestAnimationFrame(runGlobalTick);
  }
}

function ensureGlobalInfrastructure() {
  if (typeof window === "undefined") return;

  if (!listenersAttached) {
    listenersAttached = true;
    window.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        globalMouseX = e.clientX;
        globalMouseY = e.clientY;
        globalPointerActive = true;
        scheduleGlobalTick();
      },
      { passive: true }
    );
    document.addEventListener(
      "mouseleave",
      () => {
        globalPointerActive = false;
        scheduleGlobalTick();
      },
      { passive: true }
    );
  }
}

/**
 * FloatingLetters ("Парящие буквы"):
 * GPU-composited zero-gravity typography:
 * - Uses pure constant @keyframes (no CSS var() inside @keyframes, so Chromium runs 100% on GPU compositor thread)
 * - Zero inline style objects per letter
 * - Shared IntersectionObserver pauses offscreen animations
 */
export function FloatingLetters({
  text,
  className = "",
  glowColor = "rgba(34, 211, 238, 0.72)",
  intensity = 1,
}: FloatingLettersProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const isArabicCursive = useMemo(() => /[\u0600-\u06FF]/.test(text), [text]);
  const tierPrefix = intensity >= 0.74 ? "fl-h" : "fl-b";

  const wordTokens = useMemo(() => {
    const cleanText = (text || "").trim();
    const rawWords = cleanText.split(/\s+/).filter(Boolean);
    // Group longer body sentences into 2-3 char micro-clusters for minimal DOM overhead
    const chunkSize =
      cleanText.length > 110 ? 3 : cleanText.length > 55 ? 2 : 1;
    let globalIdx = 0;

    return rawWords.map((word, wIdx) => {
      let units: string[];
      if (isArabicCursive) {
        units = [word];
      } else {
        const glyphs = Array.from(word);
        if (chunkSize === 1) {
          units = glyphs;
        } else {
          units = [];
          for (let i = 0; i < glyphs.length; i += chunkSize) {
            units.push(glyphs.slice(i, i + chunkSize).join(""));
          }
        }
      }

      const chars: CharMotionSpec[] = units.map((ch) => {
        const idx = globalIdx++;
        const code = ch.charCodeAt(0) || 65;
        const vIdx = seededHash(idx * 7 + code) % 8;

        return {
          id: `${wIdx}-${idx}`,
          char: ch,
          variantClass: `${tierPrefix}${vIdx}`,
        };
      });

      return {
        wordIndex: wIdx,
        chars,
      };
    });
  }, [text, isArabicCursive, tierPrefix]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    ensureGlobalInfrastructure();

    const radius = 120;
    let localOffsetsMeasured = false;
    let lastMeasuredWidth = -1;
    let lastMeasuredHeight = -1;
    const localCenters: { x: number; y: number }[] = [];
    const states = charRefs.current.map(() => ({
      x: 0,
      y: 0,
      glowing: false,
    }));

    const measureLocalOffsets = (cRect: DOMRect) => {
      const nodes = charRefs.current;
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (!el) {
          localCenters[i] = { x: 0, y: 0 };
          continue;
        }
        const r = el.getBoundingClientRect();
        const st = states[i];
        const curX = st ? st.x : 0;
        const curY = st ? st.y : 0;
        localCenters[i] = {
          x: r.left - cRect.left - curX + r.width * 0.5,
          y: r.top - cRect.top - curY + r.height * 0.5,
        };
      }
      localOffsetsMeasured = true;
      lastMeasuredWidth = cRect.width;
      lastMeasuredHeight = cRect.height;
    };

    const instance: RegisteredInstance = {
      container,
      inView: false,
      isAnimating: false,
      onPointerTick: (mouseX, mouseY, active) => {
        const nodes = charRefs.current;
        if (nodes.length === 0) return false;

        let nearContainer = false;
        let cLeft = 0;
        let cTop = 0;
        let cRect: DOMRect | null = null;

        if (active) {
          cRect = container.getBoundingClientRect();
          cLeft = cRect.left;
          cTop = cRect.top;
          nearContainer =
            mouseX >= cRect.left - radius &&
            mouseX <= cRect.right + radius &&
            mouseY >= cRect.top - radius &&
            mouseY <= cRect.bottom + radius;
        }

        if (!nearContainer && !instance.isAnimating) {
          return false;
        }

        if (
          nearContainer &&
          cRect &&
          (!localOffsetsMeasured ||
            Math.abs(cRect.width - lastMeasuredWidth) > 0.5 ||
            Math.abs(cRect.height - lastMeasuredHeight) > 0.5)
        ) {
          measureLocalOffsets(cRect);
        }

        const relMouseX = mouseX - cLeft;
        const relMouseY = mouseY - cTop;
        let anyMoving = false;

        for (let i = 0; i < nodes.length; i++) {
          const el = nodes[i];
          if (!el) continue;

          if (!states[i]) {
            states[i] = { x: 0, y: 0, glowing: false };
          }
          const st = states[i];

          let targetX = 0;
          let targetY = 0;
          let shouldGlow = false;

          if (nearContainer && localCenters[i]) {
            const dx = localCenters[i].x - relMouseX;
            const dy = localCenters[i].y - relMouseY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius && distSq > 0.01) {
              const dist = Math.sqrt(distSq);
              const falloff = 1 - dist / radius;
              const ease = falloff * falloff * (3 - 2 * falloff);
              const nx = dx / dist;
              const ny = dy / dist;

              targetX = nx * ease * 5.8 * intensity;
              targetY = (ny * 4.8 - 1.8) * ease * intensity;
              shouldGlow = ease > 0.25;
            }
          }

          st.x += (targetX - st.x) * 0.16;
          st.y += (targetY - st.y) * 0.16;

          if (
            Math.abs(targetX - st.x) > 0.08 ||
            Math.abs(targetY - st.y) > 0.08 ||
            Math.abs(st.x) > 0.08 ||
            Math.abs(st.y) > 0.08
          ) {
            anyMoving = true;
            el.style.translate = `${st.x.toFixed(1)}px ${st.y.toFixed(1)}px`;
            if (shouldGlow !== st.glowing) {
              st.glowing = shouldGlow;
              el.classList.toggle("is-glowing", shouldGlow);
            }
          } else if (st.x !== 0 || st.y !== 0 || st.glowing) {
            st.x = 0;
            st.y = 0;
            st.glowing = false;
            el.style.translate = "";
            el.classList.remove("is-glowing");
          }
        }

        return anyMoving;
      },
    };

    activeInstances.add(instance);
    const stopObserving = observeInView(container, (visible) => {
      instance.inView = visible;
    });

    return () => {
      activeInstances.delete(instance);
      stopObserving();
    };
  }, [wordTokens, intensity]);

  let flatCursor = 0;

  return (
    <span
      ref={containerRef}
      className={`floating-letters-root ${className}`.trim()}
      aria-label={text}
      style={{ "--fl-glow-color": glowColor } as React.CSSProperties}
    >
      {wordTokens.map((word, wIdx) => (
        <React.Fragment key={word.wordIndex}>
          <span className="floating-letters-word" aria-hidden="true">
            {word.chars.map((c) => {
              const refIdx = flatCursor++;
              return (
                <span
                  key={c.id}
                  ref={(el) => {
                    charRefs.current[refIdx] = el;
                  }}
                  className={`floating-letter ${c.variantClass}`}
                >
                  {c.char}
                </span>
              );
            })}
          </span>
          {wIdx < wordTokens.length - 1 ? (
            <span className="floating-letters-space" aria-hidden="true">
              {" "}
            </span>
          ) : null}
        </React.Fragment>
      ))}
    </span>
  );
}
