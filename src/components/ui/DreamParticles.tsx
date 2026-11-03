"use client";

import { useEffect, useRef } from "react";

interface PaletteColor {
  name: string;
  r: number;
  g: number;
  b: number;
}

/**
 * Expanded 6-color palette inspired by Lunoris: Piece of Mind realms:
 * 0: Starlight Pearl (warm moonlit dust)
 * 1: Lucid Gold (golden dream orbs)
 * 2: Dream Lavender (subconscious amethyst mist)
 * 3: Elar Cyan (bioluminescent sky-blue)
 * 4: Updraft Emerald (Kurtam / Sanctuary of Growth teal-emerald)
 * 5: Watercolor Orchid (Young Lunora / Memory rose-magenta)
 */
const DREAM_PALETTE: PaletteColor[] = [
  { name: "starlight", r: 247, g: 243, b: 235 },
  { name: "lucid-gold", r: 251, g: 207, b: 116 },
  { name: "dream-lavender", r: 204, g: 163, b: 255 },
  { name: "elar-cyan", r: 115, g: 199, b: 255 },
  { name: "dream-emerald", r: 74, g: 222, b: 172 },
  { name: "dream-orchid", r: 236, g: 130, b: 250 },
];

/**
 * Zone color weight distributions across vertical scroll depth (in viewport heights)
 * so particles visibly change their mood and palette as you scroll down the site.
 */
const SCROLL_ZONE_WEIGHTS: number[][] = [
  // Zone 0 (Hero): Starlight, Lucid Gold, Lavender, touch of Cyan
  [0.34, 0.34, 0.2, 0.1, 0.01, 0.01],
  // Zone 1 (News & World Portals): Elar Cyan, Emerald, Lucid Gold, Starlight
  [0.16, 0.2, 0.14, 0.3, 0.14, 0.06],
  // Zone 2 (Companions & Characters): Orchid, Lavender, Cyan, Emerald, Gold
  [0.12, 0.16, 0.24, 0.18, 0.12, 0.18],
  // Zone 3 (Team, Roadmap & Final CTA): Lucid Gold, Orchid, Lavender, Starlight, Cyan
  [0.22, 0.28, 0.22, 0.12, 0.04, 0.12],
];

function pickColorIndexForScroll(scrollScreens: number): number {
  const clamped = Math.max(0, Math.min(SCROLL_ZONE_WEIGHTS.length - 1.001, scrollScreens * 0.65));
  const idxA = Math.floor(clamped);
  const idxB = Math.min(SCROLL_ZONE_WEIGHTS.length - 1, idxA + 1);
  const t = clamped - idxA;

  const weightsA = SCROLL_ZONE_WEIGHTS[idxA];
  const weightsB = SCROLL_ZONE_WEIGHTS[idxB];

  const roll = Math.random();
  let cumulative = 0;
  for (let i = 0; i < DREAM_PALETTE.length; i++) {
    const w = weightsA[i] * (1 - t) + weightsB[i] * t;
    cumulative += w;
    if (roll <= cumulative) return i;
  }
  return 0;
}

/**
 * Default Cursor Glow palette sourced from the game's UI & Echo shaders:
 * - Primary: Lunoris_UI_Nebula Drift amethyst-violet (rgb(162, 88, 255))
 * - Secondary: Elar EchoLight / VisionPulse sky-cyan (rgb(72, 188, 255))
 */
const DEFAULT_GLOW_PRIMARY: [number, number, number] = [162, 88, 255];
const DEFAULT_GLOW_SECONDARY: [number, number, number] = [72, 188, 255];

function parseRgbTriplet(
  raw: string | null | undefined,
  fallback: [number, number, number]
): [number, number, number] {
  if (!raw) return fallback;
  const parts = raw.split(",").map((s) => Number(s.trim()));
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return [parts[0], parts[1], parts[2]];
  }
  return fallback;
}

