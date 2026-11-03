"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FloatingLetters } from "@/components/ui/FloatingLetters";
import { MagneticLetters } from "@/components/ui/MagneticLetters";
import { DreamRevealLetters } from "@/components/ui/DreamRevealLetters";

interface ScrollTextRevealProps {
  text: string;
  as?: "p" | "div" | "span";
  className?: string;
  style?: React.CSSProperties;
  /** Viewport height fraction where line-by-line reveal begins (default 0.96) */
  startViewportRatio?: number;
  /** Viewport height fraction where all lines finish revealing and stay in place (default 0.74) */
  endViewportRatio?: number;
  /** Render each revealed line with zero-gravity FloatingLetters */
  floatingLetters?: boolean;
  /** Amplitude multiplier for FloatingLetters (default 0.65) */
  floatingIntensity?: number;
  /** Glow color for FloatingLetters */
  floatingGlowColor?: string;
  /** Render each revealed line with cursor-attracted MagneticLetters */
  magneticLetters?: boolean;
  /** Intensity multiplier for MagneticLetters (default 0.68) */
  magneticIntensity?: number;
  /** Glow color for MagneticLetters */
  magneticGlowColor?: string;
  /** Render each revealed line with mist-emerging DreamRevealLetters */
  dreamRevealLetters?: boolean;
  /** Glow color for DreamRevealLetters */
  dreamRevealGlowColor?: string;
  /** Replay key for DreamRevealLetters */
  dreamRevealReplayKey?: number;
}

/**
 * Splits text into layout tokens (splitting on spaces as well as after hyphens/dashes
 * like "violet-indigo" or "Levels—soaring") so words and sub-words can be grouped
 * into exact visual lines matching the browser's native line-wrapping.
 */
function tokenizeText(text: string): string[] {
  if (!text) return [];
  const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
  if (cjkRegex.test(text)) {
    return (
      text.match(
        /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]|[^\s\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+\s*|\s+/g
      ) ?? [text]
    );
  }

  // Split by whitespace first, then split compound hyphenated/dashed words after '-', '–', '—'
  const rawWords = text.trim().split(/\s+/);
  const tokens: string[] = [];

  rawWords.forEach((word, wIdx) => {
    const withSpace = wIdx < rawWords.length - 1 ? `${word} ` : word;
    const parts = withSpace.split(/(?<=[-–—])/);
    for (const part of parts) {
      if (part) tokens.push(part);
    }
  });

  return tokens;
}

