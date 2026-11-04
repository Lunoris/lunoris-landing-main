"use client";

import React, { useEffect, useRef } from "react";

export interface NightmareRiftTransitionOptions {
  /** Called at climax when 100% of the screen is covered by the Breaker Rift eruption so `/nightmare` mounts underneath */
  onMidTransition?: () => void;
  /**
   * Called right after `onMidTransition`. The rift stays at full coverage until the
   * returned promise settles (e.g. `/nightmare` has painted), then it parts.
   */
  waitUntil?: () => Promise<unknown>;
  /** Called when the transition finishes parting to reveal `/nightmare` */
  onComplete?: () => void;
  /** Total duration in ms (defaults to 3100ms, synchronized to FMOD `The Breaker Rift Event.wav` + `The Breaker Equip-001.wav`) */
  durationMs?: number;
}

type RiftRunner = (options: NightmareRiftTransitionOptions) => void;

let activeRunner: RiftRunner | null = null;

// ============================================================================
// REAL IN-GAME FMOD AUDIO (`The Breaker Rift Event.wav` + `The Breaker Equip-001/002.wav`)
// Copied from `FMODProject/Assets/Amer Assets/The Breaker Rift/The Breaker Rift Event.wav`
// and `FMODProject/Assets/Amer Assets/Player/Weapons/The Breaker/The Breaker Equip-001.wav`
// ============================================================================
const RIFT_EVENT_URL = "/assets/sfx/breaker-rift-event.wav";
const EQUIP_URLS = [
  "/assets/sfx/breaker-equip-1.wav",
  "/assets/sfx/breaker-equip-2.wav",
];
const ATTACK_URL = "/assets/sfx/breaker-attack-1.wav";

let sharedAudioCtx: AudioContext | null = null;
let riftEventBuffer: AudioBuffer | null = null;
const equipBuffers: (AudioBuffer | null)[] = [null, null];
let attackBuffer: AudioBuffer | null = null;
let preloadStarted = false;

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  return sharedAudioCtx;
}

async function fetchAndDecode(
  ctx: AudioContext,
  url: string
): Promise<AudioBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arr = await res.arrayBuffer();
    return await ctx.decodeAudioData(arr.slice(0));
  } catch {
    return null;
  }
}

/** Fetch + decode the Breaker SFX ahead of time (idempotent). */
export function preloadBreakerAudio(): void {
  if (typeof window === "undefined" || preloadStarted) return;
  preloadStarted = true;

  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  void fetchAndDecode(ctx, RIFT_EVENT_URL).then((buf) => {
    if (buf) riftEventBuffer = buf;
  });
  EQUIP_URLS.forEach((url, idx) => {
    void fetchAndDecode(ctx, url).then((buf) => {
      if (buf) equipBuffers[idx] = buf;
    });
  });
  void fetchAndDecode(ctx, ATTACK_URL).then((buf) => {
    if (buf) attackBuffer = buf;
  });
}

/**
 * Call synchronously inside a click handler to unlock Web Audio API and begin
 * decoding the FMOD Breaker Rift & Equip WAV files immediately.
 */
export function unlockNightmareAudio(): void {
  if (typeof window === "undefined") return;
  const ctx = getOrCreateAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  preloadBreakerAudio();
}

function playDecodedOrHtmlAudio(
  buffer: AudioBuffer | null,
  url: string,
  volume: number
): void {
  if (typeof window === "undefined") return;
  const ctx = getOrCreateAudioContext();

  if (ctx && buffer) {
    try {
      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => {});
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
      return;
    } catch {
      // Fallback to HTMLAudioElement below
    }
  }

  try {
    const audio = new Audio(url);
    audio.volume = Math.min(1, Math.max(0, volume));
    void audio.play().catch(() => {});
  } catch {
    // Ignore autoplay restriction
  }
}

/**
 * Plays `event:/AmerSFX/The Breaker/Rift/TheBreakerRiftEvent` (`The Breaker Rift Event.wav`)
 * when Lunora begins pulling the Breaker Sword from the Nightmare Rift.
 */
function playBreakerRiftEventSfx(): void {
  playDecodedOrHtmlAudio(riftEventBuffer, RIFT_EVENT_URL, 0.92);
}

/**
 * Plays `The Breaker Equip-001/002.wav` + subtle `The Breaker Attack-001.wav` layer
 * at the exact moment (`EquipTakenSwordInHand`) the Breaker Sword is wrenched free from the rift.
 */
function playBreakerEquipClimaxSfx(): void {
  const idx = Math.random() < 0.65 ? 0 : 1;
  playDecodedOrHtmlAudio(equipBuffers[idx], EQUIP_URLS[idx], 0.95);
  playDecodedOrHtmlAudio(attackBuffer, ATTACK_URL, 0.55);
}

/**
 * Triggers the authentic in-game Breaker Sword Pull transition (`VFX-42 Breaker Rift Pull` +
 * `DeliverBreakerSword` + `SwordHookSlider` + `VoidPlayer.PlayCrashEffect`) and real FMOD audio.
 */
export function triggerNightmareRift(
  options: NightmareRiftTransitionOptions = {}
): void {
  if (typeof window === "undefined") return;
  unlockNightmareAudio();
  if (activeRunner) {
    activeRunner(options);
  } else {
    options.onMidTransition?.();
    options.onComplete?.();
  }
}

// ============================================================================
// PARTICLE & CRACK TYPES FOR `VFX-42 Breaker Rift Pull`
// ============================================================================
interface RiftParticle {
  angle: number;
  radius: number;
  radialSpeed: number;
  angularSpeed: number;
  riseSpeed: number;
  size: number;
  alpha: number;
  hue: "indigo" | "magenta" | "cyan" | "white";
  phase: number;
}