interface Particle {
  x: number;
  y: number;
  /** Base drift velocity in px/sec (multi-directional) */
  vx: number;
  vy: number;
  /** Cursor & scroll deflection velocity offset in px/sec */
  ox: number;
  oy: number;
  /** Depth plane (0.35 = far background, 1.15 = near foreground) for scroll & mouse parallax */
  depth: number;
  /** Core size multiplier (radius of full glow halo in px) */
  glowRadius: number;
  /** Base opacity */
  baseAlpha: number;
  /** Whether this particle actively twinkles/pulses */
  twinkles: boolean;
  /** Twinkle angular frequency (rad/sec) */
  twinkleSpeed: number;
  /** Twinkle phase offset (rad) */
  twinklePhase: number;
  /** Twinkle modulation depth (0..1) */
  twinkleDepth: number;
  /** Gentle sinusoidal dream-current sway */
  swaySpeed: number;
  swayPhase: number;
  swayAmplitude: number;
  /** Phase governing intermittent constellation thread visibility */
  linkPhase: number;
  linkSpeed: number;
  /** Index into DREAM_PALETTE */
  colorIndex: number;
}

function createGlowSprite(color: PaletteColor): HTMLCanvasElement {
  const size = 64;
  const half = size / 2;
  const offscreen = document.createElement("canvas");
  offscreen.width = size;
  offscreen.height = size;
  const ctx = offscreen.getContext("2d");
  if (!ctx) return offscreen;

  // Soft outer dream halo
  const halo = ctx.createRadialGradient(half, half, 0, half, half, half);
  halo.addColorStop(0, `rgba(255, 253, 248, 0.96)`);
  halo.addColorStop(0.14, `rgba(${color.r}, ${color.g}, ${color.b}, 0.78)`);
  halo.addColorStop(0.34, `rgba(${color.r}, ${color.g}, ${color.b}, 0.26)`);
  halo.addColorStop(0.65, `rgba(${color.r}, ${color.g}, ${color.b}, 0.06)`);
  halo.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  return offscreen;
}

