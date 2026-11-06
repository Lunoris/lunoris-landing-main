"use client";

import React, { useEffect, useRef, useState } from "react";

export type RetroTransitionMode = "pixel" | "shutter" | "iris" | "blinds";

export interface RetroTransitionOptions {
  /** Which transition from the Pixel / Shutter / Iris / Blinds pack to run. If omitted, uses the active/cycled mode. */
  mode?: RetroTransitionMode;
  /** Duration of the close and open phases in ms (defaults to 820ms each) */
  phaseDurationMs?: number;
  /** Callback fired at midpoint when the screen is 100% covered */
  onMidTransition?: () => void;
  /**
   * Called right after `onMidTransition`. The screen stays fully covered until the
   * returned promise settles (e.g. the new route has painted), then it opens.
   */
  waitUntil?: () => Promise<unknown>;
  /** Callback fired when the transition finishes opening */
  onComplete?: () => void;
}

const RETRO_TRANSITION_EVENT = "lunoris:retro-transition";
const RETRO_MODE_STORAGE_KEY = "lunoris:retro-transition-mode";
const RETRO_MODES_ORDER: RetroTransitionMode[] = [
  "pixel",
  "shutter",
  "iris",
  "blinds",
];

let sharedRetroAudioCtx: AudioContext | null = null;
let cycleCounter = 0;

function getRetroAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedRetroAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      sharedRetroAudioCtx = new AudioCtx();
    }
  }
  return sharedRetroAudioCtx;
}

export function unlockRetroAudio() {
  if (typeof window === "undefined") return;
  const ctx = getRetroAudioCtx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

function playRetroTransitionSfx(
  mode: RetroTransitionMode,
  phase: "in" | "out"
) {
  if (typeof window === "undefined") return;
  const ctx = getRetroAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.16, now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    master.connect(ctx.destination);

    if (mode === "pixel") {
      const notes =
        phase === "in"
          ? [523.25, 440, 349.23, 261.63, 196.0]
          : [196.0, 261.63, 349.23, 440, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "square";
        const t0 = now + idx * 0.065;
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.22, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + 0.085);
      });
    } else if (mode === "shutter") {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const startFreq = phase === "in" ? 320 : 120;
      const endFreq = phase === "in" ? 95 : 380;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.38);
      osc.connect(master);
      osc.start(now);
      osc.stop(now + 0.42);
    } else if (mode === "iris") {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      const f0 = phase === "in" ? 680 : 180;
      const f1 = phase === "in" ? 150 : 720;
      osc.frequency.setValueAtTime(f0, now);
      osc.frequency.exponentialRampToValueAtTime(f1, now + 0.44);
      osc.connect(master);
      osc.start(now);
      osc.stop(now + 0.46);
    } else {
      // blinds: cascading synth ticks
      const steps = 6;
      for (let i = 0; i < steps; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "square";
        const t0 = now + i * 0.055;
        const freq =
          phase === "in" ? 480 - i * 48 : 220 + i * 52;
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.18, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + 0.065);
      }
    }
  } catch {
    // Ignore audio synthesis errors
  }
}

