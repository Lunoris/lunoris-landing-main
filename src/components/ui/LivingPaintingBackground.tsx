"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface DreamCanvasScene {
  id: string;
  image: string;
  /** Primary, secondary, and accent RGB triplets for flow-field brushstrokes in this scene */
  palettes: [number, number, number][];
  /** Ambient radial wash colors */
  washA: string;
  washB: string;
}

/**
 * 5 painted dream realms from Lunoris that slowly cross-fade into one another,
 * changing both the underlying painterly canvas artwork and the live brushstroke palette.
 */
const DREAM_SCENES: DreamCanvasScene[] = [
  {
    id: "starry-memory",
    image: "/assets/dream-level-1.png",
    palettes: [
      [168, 85, 247], // Amethyst violet
      [56, 189, 248], // Starry cobalt-cyan
      [251, 191, 36], // Van Gogh gold
      [129, 140, 248], // Ultramarine indigo
    ],
    washA: "rgba(139, 92, 246, 0.14)",
    washB: "rgba(56, 189, 248, 0.11)",
  },
  {
    id: "elar-joy",
    image: "/assets/elar-joy.jpg",
    palettes: [
      [251, 191, 36], // Sunlight gold
      [232, 121, 249], // Orchid magenta
      [245, 158, 11], // Warm ochre
      [168, 85, 247], // Dream violet
    ],
    washA: "rgba(245, 158, 11, 0.12)",
    washB: "rgba(192, 132, 252, 0.13)",
  },
  {
    id: "elar-stillness",
    image: "/assets/elar-stillness.jpg",
    palettes: [
      [56, 189, 248], // Elar sky-cyan
      [96, 165, 250], // Deep azure
      [167, 139, 250], // Soft lavender
      [52, 211, 153], // Aurora teal
    ],
    washA: "rgba(56, 189, 248, 0.13)",
    washB: "rgba(99, 102, 241, 0.12)",
  },
  {
    id: "elar-hope",
    image: "/assets/elar-hope.jpg",
    palettes: [
      [251, 207, 116], // Lucid hope gold
      [192, 132, 252], // Lavender mist
      [56, 189, 248], // Celestial blue
      [244, 114, 182], // Dawn rose
    ],
    washA: "rgba(251, 191, 36, 0.12)",
    washB: "rgba(168, 85, 247, 0.12)",
  },
  {
    id: "dream-hub",
    image: "/assets/dreamhub-scene.png",
    palettes: [
      [139, 92, 246], // Subconscious violet
      [56, 189, 248], // Echo cyan
      [251, 191, 36], // Memory gold
      [99, 102, 241], // Deep indigo
    ],
    washA: "rgba(124, 58, 237, 0.13)",
    washB: "rgba(37, 99, 235, 0.11)",
  },
];

interface Point {
  x: number;
  y: number;
}

interface FlowRibbon {
  points: Point[];
  maxPoints: number;
  headX: number;
  headY: number;
  speed: number;
  width: number;
  color: [number, number, number];
  targetColor: [number, number, number];
  age: number;
  life: number;
  maxAlpha: number;
  depth: number;
}

interface PaintedVortex {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  spinSpeed: number;
  color: [number, number, number];
  targetColor: [number, number, number];
  age: number;
  life: number;
  maxAlpha: number;
}

/**
 * Time-evolving 2D flow field angle so brushstrokes never follow the same static path.
 */
function sampleFlowAngle(x: number, y: number, t: number, seed: number): number {
  const nx = x * 0.0018;
  const ny = y * 0.0018;
  const wave1 = Math.sin(nx * 2.1 + t * 0.14 + seed) * Math.cos(ny * 1.9 - t * 0.11);
  const wave2 = Math.cos((nx - ny) * 1.6 - t * 0.09) * 0.85;
  const wave3 = Math.sin(Math.hypot(nx - 0.8, ny - 0.5) * 2.8 - t * 0.16) * 0.65;
  return (wave1 + wave2 + wave3) * Math.PI * 1.15;
}

export function LivingPaintingBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dream-levels")) {
    return null;
  }
  return <LivingPaintingCanvas />;
}