interface CrackBranch {
  angle: number;
  lengthFactor: number;
  width: number;
  segments: { rFrac: number; perpJitter: number }[];
  subBranches: {
    startFrac: number;
    angleOffset: number;
    lengthFrac: number;
    segments: { rFrac: number; perpJitter: number }[];
  }[];
}

function createCrackBranches(): CrackBranch[] {
  // 12 radial jagged branches modeled after `GroundCrack01_b2.png` from `VFX-42 Breaker Rift Pull`
  const count = 12;
  const branches: CrackBranch[] = [];
  for (let i = 0; i < count; i++) {
    const baseAngle = (i / count) * Math.PI * 2 + (Math.sin(i * 7.13) * 0.14);
    const isMajor = i % 2 === 0;
    const lengthFactor = isMajor
      ? 0.85 + 0.25 * Math.abs(Math.cos(i * 1.7))
      : 0.48 + 0.22 * Math.abs(Math.sin(i * 2.3));
    const segCount = isMajor ? 9 : 6;
    const segments: { rFrac: number; perpJitter: number }[] = [];
    for (let s = 1; s <= segCount; s++) {
      const rFrac = s / segCount;
      const sign = s % 2 === 0 ? 1 : -1;
      const jitter =
        sign *
        (0.025 + 0.055 * Math.abs(Math.sin(i * 3.7 + s * 1.9))) *
        (1 - rFrac * 0.35);
      segments.push({ rFrac, perpJitter: jitter });
    }

    const subBranches: CrackBranch["subBranches"] = [];
    if (isMajor) {
      for (let sb = 0; sb < 2; sb++) {
        const startFrac = sb === 0 ? 0.33 : 0.62;
        const angleOffset = (sb === 0 ? 1 : -1) * (0.38 + 0.18 * (i % 3));
        const lengthFrac = 0.28 + 0.12 * sb;
        const subSegs = [
          { rFrac: 0.35, perpJitter: 0.03 },
          { rFrac: 0.7, perpJitter: -0.025 },
          { rFrac: 1.0, perpJitter: 0.01 },
        ];
        subBranches.push({
          startFrac,
          angleOffset,
          lengthFrac,
          segments: subSegs,
        });
      }
    }

    branches.push({
      angle: baseAngle,
      lengthFactor,
      width: isMajor ? 5.5 : 3.2,
      segments,
      subBranches,
    });
  }
  return branches;
}