export function DreamParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const rootEl = document.documentElement;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let prefersReducedMotion = reducedMotionQuery.matches;

    const sprites = DREAM_PALETTE.map(createGlowSprite);

    let width = 0;
    let height = 0;
    let cachedRectLeft = 0;
    let cachedRectTop = 0;
    let cachedRectWidth = 1;
    let cachedRectHeight = 1;
    let dpr = 1;
    let particles: Particle[] = [];
    let rafId = 0;
    let lastTime = performance.now();
    let lastScrollY = window.scrollY || 0;

    const pointer = {
      x: -9999,
      y: -9999,
      /** Smoothed cursor glow core coordinates */
      glowX: -9999,
      glowY: -9999,
      /** Softer trailing nebula coordinates */
      trailX: -9999,
      trailY: -9999,
      vx: 0,
      vy: 0,
      active: false,
      hasEntered: false,
      presence: 0,
      lastMoveTime: 0,
      /** Normalized target mouse coordinates in [-1, 1] for scene parallax */
      targetMx: 0,
      targetMy: 0,
      /** Smoothed mouse coordinates in [-1, 1] */
      smoothMx: 0,
      smoothMy: 0,
      lastCssMx: 999,
      lastCssMy: 999,
      /** Active & target Cursor Glow palette (adapts to hovered character cards) */
      targetPrimary: [...DEFAULT_GLOW_PRIMARY] as [number, number, number],
      targetSecondary: [...DEFAULT_GLOW_SECONDARY] as [number, number, number],
      curPrimary: [...DEFAULT_GLOW_PRIMARY] as [number, number, number],
      curSecondary: [...DEFAULT_GLOW_SECONDARY] as [number, number, number],
      targetHoverBoost: 1,
      hoverBoost: 1,
    };

    const randomizeParticleTraits = (
      p: Particle,
      scrollScreens: number
    ): Particle => {
      const angle = Math.random() * Math.PI * 2;
      // Low, tranquil drift speed: ~9 to 22 px per second in any direction
      const speed = 9 + Math.random() * 13;
      const twinkles = Math.random() < 0.74;
      const isHeroMote = Math.random() < 0.24;
      const depth = isHeroMote
        ? 0.78 + Math.random() * 0.37
        : 0.35 + Math.random() * 0.45;

      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.ox = 0;
      p.oy = 0;
      p.depth = depth;
      p.glowRadius = isHeroMote
        ? 9.5 + Math.random() * 6
        : 5.5 + Math.random() * 4.5;
      p.baseAlpha = isHeroMote
        ? 0.54 + Math.random() * 0.28
        : 0.26 + Math.random() * 0.34;
      p.twinkles = twinkles;
      p.twinkleSpeed = 0.55 + Math.random() * 1.4;
      p.twinklePhase = Math.random() * Math.PI * 2;
      p.twinkleDepth = twinkles ? 0.42 + Math.random() * 0.44 : 0.1;
      p.swaySpeed = 0.35 + Math.random() * 0.65;
      p.swayPhase = Math.random() * Math.PI * 2;
      p.swayAmplitude = 3.5 + Math.random() * 6.5;
      p.linkPhase = Math.random() * Math.PI * 2;
      p.linkSpeed = 0.35 + Math.random() * 0.55;
      p.colorIndex = pickColorIndexForScroll(scrollScreens);
      return p;
    };

    const spawnParticle = (w: number, h: number): Particle => {
      const scrollScreens = (window.scrollY || 0) / Math.max(1, h);
      const base: Particle = {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        ox: 0,
        oy: 0,
        depth: 0.5,
        glowRadius: 7,
        baseAlpha: 0.4,
        twinkles: true,
        twinkleSpeed: 1,
        twinklePhase: 0,
        twinkleDepth: 0.5,
        swaySpeed: 0.5,
        swayPhase: 0,
        swayAmplitude: 5,
        linkPhase: 0,
        linkSpeed: 0.5,
        colorIndex: 0,
      };
      return randomizeParticleTraits(base, scrollScreens);
    };

    const syncViewport = () => {
      const rect = canvas.getBoundingClientRect();
      cachedRectLeft = rect.left;
      cachedRectTop = rect.top;
      cachedRectWidth = Math.max(1, rect.width || window.innerWidth);
      cachedRectHeight = Math.max(1, rect.height || window.innerHeight);
      const nextWidth = Math.max(1, Math.round(cachedRectWidth));
      const nextHeight = Math.max(1, Math.round(cachedRectHeight));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      const sizeChanged =
        Math.abs(nextWidth - width) > 2 || Math.abs(nextHeight - height) > 2;

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Low density: ~1 particle per 36,000 sq.px, clamped between 22 and 46
      const targetCount = Math.max(
        22,
        Math.min(46, Math.round((width * height) / 36000))
      );

      if (particles.length === 0) {
        particles = Array.from({ length: targetCount }, () =>
          spawnParticle(width, height)
        );
      } else if (sizeChanged) {
        if (particles.length < targetCount) {
          const extra = targetCount - particles.length;
          for (let i = 0; i < extra; i++) {
            particles.push(spawnParticle(width, height));
          }
        } else if (particles.length > targetCount) {
          particles.length = targetCount;
        }
        for (const p of particles) {
          p.x = ((p.x % width) + width) % width;
          p.y = ((p.y % height) + height) % height;
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (cachedRectWidth <= 0 || cachedRectHeight <= 0) return;

      // Normalize pointer coordinates into canvas space using cached rect (zero layout reflow)
      const nx = ((e.clientX - cachedRectLeft) / cachedRectWidth) * width;
      const ny = ((e.clientY - cachedRectTop) / cachedRectHeight) * height;

      if (!pointer.hasEntered) {
        pointer.glowX = nx;
        pointer.glowY = ny;
        pointer.trailX = nx;
        pointer.trailY = ny;
        pointer.hasEntered = true;
      } else if (pointer.active) {
        pointer.vx = nx - pointer.x;
        pointer.vy = ny - pointer.y;
      }

      pointer.x = nx;
      pointer.y = ny;
      pointer.active = true;
      pointer.lastMoveTime = performance.now();

      // Normalized [-1, 1] coordinates for multi-layer scene Mouse Parallax
      pointer.targetMx = Math.max(-1, Math.min(1, (nx / width - 0.5) * 2));
      pointer.targetMy = Math.max(-1, Math.min(1, (ny / height - 0.5) * 2));

      // Detect if hovering over a character or companion card with a custom palette
      const targetEl = e.target as Element | null;
      const paletteNode = targetEl?.closest?.(
        "[data-cursor-primary]"
      ) as HTMLElement | null;

      if (paletteNode) {
        pointer.targetPrimary = parseRgbTriplet(
          paletteNode.getAttribute("data-cursor-primary"),
          DEFAULT_GLOW_PRIMARY
        );
        pointer.targetSecondary = parseRgbTriplet(
          paletteNode.getAttribute("data-cursor-secondary"),
          DEFAULT_GLOW_SECONDARY
        );
        pointer.targetHoverBoost = 1.24;
      } else {
        pointer.targetPrimary = DEFAULT_GLOW_PRIMARY;
        pointer.targetSecondary = DEFAULT_GLOW_SECONDARY;
        pointer.targetHoverBoost = 1;
      }
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.targetMx = 0;
      pointer.targetMy = 0;
      pointer.targetPrimary = DEFAULT_GLOW_PRIMARY;
      pointer.targetSecondary = DEFAULT_GLOW_SECONDARY;
      pointer.targetHoverBoost = 1;
    };

    const renderFrame = (now: number) => {
      if (document.hidden) {
        lastTime = now;
        lastScrollY = window.scrollY || 0;
        rafId = window.requestAnimationFrame(renderFrame);
        return;
      }

      // Clamp delta time so tab switching never causes a large jump
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const timeSec = now * 0.001;

      // Measure page scroll delta so particles live in page-space and change as you scroll
      const currentScrollY = window.scrollY || 0;
      const rawScrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      // Clamp extreme jump (e.g. anchor jump) to at most 1.5 screens
      const scrollDelta = Math.max(
        -height * 1.5,
        Math.min(height * 1.5, rawScrollDelta)
      );
      const scrollScreens = currentScrollY / Math.max(1, height);

      // Smoothly interpolate global Mouse Parallax coordinates (--mx, --my)
      if (prefersReducedMotion) {
        pointer.smoothMx = 0;
        pointer.smoothMy = 0;
      } else {
        const lerpFactor = 1 - Math.pow(0.008, dt);
        pointer.smoothMx += (pointer.targetMx - pointer.smoothMx) * lerpFactor;
        pointer.smoothMy += (pointer.targetMy - pointer.smoothMy) * lerpFactor;
      }

      if (
        Math.abs(pointer.smoothMx - pointer.lastCssMx) > 0.002 ||
        Math.abs(pointer.smoothMy - pointer.lastCssMy) > 0.002
      ) {
        pointer.lastCssMx = pointer.smoothMx;
        pointer.lastCssMy = pointer.smoothMy;
        const mxStr = pointer.smoothMx.toFixed(4);
        const myStr = pointer.smoothMy.toFixed(4);
        // Set --mx / --my ONLY on .lunoris-hero and .lp-flow-canvas (never on documentElement!)
        // so mutating mouse parallax never triggers Recalculate Style on thousands of text spans
        const heroEl = document.querySelector<HTMLElement>(".lunoris-hero");
        if (heroEl && currentScrollY < height * 1.3) {
          heroEl.style.setProperty("--mx", mxStr);
          heroEl.style.setProperty("--my", myStr);
        }
        const flowCanvasEl =
          document.querySelector<HTMLElement>(".lp-flow-canvas");
        if (flowCanvasEl) {
          flowCanvasEl.style.setProperty("--mx", mxStr);
          flowCanvasEl.style.setProperty("--my", myStr);
        }
      }

      // Smoothly interpolate Cursor Glow position, presence, and palette
      const targetPresence = pointer.active && pointer.hasEntered ? 1 : 0;
      const presenceLerp = 1 - Math.pow(0.015, dt);
      pointer.presence += (targetPresence - pointer.presence) * presenceLerp;

      if (pointer.hasEntered) {
        const coreFollow = prefersReducedMotion ? 1 : 1 - Math.pow(0.00003, dt);
        const trailFollow = prefersReducedMotion ? 1 : 1 - Math.pow(0.0007, dt);
        pointer.glowX += (pointer.x - pointer.glowX) * coreFollow;
        pointer.glowY += (pointer.y - pointer.glowY) * coreFollow;
        pointer.trailX += (pointer.x - pointer.trailX) * trailFollow;
        pointer.trailY += (pointer.y - pointer.trailY) * trailFollow;
      }

      const colorLerp = 1 - Math.pow(0.003, dt);
      for (let c = 0; c < 3; c++) {
        pointer.curPrimary[c] +=
          (pointer.targetPrimary[c] - pointer.curPrimary[c]) * colorLerp;
        pointer.curSecondary[c] +=
          (pointer.targetSecondary[c] - pointer.curSecondary[c]) * colorLerp;
      }
      pointer.hoverBoost +=
        (pointer.targetHoverBoost - pointer.hoverBoost) * colorLerp;

      ctx.clearRect(0, 0, width, height);

      const r1 = Math.round(pointer.curPrimary[0]);
      const g1 = Math.round(pointer.curPrimary[1]);
      const b1 = Math.round(pointer.curPrimary[2]);
      const r2 = Math.round(pointer.curSecondary[0]);
      const g2 = Math.round(pointer.curSecondary[1]);
      const b2 = Math.round(pointer.curSecondary[2]);

      // 0. Draw Cursor Glow (Nebula Violet-Blue aura that adapts to character palettes)
      if (pointer.presence > 0.008 && pointer.hasEntered) {
        const pAlpha = pointer.presence;
        const breath = 1 + 0.045 * Math.sin(timeSec * 1.9);
        const boost = pointer.hoverBoost;

        // Layer A: Soft trailing outer Nebula Drift diffusion
        const outerRadius = 265 * boost * breath;
        const outerGrad = ctx.createRadialGradient(
          pointer.trailX,
          pointer.trailY,
          0,
          pointer.trailX,
          pointer.trailY,
          outerRadius
        );
        outerGrad.addColorStop(
          0,
          `rgba(${r1}, ${g1}, ${b1}, ${(0.145 * pAlpha * boost).toFixed(3)})`
        );
        outerGrad.addColorStop(
          0.36,
          `rgba(${r2}, ${g2}, ${b2}, ${(0.085 * pAlpha * boost).toFixed(3)})`
        );
        outerGrad.addColorStop(
          0.7,
          `rgba(${r1}, ${g1}, ${b1}, ${(0.028 * pAlpha).toFixed(3)})`
        );
        outerGrad.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, 0)`);

        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(pointer.trailX, pointer.trailY, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Layer B: Inner responsive Echo-Light bioluminescent spot
        const innerRadius = 135 * boost * breath;
        const innerGrad = ctx.createRadialGradient(
          pointer.glowX,
          pointer.glowY,
          0,
          pointer.glowX,
          pointer.glowY,
          innerRadius
        );
        innerGrad.addColorStop(
          0,
          `rgba(${r2}, ${g2}, ${b2}, ${(0.21 * pAlpha * boost).toFixed(3)})`
        );
        innerGrad.addColorStop(
          0.32,
          `rgba(${r1}, ${g1}, ${b1}, ${(0.14 * pAlpha * boost).toFixed(3)})`
        );
        innerGrad.addColorStop(
          0.68,
          `rgba(${r2}, ${g2}, ${b2}, ${(0.045 * pAlpha).toFixed(3)})`
        );
        innerGrad.addColorStop(1, `rgba(${r1}, ${g1}, ${b1}, 0)`);

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(pointer.glowX, pointer.glowY, innerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      const pointerRecentlyMoved =
        pointer.active && now - pointer.lastMoveTime < 1400;
      const influenceRadius = 138;
      const influenceRadiusSq = influenceRadius * influenceRadius;
      const glowIllumRadius = 235 * pointer.hoverBoost;
      const glowIllumRadiusSq = glowIllumRadius * glowIllumRadius;
      const wrapMargin = 32;

      // 1. Update positions, scroll-through-world travel, cursor deflection & particle illumination
      const count = particles.length;
      const currentAlphas = new Float32Array(count);
      const glowLightFactors = new Float32Array(count);
      const renderX = new Float32Array(count);
      const renderY = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const p = particles[i];

        // Move particle in world-space as the user scrolls (closer particles pass faster)
        if (Math.abs(scrollDelta) > 0.05) {
          const scrollParallax = 0.52 + p.depth * 0.68;
          p.y -= scrollDelta * scrollParallax;
          // Gentle horizontal breeze when scrolling through the dreamscape
          p.x +=
            Math.sin(currentScrollY * 0.004 + p.swayPhase) *
            scrollDelta *
            0.06 *
            p.depth;
        }

        if (!prefersReducedMotion) {
          // Organic perpendicular dream-current sway (like Lunoris DreamLevitation)
          const swayX =
            Math.cos(timeSec * p.swaySpeed + p.swayPhase) * p.swayAmplitude;
          const swayY =
            Math.sin(timeSec * p.swaySpeed * 0.85 + p.swayPhase) *
            p.swayAmplitude;

          // Cursor deflection: nearby particles gently part and drift aside
          if (pointerRecentlyMoved) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;

            if (distSq > 0.01 && distSq < influenceRadiusSq) {
              const dist = Math.sqrt(distSq);
              const falloff = Math.pow(1 - dist / influenceRadius, 1.65);
              const nx = dx / dist;
              const ny = dy / dist;

              // Soft radial push + subtle wake from cursor movement
              const radialStrength = 68 * falloff;
              p.ox += (nx * radialStrength + pointer.vx * 2.2 * falloff) * dt;
              p.oy += (ny * radialStrength + pointer.vy * 2.2 * falloff) * dt;

              // Cap offset velocity so deflection always remains calm and gentle
              const maxOffsetSpeed = 38;
              const offsetSpeedSq = p.ox * p.ox + p.oy * p.oy;
              if (offsetSpeedSq > maxOffsetSpeed * maxOffsetSpeed) {
                const scale = maxOffsetSpeed / Math.sqrt(offsetSpeedSq);
                p.ox *= scale;
                p.oy *= scale;
              }
            }
          }

          // Smooth exponential damping for deflection velocity
          const damping = Math.pow(0.18, dt);
          p.ox *= damping;
          p.oy *= damping;

          p.x += (p.vx + swayX + p.ox) * dt;
          p.y += (p.vy + swayY + p.oy) * dt;
        }

        // Seamless horizontal wrap
        if (p.x < -wrapMargin) p.x = width + wrapMargin;
        else if (p.x > width + wrapMargin) p.x = -wrapMargin;

        // Vertical wrap & evolution: when scrolling past particles, birth new ones with new traits!
        if (p.y < -wrapMargin) {
          const overshoot = (-wrapMargin - p.y) % (height + wrapMargin * 2);
          randomizeParticleTraits(p, scrollScreens + 0.4);
          p.x = Math.random() * width;
          p.y = height + wrapMargin - overshoot * 0.35;
        } else if (p.y > height + wrapMargin) {
          const overshoot =
            (p.y - (height + wrapMargin)) % (height + wrapMargin * 2);
          randomizeParticleTraits(p, Math.max(0, scrollScreens - 0.4));
          p.x = Math.random() * width;
          p.y = -wrapMargin + overshoot * 0.35;
        }

        // Depth-layered mouse parallax shift (closer motes shift further than distant stars)
        const rx = p.x - pointer.smoothMx * 18 * p.depth;
        const ry = p.y - pointer.smoothMy * 13 * p.depth;
        renderX[i] = rx;
        renderY[i] = ry;

        // Subtle illumination from the nearby Cursor Glow
        let lightBoost = 0;
        if (pointer.presence > 0.01) {
          const gdx = rx - pointer.glowX;
          const gdy = ry - pointer.glowY;
          const gDistSq = gdx * gdx + gdy * gdy;
          if (gDistSq < glowIllumRadiusSq) {
            const gDist = Math.sqrt(gDistSq);
            lightBoost =
              Math.pow(1 - gDist / glowIllumRadius, 1.5) * pointer.presence;
          }
        }
        glowLightFactors[i] = lightBoost;

        // Slow, independent twinkling / breathing + faint cursor-glow illumination
        const wave = Math.sin(timeSec * p.twinkleSpeed + p.twinklePhase);
        const shimmer = p.twinkles
          ? 1 - p.twinkleDepth * 0.5 + wave * (p.twinkleDepth * 0.5)
          : 1 + wave * 0.08;

        currentAlphas[i] = Math.max(
          0.06,
          Math.min(0.98, p.baseAlpha * shimmer + lightBoost * 0.22)
        );
      }

      // Decay instantaneous pointer velocity
      pointer.vx *= 0.85;
      pointer.vy *= 0.85;

      // 2. Draw delicate luminous constellation threads between nearby particles
      // Inspired by ConstellationPuzzle nodes & Echo filaments in the game
      const maxLinkDist = 142;
      const maxLinkDistSq = maxLinkDist * maxLinkDist;
      ctx.lineWidth = 0.75;

      for (let i = 0; i < count; i++) {
        const a = particles[i];
        const ax = renderX[i];
        const ay = renderY[i];
        let linksFromA = 0;

        for (let j = i + 1; j < count; j++) {
          if (linksFromA >= 2) break;
          const b = particles[j];
          const bx = renderX[j];
          const by = renderY[j];

          const dx = ax - bx;
          const dy = ay - by;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxLinkDistSq && distSq > 9) {
            // Intermittent resonance wave so threads gently appear and dissolve over time
            const resonance = Math.sin(
              timeSec * (a.linkSpeed + b.linkSpeed) * 0.5 +
                a.linkPhase +
                b.linkPhase
            );

            const pairLight = (glowLightFactors[i] + glowLightFactors[j]) * 0.5;
            const cursorBoost = pairLight * 0.45;

            const pulseGate = resonance + cursorBoost;
            if (pulseGate > -0.15) {
              const dist = Math.sqrt(distSq);
              const distFactor = Math.pow(1 - dist / maxLinkDist, 1.55);
              const pulseFactor = Math.min(1, (pulseGate + 0.15) / 1.15);
              const lineAlpha =
                distFactor *
                pulseFactor *
                Math.min(currentAlphas[i], currentAlphas[j]) *
                (0.38 + pairLight * 0.18);

              if (lineAlpha > 0.015) {
                const colorA = DREAM_PALETTE[a.colorIndex];
                const colorB = DREAM_PALETTE[b.colorIndex];
                // Blend thread color subtly toward the active Cursor Glow hue when illuminated
                const baseR = (colorA.r + colorB.r) >> 1;
                const baseG = (colorA.g + colorB.g) >> 1;
                const baseB = (colorA.b + colorB.b) >> 1;
                const r = Math.round(baseR + (r2 - baseR) * pairLight * 0.55);
                const g = Math.round(baseG + (g2 - baseG) * pairLight * 0.55);
                const bCh = Math.round(baseB + (b2 - baseB) * pairLight * 0.55);

                ctx.strokeStyle = `rgba(${r}, ${g}, ${bCh}, ${lineAlpha.toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.stroke();
                linksFromA++;
              }
            }
          }
        }
      }

      // 3. Draw glowing dream particles (with subtle illumination & tint near cursor glow)
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const sprite = sprites[p.colorIndex];
        const alpha = currentAlphas[i];
        const lightBoost = glowLightFactors[i];
        const r = p.glowRadius * (1 + lightBoost * 0.16);
        const rx = renderX[i];
        const ry = renderY[i];

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, rx - r, ry - r, r * 2, r * 2);

        // Faint reflected sheen on particles inside the Cursor Glow radius
        if (lightBoost > 0.08) {
          ctx.globalAlpha = lightBoost * 0.24;
          ctx.fillStyle = `rgb(${r2}, ${g2}, ${b2})`;
          ctx.beginPath();
          ctx.arc(rx, ry, Math.max(1.4, r * 0.24), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      rafId = window.requestAnimationFrame(renderFrame);
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };

    syncViewport();
    lastTime = performance.now();
    lastScrollY = window.scrollY || 0;
    rafId = window.requestAnimationFrame(renderFrame);

    window.addEventListener("resize", syncViewport, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });
    window.addEventListener("blur", handlePointerLeave, { passive: true });
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="lunoris-dream-particles"
      aria-hidden="true"
    />
  );
}