function LivingPaintingCanvas() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const sceneIndexRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cycle the active painted dream scene every 16 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSceneIndex((prev) => {
        const next = (prev + 1) % DREAM_SCENES.length;
        sceneIndexRef.current = next;
        return next;
      });
    }, 16000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let prefersReducedMotion = reducedMotionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let lastTime = performance.now();
    let fieldSeed = Math.random() * 100;

    let ribbons: FlowRibbon[] = [];
    let vortices: PaintedVortex[] = [];

    const pickSceneColor = (): [number, number, number] => {
      const palette = DREAM_SCENES[sceneIndexRef.current].palettes;
      const chosen = palette[Math.floor(Math.random() * palette.length)];
      return [chosen[0], chosen[1], chosen[2]];
    };

    const spawnRibbon = (w: number, h: number, randomAge = false): FlowRibbon => {
      const startX = Math.random() * w;
      const startY = Math.random() * h;
      const life = 11 + Math.random() * 12;
      const col = pickSceneColor();
      return {
        points: [{ x: startX, y: startY }],
        maxPoints: 28 + Math.floor(Math.random() * 22),
        headX: startX,
        headY: startY,
        speed: 14 + Math.random() * 16,
        width: 2.2 + Math.random() * 4.5,
        color: [...col],
        targetColor: [...col],
        age: randomAge ? Math.random() * life * 0.75 : 0,
        life,
        maxAlpha: 0.065 + Math.random() * 0.085,
        depth: 0.15 + Math.random() * 0.35,
      };
    };

    const spawnVortex = (
      w: number,
      h: number,
      randomAge = false
    ): PaintedVortex => {
      const life = 18 + Math.random() * 16;
      const col = pickSceneColor();
      const dir = Math.random() < 0.5 ? 1 : -1;
      return {
        x: (0.12 + Math.random() * 0.76) * w,
        y: (0.12 + Math.random() * 0.76) * h,
        vx: (Math.random() - 0.5) * 9,
        vy: (Math.random() - 0.5) * 7,
        radius: 65 + Math.random() * 95,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: dir * (0.08 + Math.random() * 0.1),
        color: [...col],
        targetColor: [...col],
        age: randomAge ? Math.random() * life * 0.7 : 0,
        life,
        maxAlpha: 0.055 + Math.random() * 0.065,
      };
    };

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width || window.innerWidth));
      height = Math.max(1, Math.round(rect.height || window.innerHeight));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (ribbons.length === 0) {
        ribbons = Array.from({ length: 24 }, () =>
          spawnRibbon(width, height, true)
        );
      }
      if (vortices.length === 0) {
        vortices = Array.from({ length: 4 }, () =>
          spawnVortex(width, height, true)
        );
      }
    };

    let lastObservedScene = sceneIndexRef.current;

    const render = (now: number) => {
      if (document.hidden) {
        lastTime = now;
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const t = now * 0.001;

      // When scene changes, assign new target colors from the new Dream Scene palette
      if (sceneIndexRef.current !== lastObservedScene) {
        lastObservedScene = sceneIndexRef.current;
        fieldSeed += 1.7;
        for (const r of ribbons) {
          r.targetColor = pickSceneColor();
        }
        for (const v of vortices) {
          v.targetColor = pickSceneColor();
        }
      }

      ctx.clearRect(0, 0, width, height);

      const scrollOffset = window.scrollY || 0;
      const colorLerp = 1 - Math.pow(0.08, dt);

      // 1. Render ephemeral drifting & morphing cloud-swirl vortices (never fixed in one place)
      for (let i = 0; i < vortices.length; i++) {
        const v = vortices[i];
        if (!prefersReducedMotion) {
          v.age += dt;
          if (v.age >= v.life) {
            vortices[i] = spawnVortex(width, height, false);
            continue;
          }
          v.x += v.vx * dt;
          v.y += v.vy * dt;
          v.angle += v.spinSpeed * dt;
        }

        for (let c = 0; c < 3; c++) {
          v.color[c] += (v.targetColor[c] - v.color[c]) * colorLerp;
        }

        // Smooth fade-in and fade-out envelope over the vortex's lifetime
        const lifeNorm = v.age / v.life;
        const envelope = Math.sin(lifeNorm * Math.PI);
        const alpha = v.maxAlpha * envelope;
        if (alpha <= 0.004) continue;

        const vy =
          (((v.y - scrollOffset * 0.18) % (height + 240)) + (height + 240)) %
            (height + 240) -
          120;

        const rCol = Math.round(v.color[0]);
        const gCol = Math.round(v.color[1]);
        const bCol = Math.round(v.color[2]);

        // Soft ambient nebula core
        const grad = ctx.createRadialGradient(v.x, vy, 0, v.x, vy, v.radius * 1.35);
        grad.addColorStop(0, `rgba(${rCol}, ${gCol}, ${bCol}, ${(alpha * 0.9).toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(${rCol}, ${gCol}, ${bCol}, ${(alpha * 0.35).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${rCol}, ${gCol}, ${bCol}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(v.x, vy, v.radius * 1.35, 0, Math.PI * 2);
        ctx.fill();

        // Soft spiral painterly arms (smooth tapered arcs, not dashed circles)
        ctx.save();
        ctx.translate(v.x, vy);
        ctx.rotate(v.angle);
        ctx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${(alpha * 1.15).toFixed(3)})`;
        ctx.lineCap = "round";

        for (let arm = 0; arm < 3; arm++) {
          const armOffset = (arm * Math.PI * 2) / 3;
          ctx.lineWidth = 3.2 - arm * 0.5;
          ctx.beginPath();
          for (let s = 0; s <= 24; s++) {
            const u = s / 24;
            const theta = armOffset + u * Math.PI * 1.65;
            const rad = v.radius * (0.18 + u * 0.82);
            const px = Math.cos(theta) * rad;
            const py = Math.sin(theta) * rad;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Render generative flow-field brushstrokes that continuously birth, glide, and dissolve
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < ribbons.length; i++) {
        const r = ribbons[i];
        if (!prefersReducedMotion) {
          r.age += dt;
          if (r.age >= r.life) {
            ribbons[i] = spawnRibbon(width, height, false);
            continue;
          }

          const angle = sampleFlowAngle(r.headX, r.headY, t, fieldSeed + i * 0.13);
          r.headX += Math.cos(angle) * r.speed * dt;
          r.headY += Math.sin(angle) * r.speed * dt;

          r.points.push({ x: r.headX, y: r.headY });
          if (r.points.length > r.maxPoints) {
            r.points.shift();
          }
        }

        if (r.points.length < 3) continue;

        for (let c = 0; c < 3; c++) {
          r.color[c] += (r.targetColor[c] - r.color[c]) * colorLerp;
        }

        const lifeNorm = r.age / r.life;
        const envelope = Math.sin(lifeNorm * Math.PI);
        const alpha = r.maxAlpha * envelope;
        if (alpha <= 0.004) continue;

        const rCol = Math.round(r.color[0]);
        const gCol = Math.round(r.color[1]);
        const bCol = Math.round(r.color[2]);

        const yShift = scrollOffset * r.depth;

        ctx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = r.width;
        ctx.beginPath();

        const pts = r.points;
        const firstY =
          (((pts[0].y - yShift) % (height + 160)) + (height + 160)) %
            (height + 160) -
          80;
        ctx.moveTo(pts[0].x, firstY);

        for (let p = 1; p < pts.length; p++) {
          const prevY =
            (((pts[p - 1].y - yShift) % (height + 160)) + (height + 160)) %
              (height + 160) -
            80;
          const curY =
            (((pts[p].y - yShift) % (height + 160)) + (height + 160)) %
              (height + 160) -
            80;
          // Avoid drawing a vertical line if the ribbon wrapped across the screen boundary
          if (Math.abs(curY - prevY) > 120) {
            ctx.moveTo(pts[p].x, curY);
          } else {
            ctx.lineTo(pts[p].x, curY);
          }
        }
        ctx.stroke();
      }

      rafId = window.requestAnimationFrame(render);
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };

    syncSize();
    lastTime = performance.now();
    rafId = window.requestAnimationFrame(render);

    window.addEventListener("resize", syncSize, { passive: true });
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", syncSize);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
    };
  }, []);

  const currentScene = DREAM_SCENES[sceneIndex];

  return (
    <div className="lunoris-living-painting" aria-hidden="true">
      {/* 1. Cross-fading Painted Dreamscapes from Lunoris (changes every 16s with slow Ken Burns motion) */}
      <div className="lp-dreamscapes-stage">
        {DREAM_SCENES.map((scene, idx) => {
          const isActive = idx === sceneIndex;
          return (
            <div
              key={scene.id}
              className={`lp-dreamscape-slide ${isActive ? "is-active" : ""}`}
              style={{ backgroundImage: `url('${scene.image}')` }}
            />
          );
        })}
      </div>

      {/* 2. Dynamic Color-Alchemy Wash matching the current Dream Scene */}
      <div
        className="lp-color-alchemy lp-color-alchemy--violet-blue"
        style={{
          background: `radial-gradient(ellipse 48% 40% at 24% 30%, ${currentScene.washA} 0%, transparent 72%), radial-gradient(ellipse 52% 44% at 76% 68%, ${currentScene.washB} 0%, transparent 75%)`,
        }}
      />
      <div className="lp-chiaroscuro-light" />

      {/* 3. Generative Flow-Field Brushstrokes & Ephemeral Swirling Cloud Vortices */}
      <canvas ref={canvasRef} className="lp-flow-canvas" />

      {/* 4. Subtle Painter's Linen Canvas Weave */}
      <div className="lp-canvas-linen-weave" />
    </div>
  );
}