function createRiftParticles(count: number): RiftParticle[] {
  const hues: RiftParticle["hue"][] = ["indigo", "magenta", "cyan", "white"];
  const list: RiftParticle[] = [];
  for (let i = 0; i < count; i++) {
    list.push({
      angle: (i / count) * Math.PI * 2 + Math.random() * 0.5,
      radius: 10 + Math.random() * 260,
      radialSpeed: 80 + Math.random() * 340,
      angularSpeed: (Math.random() < 0.5 ? 1 : -1) * (1.2 + Math.random() * 2.4),
      riseSpeed: 60 + Math.random() * 220,
      size: 1.8 + Math.random() * 4.5,
      alpha: 0.45 + Math.random() * 0.55,
      hue: hues[i % hues.length],
      phase: Math.random() * Math.PI * 2,
    });
  }
  return list;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeOutCubic(t: number): number {
  const u = clamp01(t);
  return 1 - Math.pow(1 - u, 3);
}

function easeOutBack(t: number): number {
  const u = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
}

/**
 * Draws the authentic 3D-shaded Breaker Greatsword (`Assets/Lunoris/SwordShield/DeliverBreakerSword/breakerSword.fbx`)
 * with its winged crossguard, ribbed grip, beveled slate-steel fuller, glowing electric cyan-violet edges
 * (`onlyEdges/breakerSword_shader_Emissive.png`), and the 5 Lunar Phase Runes (`onlyMoons/breakerSword_shader_Emissive.png`).
 *
 * Local coordinate system of the sword:
 * - `(0, 0)` is the center of the crossguard.
 * - `-Y` (upward): Grip (`0 .. -115`) and Winged Pommel (`-115 .. -145`).
 * - `+Y` (downward): Ricasso & Blade (`0 .. +410`, tip at `+410`).
 */
function drawBreakerSword(
  ctx: CanvasRenderingContext2D,
  scale: number,
  runeGlowProgress: number,
  edgeGlowIntensity: number,
  climaxFlash: number
): void {
  ctx.save();
  ctx.scale(scale, scale);

  const bladeLen = 410;
  const baseHalfW = 27;
  const midHalfW = 23;
  const tipStartY = 335;

  // 1. OUTER HDR AURA AROUND SWORD (`VFX-74 Breaker Idle Glow` + `M_BreakerRiftPull`)
  if (edgeGlowIntensity > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const auraGrad = ctx.createLinearGradient(0, -130, 0, bladeLen);
    auraGrad.addColorStop(0, `rgba(139, 92, 246, ${0.25 * edgeGlowIntensity})`);
    auraGrad.addColorStop(0.35, `rgba(56, 189, 248, ${0.45 * edgeGlowIntensity})`);
    auraGrad.addColorStop(0.75, `rgba(217, 70, 239, ${0.55 * edgeGlowIntensity})`);
    auraGrad.addColorStop(1, `rgba(240, 171, 252, ${0.65 * edgeGlowIntensity})`);

    ctx.shadowColor = "rgba(168, 85, 247, 0.95)";
    ctx.shadowBlur = 28 + climaxFlash * 35;
    ctx.fillStyle = auraGrad;

    ctx.beginPath();
    ctx.moveTo(0, -140);
    ctx.lineTo(34, 0);
    ctx.lineTo(midHalfW + 6, tipStartY);
    ctx.lineTo(0, bladeLen + 10);
    ctx.lineTo(-(midHalfW + 6), tipStartY);
    ctx.lineTo(-34, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 2. BLADE SILHOUETTE & BEVELED STEEL PLANES (`breakerSword_shader_BaseMap.png`)
  // Left bevel (lit cool slate-teal steel)
  const leftBladeGrad = ctx.createLinearGradient(-baseHalfW, 0, 0, bladeLen);
  leftBladeGrad.addColorStop(0, "#49656f");
  leftBladeGrad.addColorStop(0.45, "#5c7e89");
  leftBladeGrad.addColorStop(0.85, "#3f5963");
  leftBladeGrad.addColorStop(1, "#7dd3fc");

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-baseHalfW - 7, 26); // Ricasso flare
  ctx.lineTo(-baseHalfW, 52);
  ctx.lineTo(-midHalfW, tipStartY);
  ctx.lineTo(0, bladeLen);
  ctx.closePath();
  ctx.fillStyle = leftBladeGrad;
  ctx.fill();

  // Right bevel (shadowed deep obsidian-slate steel)
  const rightBladeGrad = ctx.createLinearGradient(0, 0, baseHalfW, bladeLen);
  rightBladeGrad.addColorStop(0, "#24353c");
  rightBladeGrad.addColorStop(0.5, "#314750");
  rightBladeGrad.addColorStop(0.85, "#223238");
  rightBladeGrad.addColorStop(1, "#38bdf8");

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(baseHalfW + 7, 26); // Ricasso flare
  ctx.lineTo(baseHalfW, 52);
  ctx.lineTo(midHalfW, tipStartY);
  ctx.lineTo(0, bladeLen);
  ctx.closePath();
  ctx.fillStyle = rightBladeGrad;
  ctx.fill();

  // 3. CENTRAL FULLER CHANNEL (where the 5 Lunar Phase Runes are engraved)
  const fullerGrad = ctx.createLinearGradient(0, 22, 0, tipStartY + 15);
  fullerGrad.addColorStop(0, "#162229");
  fullerGrad.addColorStop(0.5, "#1f3038");
  fullerGrad.addColorStop(1, "#141f26");

  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(-11.5, 40);
  ctx.lineTo(-9.5, tipStartY - 12);
  ctx.lineTo(0, tipStartY + 26);
  ctx.lineTo(9.5, tipStartY - 12);
  ctx.lineTo(11.5, 40);
  ctx.closePath();
  ctx.fillStyle = fullerGrad;
  ctx.fill();

  // Subtle fuller inner bevel highlight
  ctx.strokeStyle = `rgba(125, 211, 252, ${0.35 + edgeGlowIntensity * 0.45})`;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // 4. GLOWING ELECTRIC CYAN-VIOLET CUTTING EDGES (`onlyEdges/breakerSword_shader_Emissive.png`)
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const edgeAlpha = clamp01(0.45 + edgeGlowIntensity * 0.55);
  const edgeGrad = ctx.createLinearGradient(0, 0, 0, bladeLen);
  edgeGrad.addColorStop(0, `rgba(56, 189, 248, ${edgeAlpha})`);
  edgeGrad.addColorStop(0.55, `rgba(125, 211, 252, ${edgeAlpha})`);
  edgeGrad.addColorStop(0.85, `rgba(192, 132, 252, ${edgeAlpha})`);
  edgeGrad.addColorStop(1, `rgba(255, 255, 255, ${ clamp01(edgeAlpha + 0.2) })`);

  ctx.strokeStyle = edgeGrad;
  ctx.lineWidth = 3.2 + edgeGlowIntensity * 2.4;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 14 + edgeGlowIntensity * 18;

  // Left & Right glowing blade edges
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * (baseHalfW - 2), 8);
    ctx.lineTo(dir * (baseHalfW + 7), 26);
    ctx.lineTo(dir * baseHalfW, 52);
    ctx.lineTo(dir * midHalfW, tipStartY);
    ctx.lineTo(0, bladeLen);
    ctx.stroke();
  }
  ctx.restore();

  // 5. THE 5 LUNAR PHASE RUNES ALONG THE FULLER (`onlyMoons/breakerSword_shader_Emissive.png`)
  // Exact sequence from `breakerSword_shader_BaseMap.png`:
  // [0]: Waxing Crescent, [1]: First Quarter/Gibbous, [2]: Full Moon (center), [3]: Last Quarter, [4]: Waning Crescent
  const runeYPositions = [82, 138, 198, 258, 314];
  const runeRadii = [8.2, 8.8, 10.2, 8.8, 8.2];

  for (let i = 0; i < 5; i++) {
    const ry = runeYPositions[i];
    const rr = runeRadii[i];
    const localLit = smoothstep(i * 0.16, i * 0.16 + 0.28, runeGlowProgress);

    ctx.save();
    // Engraved dark base groove
    ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, ry, rr, 0, Math.PI * 2);
    ctx.stroke();

    if (localLit > 0.01) {
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = i === 2 ? "#f0abfc" : "#38bdf8";
      ctx.shadowBlur = (12 + climaxFlash * 20) * localLit;
      ctx.fillStyle =
        i === 2
          ? `rgba(250, 232, 255, ${0.95 * localLit})`
          : `rgba(125, 211, 252, ${0.92 * localLit})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.95 * localLit})`;
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      if (i === 0) {
        // Waxing Crescent `(`
        ctx.arc(0, ry, rr, Math.PI * 0.5, Math.PI * 1.5, false);
        ctx.bezierCurveTo(-rr * 0.35, ry - rr * 0.75, -rr * 0.35, ry + rr * 0.75, 0, ry + rr);
      } else if (i === 1) {
        // First Quarter `D`
        ctx.arc(0, ry, rr, -Math.PI * 0.5, Math.PI * 0.5, false);
        ctx.closePath();
      } else if (i === 2) {
        // Full Moon `O` (central emblem)
        ctx.arc(0, ry, rr, 0, Math.PI * 2);
      } else if (i === 3) {
        // Last Quarter `C`
        ctx.arc(0, ry, rr, Math.PI * 0.5, Math.PI * 1.5, false);
        ctx.closePath();
      } else {
        // Waning Crescent `)`
        ctx.arc(0, ry, rr, -Math.PI * 0.5, Math.PI * 0.5, false);
        ctx.bezierCurveTo(rr * 0.35, ry + rr * 0.75, rr * 0.35, ry - rr * 0.75, 0, ry - rr);
      }
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. ORNATE WINGED CROSSGUARD (`breakerSwordHilt` in `breakerSword_shader_BaseMap.png`)
  for (const dir of [-1, 1]) {
    ctx.save();
    ctx.scale(dir, 1);

    const guardGrad = ctx.createLinearGradient(0, -28, 92, 24);
    guardGrad.addColorStop(0, "#4b6772");
    guardGrad.addColorStop(0.55, "#2f444d");
    guardGrad.addColorStop(1, "#678996");

    // Main sweeping double-wing quillon
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.bezierCurveTo(24, -22, 48, -42, 74, -48);
    ctx.bezierCurveTo(82, -36, 72, -16, 54, -8);
    ctx.bezierCurveTo(78, -6, 94, 4, 98, 16);
    ctx.bezierCurveTo(78, 22, 54, 16, 38, 12);
    ctx.bezierCurveTo(46, 26, 42, 42, 28, 48);
    ctx.bezierCurveTo(18, 36, 14, 22, 0, 24);
    ctx.closePath();
    ctx.fillStyle = guardGrad;
    ctx.fill();

    // Glowing inner bevel trace on crossguard wing (`breakerSword_shader_Emissive.png`)
    ctx.strokeStyle = `rgba(125, 211, 252, ${0.5 + edgeGlowIntensity * 0.5})`;
    ctx.lineWidth = 2.0;
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 10 * edgeGlowIntensity;
    ctx.stroke();
    ctx.restore();
  }

  // Central crossguard escutcheon & diamond void-gem
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(22, 0);
  ctx.lineTo(0, 32);
  ctx.lineTo(-22, 0);
  ctx.closePath();
  ctx.fillStyle = "#1e2d34";
  ctx.fill();
  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner glowing diamond core
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(10, 2);
  ctx.lineTo(0, 19);
  ctx.lineTo(-10, 2);
  ctx.closePath();
  ctx.fillStyle = climaxFlash > 0.2 ? "#ffffff" : "#38bdf8";
  ctx.shadowColor = "#c084fc";
  ctx.shadowBlur = 16 + edgeGlowIntensity * 16;
  ctx.fill();
  ctx.restore();

  // 7. RIBBED LEATHER GRIP (`breakerSword_shader_BaseMap.png` bottom region)
  const gripGrad = ctx.createLinearGradient(-12, -115, 12, -18);
  gripGrad.addColorStop(0, "#1c242b");
  gripGrad.addColorStop(0.5, "#33414d");
  gripGrad.addColorStop(1, "#161d24");

  ctx.beginPath();
  ctx.moveTo(-10, -18);
  ctx.bezierCurveTo(-13, -50, -13, -85, -9, -116);
  ctx.lineTo(9, -116);
  ctx.bezierCurveTo(13, -85, 13, -50, 10, -18);
  ctx.closePath();
  ctx.fillStyle = gripGrad;
  ctx.fill();

  // Dark ribbed bands along the grip
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3.2;
  for (let gy = -26; gy >= -110; gy -= 10) {
    ctx.beginPath();
    ctx.moveTo(-11, gy);
    ctx.quadraticCurveTo(0, gy - 3, 11, gy);
    ctx.stroke();
  }

  // 8. WINGED POMMEL CROWN (`-116 .. -148`)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -148);
  ctx.bezierCurveTo(16, -142, 28, -130, 22, -114);
  ctx.lineTo(0, -110);
  ctx.lineTo(-22, -114);
  ctx.bezierCurveTo(-28, -130, -16, -142, 0, -148);
  ctx.closePath();
  ctx.fillStyle = "#3b525c";
  ctx.fill();
  ctx.strokeStyle = `rgba(125, 211, 252, ${0.55 + edgeGlowIntensity * 0.45})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pommel eye gem
  ctx.beginPath();
  ctx.arc(0, -126, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = "#38bdf8";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.restore();

  // Climax white-hot core overlay when sword breaks free
  if (climaxFlash > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(255, 255, 255, ${climaxFlash * 0.75})`;
    ctx.beginPath();
    ctx.moveTo(0, -145);
    ctx.lineTo(28, 0);
    ctx.lineTo(0, bladeLen);
    ctx.lineTo(-28, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

export function NightmareRiftTransition(): React.JSX.Element {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;

    // Convert Unity `GroundCrack01_b2.png` (black crack on white square) into true
    // transparent-background canvases (alpha = 0 on all white pixels) so the square
    // image boundary can NEVER be visible. Breaker SFX (~1.35 MB of WAV) are fetched
    // by the home portals via `preloadBreakerAudio()` on idle / hover, not on every page.
    let crackDarkCanvas: HTMLCanvasElement | null = null;
    let crackGlowCanvas: HTMLCanvasElement | null = null;

    const groundCrackImg = new Image();
    groundCrackImg.onload = () => {
      const w = groundCrackImg.naturalWidth;
      const h = groundCrackImg.naturalHeight;
      if (!w || !h) return;

      const darkCv = document.createElement("canvas");
      darkCv.width = w;
      darkCv.height = h;
      const darkCtx = darkCv.getContext("2d");

      const glowCv = document.createElement("canvas");
      glowCv.width = w;
      glowCv.height = h;
      const glowCtx = glowCv.getContext("2d");

      if (!darkCtx || !glowCtx) return;

      darkCtx.drawImage(groundCrackImg, 0, 0);
      const srcData = darkCtx.getImageData(0, 0, w, h);
      const glowData = glowCtx.createImageData(w, h);
      const d = srcData.data;
      const g = glowData.data;

      for (let i = 0; i < d.length; i += 4) {
        // Source is black crack (0) on white background (255)
        const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
        const crackMask = lum > 245 ? 0 : Math.min(255, Math.round((255 - lum) * 1.08));

        // Dark abyssal fissure fill (zero alpha outside crack)
        d[i] = 12;
        d[i + 1] = 2;
        d[i + 2] = 28;
        d[i + 3] = crackMask;

        // Electric violet-magenta rim fill (zero alpha outside crack)
        g[i] = 217;
        g[i + 1] = 70;
        g[i + 2] = 239;
        g[i + 3] = crackMask;
      }

      darkCtx.putImageData(srcData, 0, 0);
      glowCtx.putImageData(glowData, 0, 0);
      crackDarkCanvas = darkCv;
      crackGlowCanvas = glowCv;
    };
    groundCrackImg.src = "/assets/vfx/ground-crack.png";

    let rafId = 0;
    let isRunning = false;

    const cleanup = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      isRunning = false;
      overlay.classList.remove("is-active");
    };

    const runTransition: RiftRunner = (options) => {
      if (isRunning) {
        cleanup();
      }
      isRunning = true;

      const totalMs = options.durationMs ?? 3100;
      const branches = createCrackBranches();
      const particles = createRiftParticles(110);

      overlay.classList.add("is-active");

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        options.onMidTransition?.();
        options.onComplete?.();
        cleanup();
        return;
      }

      // Start the real in-game FMOD `The Breaker Rift Event.wav` immediately
      playBreakerRiftEventSfx();

      const startTime = performance.now();
      let lastTime = startTime;
      let midFired = false;
      let equipSfxFired = false;
      // Progress freezes here (still full coverage) until the new route has painted
      const HOLD_P = 0.68;
      let pausedMs = 0;
      let routeReady = !options.waitUntil;

      const renderFrame = (now: number) => {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        // `elapsed` keeps running for shake/rotation; only progress `p` is held
        const elapsed = now - startTime;
        let progressMs = elapsed - pausedMs;
        if (midFired && !routeReady && progressMs > totalMs * HOLD_P) {
          pausedMs += progressMs - totalMs * HOLD_P;
          progressMs = totalMs * HOLD_P;
        }
        const p = clamp01(progressMs / totalMs);

        // Measure full-viewport overlay with compensation for `html { zoom: 0.8 }`
        const rect = overlay.getBoundingClientRect();
        const rootZoom =
          parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
        const vw = Math.round(
          rect.width > 0 ? rect.width : window.innerWidth / rootZoom
        );
        const vh = Math.round(
          rect.height > 0 ? rect.height : window.innerHeight / rootZoom
        );
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const targetW = Math.max(1, Math.round(vw * dpr));
        const targetH = Math.max(1, Math.round(vh * dpr));

        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, vw, vh);

        // Fire `The Breaker Equip-001.wav` right as the Breaker Sword breaks free from the rift (`p >= 0.54`, ~1.67s)
        if (!equipSfxFired && p >= 0.54) {
          equipSfxFired = true;
          playBreakerEquipClimaxSfx();
        }

        // Fire `onMidTransition` at peak full-screen coverage (`p >= 0.60`, ~1.86s) so `/nightmare` mounts underneath
        if (!midFired && p >= 0.6) {
          midFired = true;
          try {
            options.onMidTransition?.();
            if (options.waitUntil) {
              const markReady = () => {
                routeReady = true;
              };
              options.waitUntil().then(markReady, markReady);
            }
          } catch (err) {
            console.error("NightmareRiftTransition onMidTransition error:", err);
          }
        }

        // ====================================================================
        // CHOREOGRAPHY CURVES (synchronized with `breaker-rift-event.wav`)
        // - Tug #1: p = 0.08 .. 0.22 (0.25s .. 0.68s)
        // - Tug #2: p = 0.34 .. 0.48 (1.05s .. 1.49s)
        // - Climax Wrenching Pull & Rift Eruption: p = 0.50 .. 0.66 (1.55s .. 2.05s)
        // - Rift Parting & Dissolve into `/nightmare`: p = 0.68 .. 1.00 (2.10s .. 3.10s)
        // ====================================================================
        const revealFade = p > 0.7 ? 1 - smoothstep(0.7, 1.0, p) : 1;
        const voidBackdropAlpha =
          smoothstep(0.0, 0.14, p) * (p > 0.72 ? 1 - smoothstep(0.72, 1.0, p) : 1);

        const tug1Pulse =
          Math.sin(smoothstep(0.08, 0.22, p) * Math.PI) *
          (p >= 0.08 && p <= 0.22 ? 1 : 0);
        const tug2Pulse =
          Math.sin(smoothstep(0.34, 0.48, p) * Math.PI) *
          (p >= 0.34 && p <= 0.48 ? 1 : 0);
        const climaxPulse =
          p >= 0.5 && p <= 0.78
            ? Math.sin(smoothstep(0.5, 0.78, p) * Math.PI)
            : 0;

        // Sword pull progress (0 = deeply embedded in rift, 1 = wrenched completely free above rift)
        const pullT1 = 0.24 * easeOutBack(smoothstep(0.08, 0.21, p));
        const pullT2 = 0.32 * easeOutBack(smoothstep(0.34, 0.47, p));
        const pullT3 = 0.44 * easeOutCubic(smoothstep(0.5, 0.62, p));
        const swordPull01 = clamp01(pullT1 + pullT2 + pullT3);

        // Camera shake centered around `(vw * 0.5, vh * 0.5)`
        const shakeAmp =
          (tug1Pulse * 7 + tug2Pulse * 13 + climaxPulse * 22) * revealFade;
        const shakeX = Math.sin(elapsed * 0.055) * shakeAmp;
        const shakeY = Math.cos(elapsed * 0.071) * shakeAmp;

        // EXACT VIEWPORT CENTER `(cx, cy)`
        const cx = vw * 0.5 + shakeX;
        const cy = vh * 0.5 + shakeY;
        const maxRadius = Math.hypot(vw, vh) * 0.65;

        // 1. FULL-VIEWPORT NIGHTMARE VOID BACKDROP (covers 100% of the page)
        ctx.save();
        const bgGrad = ctx.createRadialGradient(
          cx,
          cy,
          10,
          cx,
          cy,
          maxRadius * 1.15
        );
        // `M_BreakerRiftPull.mat` primary deep indigo-violet (`#3100ff`) into abyssal obsidian (`#04010a`)
        bgGrad.addColorStop(
          0,
          `rgba(49, 0, 255, ${0.96 * voidBackdropAlpha})`
        );
        bgGrad.addColorStop(
          0.32,
          `rgba(28, 7, 68, ${0.98 * voidBackdropAlpha})`
        );
        bgGrad.addColorStop(
          0.7,
          `rgba(9, 3, 22, ${0.99 * voidBackdropAlpha})`
        );
        bgGrad.addColorStop(1, `rgba(3, 1, 8, ${voidBackdropAlpha})`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, vw, vh);
        ctx.restore();

        // 2. SWIRLING `VFX-42 Breaker Rift Pull` ENERGY VORTEX AT CENTER `(cx, cy)`
        const riftExpand =
          smoothstep(0.0, 0.18, p) * 0.42 +
          smoothstep(0.32, 0.48, p) * 0.25 +
          smoothstep(0.5, 0.68, p) * 0.55;
        const vortexRadius = Math.min(vw, vh) * (0.22 + riftExpand * 0.42);
        const rotateAngle = elapsed * 0.0018 + p * 3.4;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = "lighter";

        // Swirling indigo/magenta vortex rings (`VoidPlayer._Rotate`)
        for (let ring = 0; ring < 4; ring++) {
          const r = vortexRadius * (0.35 + ring * 0.24);
          ctx.save();
          ctx.rotate(rotateAngle * (ring % 2 === 0 ? 1 : -0.8) + ring * 1.1);
          ctx.scale(1.35, 0.58); // Perspective foreshortened rift plane around sword base

          const ringGrad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
          ringGrad.addColorStop(
            0,
            `rgba(240, 171, 252, ${0.42 * revealFade})`
          );
          ringGrad.addColorStop(
            0.45,
            `rgba(217, 70, 239, ${0.34 * revealFade})`
          );
          ringGrad.addColorStop(
            0.8,
            `rgba(49, 0, 255, ${0.26 * revealFade})`
          );
          ringGrad.addColorStop(1, "rgba(49, 0, 255, 0)");

          ctx.fillStyle = ringGrad;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // 3. JAGGED `GroundCrack01_b2` FISSURES RADIATING FROM `(cx, cy)` ACROSS 100% OF VIEWPORT
        const crackReach =
          maxRadius *
          (0.28 * smoothstep(0.0, 0.2, p) +
            0.32 * smoothstep(0.32, 0.48, p) +
            0.55 * smoothstep(0.5, 0.68, p));

        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = "lighter";

        for (const branch of branches) {
          const bLen = crackReach * branch.lengthFactor;
          if (bLen < 4) continue;

          const cosA = Math.cos(branch.angle);
          const sinA = Math.sin(branch.angle);
          const perpX = -sinA;
          const perpY = cosA;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (const seg of branch.segments) {
            const r = bLen * seg.rFrac;
            const j = bLen * seg.perpJitter;
            ctx.lineTo(cosA * r + perpX * j, sinA * r + perpY * j);
          }

          // Outer electric violet-magenta glow (`_SecondaryColor`)
          ctx.strokeStyle = `rgba(217, 70, 239, ${0.75 * revealFade})`;
          ctx.lineWidth =
            branch.width * (1 + climaxPulse * 1.4) * revealFade;
          ctx.shadowColor = "#d946ef";
          ctx.shadowBlur = 18 + climaxPulse * 22;
          ctx.lineCap = "round";
          ctx.lineJoin = "miter";
          ctx.stroke();

          // Inner white-cyan core
          ctx.strokeStyle = `rgba(240, 249, 255, ${0.9 * revealFade})`;
          ctx.lineWidth = Math.max(1.2, branch.width * 0.38 * revealFade);
          ctx.stroke();

          // Sub-branches
          for (const sub of branch.subBranches) {
            if (p < 0.12) continue;
            const startR = bLen * sub.startFrac;
            const sx = cosA * startR;
            const sy = sinA * startR;
            const subAng = branch.angle + sub.angleOffset;
            const sCos = Math.cos(subAng);
            const sSin = Math.sin(subAng);
            const sLen = bLen * sub.lengthFrac;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            for (const sSeg of sub.segments) {
              const sr = sLen * sSeg.rFrac;
              const sj = sLen * sSeg.perpJitter;
              ctx.lineTo(
                sx + sCos * sr - sSin * sj,
                sy + sSin * sr + sCos * sj
              );
            }
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.65 * revealFade})`;
            ctx.lineWidth = branch.width * 0.45 * revealFade;
            ctx.stroke();
          }
        }

        // Composite the transparent-background `GroundCrack01_b2` star fissure in the center
        // (stationary ground crack — no rotation, and 0% alpha outside the crack lines).
        if (crackDarkCanvas && crackGlowCanvas) {
          const crackSize =
            Math.min(vw, vh) * (0.48 + riftExpand * 0.58) * (1 + climaxPulse * 0.2);

          // Pass 1: violet-magenta rim glow around the transparent crack silhouette
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.scale(1.22, 0.72);
          ctx.globalAlpha = clamp01(0.75 * revealFade);
          ctx.shadowColor = "#d946ef";
          ctx.shadowBlur = 22;
          ctx.drawImage(
            crackGlowCanvas,
            -crackSize * 0.5,
            -crackSize * 0.5,
            crackSize,
            crackSize
          );
          ctx.restore();

          // Pass 2: dark abyssal fissure interior (`GroundCrack02Walls`)
          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.scale(1.22, 0.72);
          ctx.globalAlpha = clamp01(0.85 * revealFade);
          ctx.drawImage(
            crackDarkCanvas,
            -crackSize * 0.5,
            -crackSize * 0.5,
            crackSize,
            crackSize
          );
          ctx.restore();
        }

        // Glowing central rift mouth (`GroundCrack02Walls` & `GroundCrack02Glow`) where the blade is embedded
        const riftMouthW = Math.min(vw, vh) * (0.18 + riftExpand * 0.16);
        const riftMouthH = riftMouthW * 0.26;
        const mouthGrad = ctx.createRadialGradient(
          0,
          0,
          riftMouthH * 0.15,
          0,
          0,
          riftMouthW
        );
        mouthGrad.addColorStop(0, `rgba(255, 255, 255, ${0.98 * revealFade})`);
        mouthGrad.addColorStop(
          0.35,
          `rgba(240, 171, 252, ${0.92 * revealFade})`
        );
        mouthGrad.addColorStop(
          0.7,
          `rgba(147, 51, 234, ${0.75 * revealFade})`
        );
        mouthGrad.addColorStop(1, "rgba(49, 0, 255, 0)");

        ctx.save();
        ctx.scale(1, 0.36);
        ctx.fillStyle = mouthGrad;
        ctx.beginPath();
        ctx.arc(0, 0, riftMouthW, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();

        // 4. THE BREAKER GREATSWORD (`DeliverBreakerSword`) PULLED OUT OF THE CENTER RIFT `(cx, cy)`
        // At `swordPull01 = 0`, the crossguard is just above `cy` (`cy - 115 * swordScale`) and 72% of the blade
        // is submerged inside the rift below `cy`.
        // As `swordPull01 -> 1`, the sword is wrenched vertically upward along the center axis until the tip clears `cy`!
        const swordScale =
          Math.min(vw, vh) / 760 * (1 + climaxPulse * 0.12 + (p > 0.7 ? smoothstep(0.7, 1.0, p) * 0.35 : 0));
        const embeddedGuardY = cy - 115 * swordScale;
        const extractedGuardY = cy - 430 * swordScale;
        const guardY =
          embeddedGuardY + (extractedGuardY - embeddedGuardY) * swordPull01;

        // Slight struggle tilt during Tug #1 and Tug #2, snapping dead-vertical on extraction
        const struggleTilt =
          Math.sin(elapsed * 0.045) * (tug1Pulse * 0.045 + tug2Pulse * 0.065);

        // Clip ONLY the portion of the sword blade still submerged below the rift mouth (`y > cy`)
        // while `swordPull01 < 0.95` so the blade visibly emerges out of the fissure!
        ctx.save();
        ctx.globalAlpha = revealFade;
        if (swordPull01 < 0.96) {
          ctx.beginPath();
          ctx.rect(0, 0, vw, cy + 6 * swordScale);
          ctx.clip();
        }
        ctx.translate(cx, guardY);
        ctx.rotate(struggleTilt);

        const runeGlowProgress = clamp01(
          smoothstep(0.06, 0.56, p) + climaxPulse * 0.3
        );
        const edgeGlowIntensity = clamp01(
          0.35 + swordPull01 * 0.65 + tug1Pulse * 0.3 + tug2Pulse * 0.4 + climaxPulse * 0.8
        );

        drawBreakerSword(
          ctx,
          swordScale,
          runeGlowProgress,
          edgeGlowIntensity,
          climaxPulse
        );
        ctx.restore();

        // Bright lip flare right where the emerging blade intersects the rift plane `(cx, cy)`
        if (swordPull01 < 0.98) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          const lipW = (55 + (tug1Pulse + tug2Pulse) * 45) * swordScale;
          const lipH = 18 * swordScale;
          const lipGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, lipW);
          lipGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * revealFade})`);
          lipGrad.addColorStop(
            0.4,
            `rgba(56, 189, 248, ${0.85 * revealFade})`
          );
          lipGrad.addColorStop(
            0.75,
            `rgba(217, 70, 239, ${0.6 * revealFade})`
          );
          lipGrad.addColorStop(1, "rgba(49, 0, 255, 0)");

          ctx.fillStyle = lipGrad;
          ctx.beginPath();
          ctx.ellipse(cx, cy, lipW, lipH, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 5. RISING `VFX-42 (Energy)` VOID SPARKS & EMBERS PULLED UPWARD FROM `(cx, cy)`
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (const pt of particles) {
          pt.angle += pt.angularSpeed * dt * (1 + climaxPulse * 1.5);
          pt.radius +=
            pt.radialSpeed * dt * (0.25 + swordPull01 * 0.85 + climaxPulse * 1.8);
          const maxPtR = maxRadius * 1.05;
          if (pt.radius > maxPtR) {
            pt.radius = 8 + (pt.radius % 45);
          }

          const px = cx + Math.cos(pt.angle) * pt.radius;
          const py =
            cy +
            Math.sin(pt.angle) * pt.radius * 0.65 -
            pt.riseSpeed * swordPull01 * 0.85;

          const colorStr =
            pt.hue === "white"
              ? `rgba(255, 255, 255, ${pt.alpha * revealFade})`
              : pt.hue === "cyan"
                ? `rgba(56, 189, 248, ${pt.alpha * revealFade})`
                : pt.hue === "magenta"
                  ? `rgba(232, 121, 249, ${pt.alpha * revealFade})`
                  : `rgba(129, 140, 248, ${pt.alpha * revealFade})`;

          ctx.fillStyle = colorStr;
          ctx.beginPath();
          ctx.arc(
            px,
            py,
            pt.size * (1 + climaxPulse * 0.6),
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();

        // 6. SHOCKWAVE RINGS ON TUG #1, TUG #2, AND CLIMAX EXTRACTION (`VoidPlayer.PlayCrashEffect`)
        const drawShockwave = (
          waveProgress: number,
          maxR: number,
          color: string,
          lineW: number
        ) => {
          if (waveProgress <= 0 || waveProgress >= 1) return;
          const r = easeOutCubic(waveProgress) * maxR;
          const a = (1 - waveProgress) * revealFade;
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = color.replace("ALPHA", a.toFixed(3));
          ctx.lineWidth = lineW * (1 - waveProgress * 0.65);
          ctx.shadowColor = "#e879f9";
          ctx.shadowBlur = 24;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        };

        drawShockwave(
          smoothstep(0.09, 0.28, p),
          Math.min(vw, vh) * 0.42,
          "rgba(56, 189, 248, ALPHA)",
          6
        );
        drawShockwave(
          smoothstep(0.35, 0.54, p),
          Math.min(vw, vh) * 0.65,
          "rgba(217, 70, 239, ALPHA)",
          9
        );
        drawShockwave(
          smoothstep(0.53, 0.88, p),
          maxRadius * 1.25,
          "rgba(250, 232, 255, ALPHA)",
          18
        );

        // 7. CLIMAX BREAKER SLASH & POINT-LIGHT FLASH (`_lightIntensityModifier: 4500` in `VoidPlayer.cs`)
        // Ensures 100% full-page coverage at `p = 0.55 .. 0.72` when `/nightmare` mounts underneath!
        if (p >= 0.5 && p <= 0.85) {
          const slashEnv = Math.sin(smoothstep(0.5, 0.82, p) * Math.PI);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";

          // Full-screen radial HDR point-light burst from `(cx, cy)`
          const flashGrad = ctx.createRadialGradient(
            cx,
            cy - 120 * swordScale,
            10,
            cx,
            cy,
            maxRadius * 1.2
          );
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * slashEnv})`);
          flashGrad.addColorStop(
            0.25,
            `rgba(240, 171, 252, ${0.85 * slashEnv})`
          );
          flashGrad.addColorStop(
            0.6,
            `rgba(124, 58, 237, ${0.65 * slashEnv})`
          );
          flashGrad.addColorStop(1, `rgba(49, 0, 255, ${0.35 * slashEnv})`);

          ctx.fillStyle = flashGrad;
          ctx.fillRect(0, 0, vw, vh);

          // Signature Breaker cross-flare (`VFX-72 Breaker Swing Trail`) across `(cx, cy)`
          ctx.translate(cx, cy - 140 * swordScale);
          for (const ang of [-0.42, 0.42, Math.PI * 0.5]) {
            ctx.save();
            ctx.rotate(ang);
            const beamLen = maxRadius * 1.15 * slashEnv;
            const beamW = (ang === Math.PI * 0.5 ? 28 : 16) * slashEnv;
            const beamGrad = ctx.createLinearGradient(-beamLen, 0, beamLen, 0);
            beamGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
            beamGrad.addColorStop(0.35, `rgba(56, 189, 248, ${0.8 * slashEnv})`);
            beamGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.98 * slashEnv})`);
            beamGrad.addColorStop(0.65, `rgba(232, 121, 249, ${0.8 * slashEnv})`);
            beamGrad.addColorStop(1, "rgba(232, 121, 249, 0)");

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, beamLen, beamW, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.restore();
        }

        ctx.restore();

        if (p < 1) {
          rafId = requestAnimationFrame(renderFrame);
        } else {
          cleanup();
          options.onComplete?.();
        }
      };

      rafId = requestAnimationFrame(renderFrame);
    };

    activeRunner = runTransition;
    return () => {
      if (activeRunner === runTransition) {
        activeRunner = null;
      }
      cleanup();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="nightmare-rift-overlay"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="nightmare-rift-canvas" />
    </div>
  );
}