export function ScrollTextReveal({
  text,
  as: Tag = "p",
  className = "",
  style,
  startViewportRatio = 0.96,
  endViewportRatio = 0.74,
  floatingLetters = false,
  floatingIntensity = 0.65,
  floatingGlowColor = "rgba(34, 211, 238, 0.75)",
  magneticLetters = false,
  magneticIntensity = 0.68,
  magneticGlowColor = "rgba(251, 191, 36, 0.82)",
  dreamRevealLetters = false,
  dreamRevealGlowColor = "rgba(192, 132, 252, 0.42)",
  dreamRevealReplayKey = 0,
}: ScrollTextRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const maskRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [lines, setLines] = useState<string[]>([text]);

  const tokens = useMemo(() => tokenizeText(text), [text]);

  // Measure actual visual line wraps whenever text, fonts, or container width changes
  useLayoutEffect(() => {
    const container = containerRef.current;
    const measureEl = measureRef.current;
    if (!container || !measureEl) return;

    const computeLines = () => {
      const spans =
        measureEl.querySelectorAll<HTMLSpanElement>("[data-str-tok]");
      if (spans.length === 0) {
        setLines([text]);
        return;
      }

      const grouped: string[] = [];
      let currentLine = "";
      let currentTop: number | null = null;

      spans.forEach((span) => {
        const top = span.offsetTop;
        const tokText = span.textContent ?? "";
        if (currentTop === null || Math.abs(top - currentTop) <= 6) {
          currentLine += tokText;
          if (currentTop === null) currentTop = top;
        } else {
          grouped.push(currentLine.trimEnd());
          currentLine = tokText;
          currentTop = top;
        }
      });

      if (currentLine.length > 0) {
        grouped.push(currentLine.trimEnd());
      }

      const nextLines = grouped.length > 0 ? grouped : [text];
      setLines((prev) => {
        if (
          prev.length === nextLines.length &&
          prev.every((l, i) => l === nextLines[i])
        ) {
          return prev;
        }
        return nextLines;
      });
    };

    computeLines();

    // Re-measure once web fonts finish loading so line widths are 100% exact
    let active = true;
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (active) computeLines();
      });
    }

    const ro = new ResizeObserver(() => {
      computeLines();
    });
    ro.observe(container);

    return () => {
      active = false;
      ro.disconnect();
    };
  }, [text, tokens]);

  // Drive sequential line-by-line mask reveal from scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let smoothProgress = -1;
    let targetProgress = 0;
    let maxReachedProgress = 0;
    let rafId: number | null = null;

    const getViewportHeightInRectSpace = () => {
      const z =
        parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      const offsetW = container.offsetWidth;
      const rectW = container.getBoundingClientRect().width;
      const rectScale = offsetW > 0 ? rectW / offsetW : z;
      const safeRectScale = rectScale > 0.01 ? rectScale : 1;
      const vpScale = safeRectScale / z;
      return window.innerHeight * vpScale;
    };

    const applyLines = (progress: number) => {
      const count = lines.length;
      const span = Math.max(0.42, 1 / (1 + Math.max(0, count - 1) * 0.24));
      const step = count > 1 ? (1 - span) / (count - 1) : 0;

      for (let i = 0; i < count; i++) {
        const lineEl = lineRefs.current[i];
        const maskEl = maskRefs.current[i];
        if (!lineEl) continue;

        const lineStart = i * step;
        const rawLine = (progress - lineStart) / span;
        const clamped = Math.max(0, Math.min(1, rawLine));
        // Cubic ease-out for silky upward emergence from behind the invisible mask
        const eased = 1 - Math.pow(1 - clamped, 3);

        if (dreamRevealLetters || eased >= 0.995) {
          lineEl.style.opacity = "1";
          lineEl.style.transform = "translate3d(0, 0px, 0)";
          if (maskEl) maskEl.style.overflow = "visible";
        } else {
          const yPx = ((1 - eased) * 22).toFixed(2);
          lineEl.style.opacity = eased.toFixed(3);
          lineEl.style.transform = `translate3d(0, ${yPx}px, 0)`;
          if (maskEl) maskEl.style.overflow = "hidden";
        }
      }
    };

    const measureTargetProgress = () => {
      if (reducedMotion) return 1;
      const vpH = getViewportHeightInRectSpace();
      const rect = container.getBoundingClientRect();
      const startY = vpH * startViewportRatio;
      const endY = vpH * endViewportRatio;
      const raw = (startY - rect.top) / Math.max(1, startY - endY);
      const clamped = Math.max(0, Math.min(1, raw));

      // Reset only if the block is scrolled completely below the bottom of the viewport
      if (rect.top > vpH * 1.02) {
        maxReachedProgress = 0;
        return 0;
      }

      if (clamped > maxReachedProgress) {
        maxReachedProgress = clamped;
      }
      return maxReachedProgress;
    };

    const tick = () => {
      const diff = targetProgress - smoothProgress;
      if (Math.abs(diff) > 0.002) {
        smoothProgress += diff * 0.24;
        applyLines(smoothProgress);
        rafId = window.requestAnimationFrame(tick);
      } else {
        smoothProgress = targetProgress;
        applyLines(smoothProgress);
        rafId = null;
      }
    };

    const onScrollOrResize = () => {
      targetProgress = measureTargetProgress();
      if (smoothProgress < 0) {
        smoothProgress = targetProgress;
        applyLines(smoothProgress);
        return;
      }
      if (rafId === null && Math.abs(targetProgress - smoothProgress) > 0.001) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    onScrollOrResize();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [lines, startViewportRatio, endViewportRatio]);

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLParagraphElement>}
      className={`lunoris-scroll-text-reveal ${
        floatingLetters || magneticLetters || dreamRevealLetters
          ? "has-floating-letters"
          : ""
      } ${className}`.trim()}
      style={{ width: "100%", ...style }}
    >
      {/* Hidden layout measurement layer to detect exact visual line breaks */}
      <span ref={measureRef} className="str-measure-layer" aria-hidden="true">
        {tokens.map((tok, i) => (
          <span key={i} data-str-tok="">
            {tok}
          </span>
        ))}
      </span>

      {/* Sequential line-by-line masked reveal */}
      {lines.map((lineText, idx) => (
        <span
          key={idx}
          ref={(el) => {
            maskRefs.current[idx] = el;
          }}
          className="str-line-mask"
        >
          <span
            ref={(el) => {
              lineRefs.current[idx] = el;
            }}
            className="str-line-inner"
          >
            {floatingLetters ? (
              <FloatingLetters
                text={lineText}
                intensity={floatingIntensity}
                glowColor={floatingGlowColor}
              />
            ) : magneticLetters ? (
              <MagneticLetters
                text={lineText}
                intensity={magneticIntensity}
                glowColor={magneticGlowColor}
              />
            ) : dreamRevealLetters ? (
              <DreamRevealLetters
                text={lineText}
                variant="body"
                glowColor={dreamRevealGlowColor}
                baseDelayMs={180 + idx * 160}
                replayKey={dreamRevealReplayKey}
              />
            ) : (
              lineText
            )}
          </span>
        </span>
      ))}
    </Tag>
  );
}