export function getSavedRetroTransitionMode(): RetroTransitionMode {
  if (typeof window === "undefined") return "pixel";
  try {
    const saved = window.sessionStorage.getItem(RETRO_MODE_STORAGE_KEY);
    if (
      saved === "pixel" ||
      saved === "shutter" ||
      saved === "iris" ||
      saved === "blinds"
    ) {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return "pixel";
}

export function setSavedRetroTransitionMode(mode: RetroTransitionMode) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(RETRO_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors
  }
}

export function getNextCycledRetroTransitionMode(): RetroTransitionMode {
  if (typeof window !== "undefined") {
    try {
      const saved = window.sessionStorage.getItem(RETRO_MODE_STORAGE_KEY);
      if (
        saved === "pixel" ||
        saved === "shutter" ||
        saved === "iris" ||
        saved === "blinds"
      ) {
        return saved;
      }
    } catch {
      // Ignore
    }
  }
  const mode = RETRO_MODES_ORDER[cycleCounter % RETRO_MODES_ORDER.length];
  cycleCounter += 1;
  return mode;
}

export function triggerRetroTransition(options: RetroTransitionOptions = {}) {
  if (typeof window === "undefined") return;
  unlockRetroAudio();
  window.dispatchEvent(
    new CustomEvent<RetroTransitionOptions>(RETRO_TRANSITION_EVENT, {
      detail: options,
    })
  );
}

function easeInOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

function hash2D(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function drawCrtScanlinesAndHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mode: RetroTransitionMode,
  coverage: number
) {
  if (coverage <= 0.05) return;

  // Subtle horizontal CRT scanlines over dark covered areas
  ctx.save();
  ctx.fillStyle = `rgba(251, 191, 36, ${(0.035 * coverage).toFixed(3)})`;
  const step = 4;
  for (let y = 0; y < h; y += step) {
    ctx.fillRect(0, y, w, 1.2);
  }

  // Center retro arcade badge when coverage is near peak
  if (coverage > 0.65) {
    const badgeAlpha = Math.min(1, (coverage - 0.65) / 0.3);
    const labelMap: Record<RetroTransitionMode, string> = {
      pixel: "PIXEL TRANSITION · CRT 1988",
      shutter: "SHUTTER WIPE · ARCADE GATE",
      iris: "IRIS APERTURE · RETRO MEMORY",
      blinds: "BLINDS RASTER · ECHO SIGNAL",
    };
    ctx.font = "600 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(251, 191, 36, 0.9)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = `rgba(254, 243, 199, ${(badgeAlpha * 0.92).toFixed(3)})`;
    ctx.fillText(`✦ ${labelMap[mode]} ✦`, w * 0.5, h * 0.5);
  }
  ctx.restore();
}

export function RetroArcadeTransition() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const handleTrigger = (evt: Event) => {
      const customEvt = evt as CustomEvent<RetroTransitionOptions>;
      const detail = customEvt.detail || {};
      const mode: RetroTransitionMode = detail.mode || "pixel";
      const phaseDurationMs = detail.phaseDurationMs ?? 780;
      const onMidTransition = detail.onMidTransition;
      const waitUntil = detail.waitUntil;
      const onComplete = detail.onComplete;

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }

      setActive(true);
      playRetroTransitionSfx(mode, "in");

      const canvas = canvasRef.current;
      if (!canvas) {
        onMidTransition?.();
        onComplete?.();
        setActive(false);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const rootZoom =
        parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      const vw = Math.max(
        320,
        Math.round(rect.width > 0 ? rect.width : window.innerWidth / rootZoom)
      );
      const vh = Math.max(
        240,
        Math.round(rect.height > 0 ? rect.height : window.innerHeight / rootZoom)
      );
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        onMidTransition?.();
        onComplete?.();
        setActive(false);
        return;
      }

      const HOLD_MS = 130;
      const totalMs = phaseDurationMs * 2 + HOLD_MS;
      const startTime = performance.now();
      let midpointFired = false;
      let outSfxPlayed = false;
      // Time spent holding at full coverage while the new route renders
      let pausedMs = 0;
      let routeReady = !waitUntil;
      const holdEnd = phaseDurationMs + HOLD_MS;

      const fireMidpoint = () => {
        midpointFired = true;
        onMidTransition?.();
        if (waitUntil) {
          const markReady = () => {
            routeReady = true;
          };
          waitUntil().then(markReady, markReady);
        }
      };

      const renderFrame = (now: number) => {
        let elapsed = now - startTime - pausedMs;
        if (midpointFired && !routeReady && elapsed >= holdEnd - 1) {
          pausedMs += elapsed - (holdEnd - 1);
          elapsed = holdEnd - 1;
        }
        let progress = 0; // 0 = uncovered, 1 = fully covered
        let isOpening = false;

        if (elapsed < phaseDurationMs) {
          progress = easeInOutCubic(elapsed / phaseDurationMs);
          isOpening = false;
        } else if (elapsed < phaseDurationMs + HOLD_MS) {
          progress = 1;
          isOpening = true;
          if (!midpointFired) {
            fireMidpoint();
          }
        } else {
          if (!midpointFired) {
            fireMidpoint();
          }
          if (!outSfxPlayed) {
            outSfxPlayed = true;
            playRetroTransitionSfx(mode, "out");
          }
          const outElapsed = elapsed - (phaseDurationMs + HOLD_MS);
          progress = 1 - easeInOutCubic(Math.min(1, outElapsed / phaseDurationMs));
          isOpening = true;
        }

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, vw, vh);

        // 1. PIXEL TRANSITION — экран закрывается пикселями
        if (mode === "pixel") {
          const cols = 28;
          const cellW = Math.ceil(vw / cols);
          const rows = Math.ceil(vh / cellW);
          const cx = (cols - 1) * 0.5;
          const cy = (rows - 1) * 0.5;
          const maxDist = Math.hypot(cx, cy) || 1;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const rand = hash2D(c + 11, r + 23);
              const radial = Math.hypot(c - cx, r - cy) / maxDist;
              // Combine radial wave + random pixel jitter
              const threshold =
                (isOpening ? 1 - radial : radial) * 0.45 + rand * 0.55;
              const localP = (progress * 1.32 - threshold * 0.62) / 0.38;

              if (localP <= 0) continue;

              const x = c * cellW;
              const y = r * cellW;

              if (localP >= 1) {
                ctx.fillStyle = "#06040f";
                ctx.fillRect(x, y, cellW + 0.8, cellW + 0.8);
              } else {
                // Leading arcade pixel edge glows amber / gold / magenta
                const s = Math.max(0.15, Math.min(1, localP));
                const pad = (1 - s) * cellW * 0.5;
                ctx.fillStyle =
                  localP < 0.45
                    ? `rgba(251, 191, 36, ${(localP * 2.1).toFixed(3)})`
                    : localP < 0.78
                      ? "rgba(245, 158, 11, 0.96)"
                      : "#090616";
                ctx.fillRect(
                  x + pad,
                  y + pad,
                  cellW * s + 0.5,
                  cellW * s + 0.5
                );
              }
            }
          }
          drawCrtScanlinesAndHud(ctx, vw, vh, mode, progress);
        }

        // 2. SHUTTER TRANSITION — экран закрывается горизонтальными и вертикальными полосами
        else if (mode === "shutter") {
          const hReach = Math.min(1, progress * 1.12) * (vh * 0.5);
          const vReach = Math.max(0, (progress - 0.12) / 0.88) * (vw * 0.5);

          ctx.fillStyle = "#06040f";
          // Top & Bottom horizontal shutter blades
          ctx.fillRect(0, 0, vw, hReach);
          ctx.fillRect(0, vh - hReach, vw, hReach);

          // Left & Right vertical shutter blades
          ctx.fillRect(0, 0, vReach, vh);
          ctx.fillRect(vw - vReach, 0, vReach, vh);

          // Glowing neon amber shutter edges
          ctx.save();
          ctx.shadowColor = "rgba(251, 191, 36, 0.95)";
          ctx.shadowBlur = 16;
          ctx.fillStyle = "#fbbf24";
          if (hReach > 1 && hReach < vh * 0.5) {
            ctx.fillRect(0, hReach - 2, vw, 3);
            ctx.fillRect(0, vh - hReach - 1, vw, 3);
          }
          if (vReach > 1 && vReach < vw * 0.5) {
            ctx.fillRect(vReach - 2, 0, 3, vh);
            ctx.fillRect(vw - vReach - 1, 0, 3, vh);
          }
          ctx.restore();

          drawCrtScanlinesAndHud(ctx, vw, vh, mode, progress);
        }

        // 3. IRIS TRANSITION — круг постепенно закрывает изображение
        else if (mode === "iris") {
          const maxR = Math.hypot(vw * 0.5, vh * 0.5) * 1.04;
          // Quantize radius slightly for authentic retro CRT stepped iris feel
          const rawR = Math.max(0, maxR * (1 - progress));
          const stepPx = 6;
          const r = progress >= 0.995 ? 0 : Math.round(rawR / stepPx) * stepPx;

          ctx.save();
          ctx.fillStyle = "#06040f";
          ctx.beginPath();
          ctx.rect(0, 0, vw, vh);
          if (r > 0.5) {
            ctx.arc(vw * 0.5, vh * 0.5, r, 0, Math.PI * 2, true);
          }
          ctx.fill("evenodd");

          // Glowing arcade neon ring around the closing/opening iris circle
          if (r > 1 && r < maxR * 0.98) {
            ctx.beginPath();
            ctx.arc(vw * 0.5, vh * 0.5, r, 0, Math.PI * 2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#fbbf24";
            ctx.shadowColor = "rgba(251, 191, 36, 0.95)";
            ctx.shadowBlur = 20;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(vw * 0.5, vh * 0.5, r + 6, 0, Math.PI * 2);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(217, 70, 239, 0.65)";
            ctx.stroke();
          }
          ctx.restore();

          drawCrtScanlinesAndHud(ctx, vw, vh, mode, progress);
        }

        // 4. BLINDS TRANSITION — переход через последовательные полосы
        else {
          const slats = 14;
          const slatH = Math.ceil(vh / slats);

          for (let i = 0; i < slats; i++) {
            const idxNorm = isOpening ? (slats - 1 - i) / slats : i / slats;
            const localP = Math.max(
              0,
              Math.min(1, (progress * 1.38 - idxNorm * 0.38))
            );
            if (localP <= 0) continue;

            const y = i * slatH;
            const curH = slatH * localP + 0.8;

            ctx.fillStyle = "#06040f";
            ctx.fillRect(0, y, vw, curH);

            // Glowing amber leading edge on each blind louver while in motion
            if (localP < 0.98) {
              ctx.fillStyle = "rgba(251, 191, 36, 0.92)";
              ctx.fillRect(0, y + curH - 2.2, vw, 2.2);
            }
          }

          drawCrtScanlinesAndHud(ctx, vw, vh, mode, progress);
        }

        ctx.restore();

        if (elapsed < totalMs) {
          rafId = window.requestAnimationFrame(renderFrame);
        } else {
          rafId = null;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onComplete?.();
          setActive(false);
        }
      };

      rafId = window.requestAnimationFrame(renderFrame);
    };

    window.addEventListener(RETRO_TRANSITION_EVENT, handleTrigger);
    return () => {
      window.removeEventListener(RETRO_TRANSITION_EVENT, handleTrigger);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      className={`dream-dissolve-overlay retro-arcade-transition-overlay ${
        active ? "is-active" : ""
      }`.trim()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="dream-dissolve-canvas" />
    </div>
  );
}
