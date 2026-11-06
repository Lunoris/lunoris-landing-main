"use client";

import React, { useEffect, useRef, useState } from "react";

export interface DreamDissolveOptions {
  /** Image URL of the portal / outgoing scene */
  sourceImageUrl?: string;
  /** Crack line color [r, g, b] in 0..1 (defaults to [0, 0, 0] black as in Unity DissolveTransitionEffect.cs) */
  edgeColor?: [number, number, number];
  /** Crack line width (defaults to 0.015) */
  edgeWidth?: number;
  /** Voronoi cell scale (defaults to 8.5 for a rich shattered-glass cell count) */
  noiseScale?: number;
  /** Gravity strength & direction (defaults to 1.35 = strong downward shatter fall) */
  gravityStrength?: number;
  /** Duration of DissolveIn and DissolveOut phases in ms (defaults to 1250ms each) */
  phaseDurationMs?: number;
  /** Callback fired at midpoint (when screen is fully shattered) so the new route mounts underneath */
  onMidTransition?: () => void;
  /**
   * Called right after `onMidTransition`. The screen stays fully shattered until the
   * returned promise settles (e.g. the new route has painted), then DissolveOut runs.
   */
  waitUntil?: () => Promise<unknown>;
  /** Callback fired when DissolveOut finishes reassembling the new world */
  onComplete?: () => void;
}

export type ShatteredRealityOptions = DreamDissolveOptions;

const SHATTERED_REALITY_EVENT = "lunoris:dream-dissolve";

const GLASS_IN_URLS = [
  "/assets/sfx/glass-transition-in-1.wav",
  "/assets/sfx/glass-transition-in-2.wav",
];

const GLASS_OUT_URLS = [
  "/assets/sfx/glass-transition-out-1.wav",
  "/assets/sfx/glass-transition-out-2.wav",
];

let sharedAudioCtx: AudioContext | null = null;
const decodedBufferCache = new Map<string, AudioBuffer>();
let audioPreloadStarted = false;

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

async function preloadGameSfxBuffers() {
  if (audioPreloadStarted || typeof window === "undefined") return;
  audioPreloadStarted = true;
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const allUrls = [...GLASS_IN_URLS, ...GLASS_OUT_URLS];
  await Promise.all(
    allUrls.map(async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const arr = await res.arrayBuffer();
        const buf = await ctx.decodeAudioData(arr.slice(0));
        decodedBufferCache.set(url, buf);
      } catch {
        // Ignore decode errors; HTMLAudioElement fallback handles playback
      }
    })
  );
}

/** Fetch + decode the glass transition SFX ahead of time (idempotent). */
export function preloadShatteredAudio() {
  void preloadGameSfxBuffers();
}

/**
 * Call synchronously inside a user click handler (`onClick`) to unlock Web Audio API
 * before any `setTimeout` delay runs.
 */
export function unlockShatteredAudio() {
  if (typeof window === "undefined") return;
  const ctx = getOrCreateAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  preloadGameSfxBuffers();
}

function playGameSfx(urls: string[], volume = 0.78) {
  if (typeof window === "undefined") return;
  const url = urls[Math.floor(Math.random() * urls.length)];
  const ctx = getOrCreateAudioContext();

  if (ctx) {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const buf = decodedBufferCache.get(url);
    if (buf) {
      try {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.buffer = buf;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        return;
      } catch {
        // Fallback to HTMLAudioElement below
      }
    }
  }

  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    // Ignore autoplay block if any
  }
}

export function triggerShatteredReality(options: ShatteredRealityOptions = {}) {
  if (typeof window === "undefined") return;
  unlockShatteredAudio();
  window.dispatchEvent(
    new CustomEvent<ShatteredRealityOptions>(SHATTERED_REALITY_EVENT, {
      detail: options,
    })
  );
}

export const triggerDreamDissolve = triggerShatteredReality;

/**
 * Vertex Shader — Fullscreen quad with bottom-left UV origin (0,0) -> top-right (1,1)
 * matching Unity's DissolveTransitionEffect.shader UV convention.
 */
const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * Fragment Shader — Enhanced Unity DissolveTransitionEffect.shader with heightened
 * Shattered Glass physics:
 * - Aspect-corrected isotropic Voronoi shards so fragments have sharp crystalline geometry
 * - 3-tier fracture hierarchy:
 *     Layer 1: Primary Voronoi glass shards (_NoiseScale)
 *     Layer 2: Internal Voronoi sub-cracks inside each shard (_NoiseScale * 2.8)
 *     Layer 3: Fine micro-fractures near shard rims (_NoiseScale * 5.6)
 * - Crystalline glass bevel & normal refraction along crack edges + specular rim glints
 * - Per-shard rotation, 3D tilt/scale, radial impact burst + quadratic gravity fall
 * - Full visibility of all falling shards until u_progress = 1.0 (no premature black fade)
 */
const FRAGMENT_SHADER_SRC = `
precision highp float;

varying vec2 v_uv;

uniform sampler2D u_inputTexture;
uniform float u_progress;
uniform float u_edgeWidth;
uniform vec3 u_edgeColor;
uniform vec3 u_backgroundColor;
uniform float u_noiseScale;
uniform float u_noiseSeed;
uniform float u_gravityStrength;
uniform float u_aspect;
uniform float u_isDissolveOut;

vec2 Hash2(vec2 p, float seed) {
  vec2 q = vec2(
    dot(p, vec2(127.1 + seed, 311.7 + seed * 0.7)),
    dot(p, vec2(269.5 + seed * 1.3, 183.3 + seed))
  );
  return fract(sin(q) * 43758.5453);
}

float Hash1(vec2 p, float seed) {
  return fract(sin(dot(p, vec2(127.1 + seed, 311.7 + seed * 0.5))) * 43758.5453);
}

// Returns vec4(cellRandom, edgeDist, nearestCellID.x, nearestCellID.y)
// Also outputs nearestSitePos in scaled space via out parameter
vec4 VoronoiCrackEx(vec2 uv, float scale, float seed, out vec2 outSiteUV, out vec2 outEdgeDir) {
  vec2 aspectUV = vec2(uv.x * u_aspect, uv.y);
  vec2 scaledUV = aspectUV * scale;
  vec2 baseCellID = floor(scaledUV);
  vec2 cellUV = fract(scaledUV);

  float minDist = 8.0;
  float minDist2 = 8.0;
  vec2 nearestID = vec2(0.0, 0.0);
  vec2 nearestDiff = vec2(0.0, 0.0);
  vec2 secondDiff = vec2(0.0, 0.0);
  vec2 nearestSite = vec2(0.5, 0.5);

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 neighbor = vec2(float(i), float(j));
      // Perturb site within cell for sharp angular glass shards
      vec2 cellPt = 0.08 + 0.84 * Hash2(baseCellID + neighbor, seed);
      vec2 diff = neighbor + cellPt - cellUV;
      float dist = dot(diff, diff);

      if (dist < minDist) {
        minDist2 = minDist;
        secondDiff = nearestDiff;
        minDist = dist;
        nearestDiff = diff;
        nearestID = baseCellID + neighbor;
        nearestSite = (baseCellID + neighbor + cellPt) / scale;
      } else if (dist < minDist2) {
        minDist2 = dist;
        secondDiff = diff;
      }
    }
  }

  // Exact perpendicular distance to the Voronoi bisector plane between nearest and 2nd-nearest sites
  vec2 toSecond = secondDiff - nearestDiff;
  float bisectorLen = max(0.0001, length(toSecond));
  float edgeDist = 0.5 * dot(-nearestDiff - secondDiff, toSecond / bisectorLen);

  outSiteUV = vec2(nearestSite.x / u_aspect, nearestSite.y);
  outEdgeDir = toSecond / bisectorLen;

  float cellRandom = Hash1(nearestID, seed + 77.0);
  return vec4(cellRandom, edgeDist, nearestID);
}

void main() {
  vec2 uv = v_uv;

  if (u_progress < 0.001) {
    if (u_isDissolveOut > 0.5) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
      vec4 src = texture2D(u_inputTexture, uv);
      gl_FragColor = vec4(src.rgb, 1.0);
    }
    return;
  }

  // 1. Layer 1: Primary Voronoi glass shards
  vec2 shardCenterUV;
  vec2 edgeNormal;
  vec4 v1 = VoronoiCrackEx(uv, u_noiseScale, u_noiseSeed, shardCenterUV, edgeNormal);
  float largeCellRandom = v1.x;
  float largeEdgeDist   = v1.y;
  vec2 largeCellID      = v1.zw;

  // 2. Layer 2: Internal Voronoi sub-cracks inside each primary shard
  float subSeed = u_noiseSeed + Hash1(largeCellID, u_noiseSeed + 113.0) * 500.0;
  vec2 subCenterUV;
  vec2 subEdgeNormal;
  vec4 v2 = VoronoiCrackEx(uv, u_noiseScale * 2.85, subSeed, subCenterUV, subEdgeNormal);
  float smallEdgeDist = v2.y;

  // 3. Layer 3: Fine crystalline micro-cracks near shard borders
  vec2 microCenterUV;
  vec2 microEdgeNormal;
  vec4 v3 = VoronoiCrackEx(uv, u_noiseScale * 5.8, subSeed + 71.0, microCenterUV, microEdgeNormal);
  float microEdgeDist = v3.y;

  float insideLargeCell = smoothstep(0.0, u_edgeWidth * 3.2, largeEdgeDist);
  float nearBorderMask  = (1.0 - smoothstep(0.0, u_edgeWidth * 10.0, largeEdgeDist)) * insideLargeCell;

  // Sharp crack lines + bright crystalline glass bevel rim
  float crackLarge = 1.0 - smoothstep(0.0, u_edgeWidth * 1.15, largeEdgeDist);
  float crackSmall = (1.0 - smoothstep(0.0, u_edgeWidth * 0.72, smallEdgeDist)) * insideLargeCell;
  float crackMicro = (1.0 - smoothstep(0.0, u_edgeWidth * 0.55, microEdgeDist)) * nearBorderMask;
  float crackLine  = clamp(max(crackLarge, max(crackSmall * 0.78, crackMicro * 0.55)), 0.0, 1.0);

  // Radial propagation from portal center during initial crack phase (0.0 -> 0.14)
  float distFromCenter = length(vec2((uv.x - 0.5) * u_aspect, uv.y - 0.5));
  float crackWave = smoothstep(distFromCenter * 0.11, distFromCenter * 0.11 + 0.09, u_progress);
  crackLine *= crackWave;

  // Crystalline specular glass rim right beside the cracks
  float glassRimLarge = smoothstep(u_edgeWidth * 0.8, u_edgeWidth * 1.35, largeEdgeDist) *
                        (1.0 - smoothstep(u_edgeWidth * 1.35, u_edgeWidth * 3.1, largeEdgeDist));
  float glassRimSmall = smoothstep(u_edgeWidth * 0.5, u_edgeWidth * 0.95, smallEdgeDist) *
                        (1.0 - smoothstep(u_edgeWidth * 0.95, u_edgeWidth * 2.1, smallEdgeDist)) *
                        insideLargeCell;
  float glassRim = clamp(glassRimLarge * 0.85 + glassRimSmall * 0.45, 0.0, 1.0) * crackWave;

  // Per-cell break timing (exact Unity formula + radial shock bias)
  float gravDir = sign(u_gravityStrength);
  if (abs(gravDir) < 0.001) gravDir = 1.0;
  float gravMag = abs(u_gravityStrength);

  float gravityBias = (gravDir >= 0.0 ? (1.0 - uv.y) : uv.y) * 0.14 * gravMag;
  float startTime = largeCellRandom * 0.34 + gravityBias;
  startTime = min(startTime, 0.46);
  float cellDur = 0.34 + largeCellRandom * 0.18;
  cellDur = min(cellDur, 1.0 - startTime);
  float localT = clamp((u_progress - startTime) / cellDur, 0.0, 1.0);

  // Refract UV slightly near crack edges (like thick fractured glass)
  vec2 refractOffset = edgeNormal * (crackLarge * 0.008 + glassRim * 0.005);

  // Cell has not detached yet (or has already locked into place during DissolveOut)
  if (localT <= 0.0) {
    if (u_isDissolveOut > 0.5) {
      // During DissolveOut, once a shard locks into place (localT == 0),
      // its interior is transparent so the live /dream-levels DOM is visible underneath,
      // while the dark cracks + crystalline glass rims remain etched on top until u_progress -> 0!
      vec3 rimCol = vec3(0.55, 0.88, 1.0) * (glassRim * 0.75);
      float alpha = clamp(max(crackLine * 0.95, glassRim * 0.65), 0.0, 1.0);
      vec3 col = mix(u_edgeColor, rimCol, glassRim / max(0.001, alpha));
      gl_FragColor = vec4(col * alpha, alpha);
    } else {
      vec4 sourceColor = texture2D(u_inputTexture, clamp(uv + refractOffset, 0.002, 0.998));
      vec3 withRim = sourceColor.rgb + vec3(0.52, 0.86, 1.0) * (glassRim * 0.48);
      vec3 crackedScene = mix(withRim, u_edgeColor, crackLine);
      gl_FragColor = vec4(crackedScene, 1.0);
    }
    return;
  }

  // ============================================================================
  // SHARD IS BREAKING: Rotation + 3D Tilt/Scale + Radial Burst + Gravity Fall
  // ============================================================================
  float randAngle = Hash1(largeCellID, u_noiseSeed + 200.0) * 6.28318;
  float randSpeed = Hash1(largeCellID, u_noiseSeed + 300.0);
  float randSpin  = (Hash1(largeCellID, u_noiseSeed + 410.0) - 0.5) * 2.0;

  // Combine outward radial explosion from screen center with downward gravity
  vec2 radialOut = shardCenterUV - vec2(0.5, 0.5);
  float radialLen = length(radialOut);
  vec2 radialDir = radialLen > 0.001 ? radialOut / radialLen : vec2(cos(randAngle), sin(randAngle));

  vec2 flyDir;
  flyDir.x = cos(randAngle) * 0.48 + radialDir.x * 0.55;
  flyDir.y = -gravDir * 1.05 + radialDir.y * 0.28;
  flyDir = normalize(flyDir);

  // Stronger quadratic displacement so shards visibly rip apart and cascade
  float speed = (0.18 + randSpeed * 0.24) * gravMag;
  vec2 displacement = flyDir * localT * localT * speed;

  // Wobble perpendicular to fall direction
  vec2 perpDir = vec2(-flyDir.y, flyDir.x);
  displacement += perpDir * sin(localT * 3.14159) * 0.018;

  // Per-shard rotation & 3D scale around shardCenterUV
  float rotAngle = randSpin * localT * localT * 1.15;
  float cosR = cos(rotAngle);
  float sinR = sin(rotAngle);
  float shardScale = max(0.35, 1.0 - localT * (0.22 + randSpeed * 0.28));

  vec2 relUV = (uv - displacement) - shardCenterUV;
  relUV.x *= u_aspect;
  vec2 rotatedRel = vec2(
    relUV.x * cosR - relUV.y * sinR,
    relUV.x * sinR + relUV.y * cosR
  ) / shardScale;
  rotatedRel.x /= u_aspect;

  vec2 sampleUV = clamp(shardCenterUV + rotatedRel + refractOffset, 0.002, 0.998);
  vec4 fragColor = texture2D(u_inputTexture, sampleUV);

  // Stronger edge erosion so wide black void rifts open between separating glass shards
  float shrink = localT * (0.025 + localT * 0.095);
  float inFrag = smoothstep(shrink, shrink + 0.008, largeEdgeDist);

  // Bright beveled glass edge right along the eroding shard perimeter
  float erodedRim = smoothstep(shrink, shrink + 0.007, largeEdgeDist) *
                    (1.0 - smoothstep(shrink + 0.007, shrink + 0.028, largeEdgeDist));

  // 3D tilted glass facet specular flash as the shard tumbles
  float facetFlash = pow(max(0.0, cos(localT * 5.5 + largeCellRandom * 6.28318)), 4.0) *
                     (1.0 - localT) * 0.42;

  // Fade out at the end of the fall
  float fade = clamp(1.0 - localT, 0.0, 1.0);
  fade = pow(fade, 1.45);

  vec3 glassLit = fragColor.rgb
    + vec3(0.58, 0.9, 1.0) * (glassRim * 0.5 + erodedRim * 0.85)
    + vec3(0.82, 0.95, 1.0) * facetFlash;

  vec3 fragResult = mix(glassLit, u_edgeColor, crackLine);
  float visibility = inFrag * fade;

  // Very late void settle (only in the last 12% of progress so 100% of the shatter is visible)
  float endVoidFade = smoothstep(0.88, 1.0, u_progress);
  vec3 finalColor = mix(u_backgroundColor, fragResult, visibility * (1.0 - endVoidFade));

  if (u_isDissolveOut > 0.5) {
    float movingTexWeight = smoothstep(0.0, 0.26, localT);
    float voidWeight = 1.0 - visibility;
    float alpha = clamp(
      max(max(voidWeight, crackLine * 0.95), max(movingTexWeight, max(erodedRim * 0.8, endVoidFade))),
      0.0,
      1.0
    );
    gl_FragColor = vec4(finalColor * alpha, alpha);
  } else {
    gl_FragColor = vec4(finalColor, 1.0);
  }
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

function buildSourceSceneCanvas(
  img: HTMLImageElement | null,
  vw: number,
  vh: number
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = vw;
  c.height = vh;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  ctx.fillStyle = "#06050f";
  ctx.fillRect(0, 0, vw, vh);

  if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const viewAspect = vw / vh;
    let drawW = vw;
    let drawH = vh;
    let offsetX = 0;
    let offsetY = 0;

    if (viewAspect > imgAspect) {
      drawW = vw;
      drawH = vw / imgAspect;
      offsetY = (vh - drawH) * 0.5;
    } else {
      drawH = vh;
      drawW = vh * imgAspect;
      offsetX = (vw - drawW) * 0.5;
    }

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  const vig = ctx.createRadialGradient(
    vw * 0.5,
    vh * 0.45,
    Math.min(vw, vh) * 0.16,
    vw * 0.5,
    vh * 0.5,
    Math.max(vw, vh) * 0.78
  );
  vig.addColorStop(0, "rgba(12, 16, 36, 0.12)");
  vig.addColorStop(0.68, "rgba(8, 10, 24, 0.42)");
  vig.addColorStop(1, "rgba(4, 3, 12, 0.72)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, vw, vh);

  return c;
}

function smoothStep01(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

export function DreamDissolveTransition() {
  const [active, setActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const preloadUrls = [
      "/assets/dream-level-1.png",
      "/assets/fearclaw-boss.png",
    ];
    preloadUrls.forEach((url) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        preloadedImagesRef.current.set(url, img);
      };
    });
    // Glass SFX (~3.8 MB of WAV) are no longer fetched on every page load; the
    // home portals call `preloadShatteredAudio()` on idle / hover instead.
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const handleTrigger = (evt: Event) => {
      const customEvt = evt as CustomEvent<ShatteredRealityOptions>;
      const {
        sourceImageUrl = "/assets/dream-level-1.png",
        edgeColor = [0.02, 0.03, 0.07],
        edgeWidth = 0.015,
        noiseScale = 8.5,
        gravityStrength = 1.35,
        phaseDurationMs = 1250,
        onMidTransition,
        waitUntil,
        onComplete,
      } = customEvt.detail || {};

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }

      setActive(true);

      const startShaderTransition = (loadedImg: HTMLImageElement | null) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          onMidTransition?.();
          onComplete?.();
          setActive(false);
          return;
        }

        // Play in-game SfxId.GlassTransitionIn when DissolveIn starts!
        playGameSfx(GLASS_IN_URLS, 0.8);

        const rect = canvas.getBoundingClientRect();
        const rootZoom =
          parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
        const vw = Math.max(
          320,
          Math.round(rect.width > 0 ? rect.width : window.innerWidth / rootZoom)
        );
        const vh = Math.max(
          240,
          Math.round(
            rect.height > 0 ? rect.height : window.innerHeight / rootZoom
          )
        );
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);

        const gl =
          (canvas.getContext("webgl2", {
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
          }) as WebGLRenderingContext | null) ||
          (canvas.getContext("webgl", {
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
          }) as WebGLRenderingContext | null);

        if (!gl) {
          onMidTransition?.();
          onComplete?.();
          setActive(false);
          return;
        }

        const program = createProgram(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC);
        if (!program) {
          onMidTransition?.();
          onComplete?.();
          setActive(false);
          return;
        }

        gl.useProgram(program);

        const quadVerts = new Float32Array([
          -1, -1,
           1, -1,
          -1,  1,
          -1,  1,
           1, -1,
           1,  1,
        ]);
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const srcCanvas = buildSourceSceneCanvas(loadedImg, vw, vh);
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          srcCanvas
        );

        const uTexLoc = gl.getUniformLocation(program, "u_inputTexture");
        const uProgressLoc = gl.getUniformLocation(program, "u_progress");
        const uEdgeWidthLoc = gl.getUniformLocation(program, "u_edgeWidth");
        const uEdgeColorLoc = gl.getUniformLocation(program, "u_edgeColor");
        const uBgColorLoc = gl.getUniformLocation(program, "u_backgroundColor");
        const uNoiseScaleLoc = gl.getUniformLocation(program, "u_noiseScale");
        const uNoiseSeedLoc = gl.getUniformLocation(program, "u_noiseSeed");
        const uGravityLoc = gl.getUniformLocation(program, "u_gravityStrength");
        const uAspectLoc = gl.getUniformLocation(program, "u_aspect");
        const uIsDissolveOutLoc = gl.getUniformLocation(
          program,
          "u_isDissolveOut"
        );

        const seedIn = 15.0 + Math.random() * 900.0;

        gl.uniform1i(uTexLoc, 0);
        gl.uniform1f(uEdgeWidthLoc, edgeWidth);
        gl.uniform3f(uEdgeColorLoc, edgeColor[0], edgeColor[1], edgeColor[2]);
        gl.uniform3f(uBgColorLoc, 0.0, 0.0, 0.0);
        gl.uniform1f(uNoiseScaleLoc, noiseScale);
        gl.uniform1f(uNoiseSeedLoc, seedIn);
        gl.uniform1f(uGravityLoc, gravityStrength);
        gl.uniform1f(uAspectLoc, vw / Math.max(1, vh));

        const HOLD_MS = 110;
        const totalMs = phaseDurationMs * 2 + HOLD_MS;
        const startTime = performance.now();
        let midpointFired = false;
        let dissolveOutSfxPlayed = false;
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

          let shaderProgress = 0;
          let isDissolveOut = 0;

          if (elapsed < phaseDurationMs) {
            // Phase 1: DissolveIn (progress 0 -> 1)
            const t = elapsed / phaseDurationMs;
            shaderProgress = smoothStep01(t);
            isDissolveOut = 0;
          } else if (elapsed < phaseDurationMs + HOLD_MS) {
            // Midpoint: screen is 100% shattered to void; mount new route underneath
            shaderProgress = 1.0;
            isDissolveOut = 1;
            if (!midpointFired) {
              fireMidpoint();
            }
          } else {
            // Phase 2: DissolveOut (progress 1 -> 0, world assembles from shards)
            if (!midpointFired) {
              fireMidpoint();
            }
            if (!dissolveOutSfxPlayed) {
              dissolveOutSfxPlayed = true;
              // Play in-game SfxId.GlassTransitionOut when DissolveOut starts!
              playGameSfx(GLASS_OUT_URLS, 0.78);
            }
            const outElapsed = elapsed - (phaseDurationMs + HOLD_MS);
            const t = Math.min(1, outElapsed / phaseDurationMs);
            shaderProgress = 1.0 - smoothStep01(t);
            isDissolveOut = 1;
          }

          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);

          gl.uniform1f(uProgressLoc, shaderProgress);
          gl.uniform1f(uIsDissolveOutLoc, isDissolveOut);

          gl.drawArrays(gl.TRIANGLES, 0, 6);

          if (elapsed < totalMs) {
            rafId = window.requestAnimationFrame(renderFrame);
          } else {
            rafId = null;
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.deleteTexture(tex);
            gl.deleteBuffer(vbo);
            gl.deleteProgram(program);
            onComplete?.();
            setActive(false);
          }
        };

        rafId = window.requestAnimationFrame(renderFrame);
      };

      const cachedImg = preloadedImagesRef.current.get(sourceImageUrl);
      if (
        cachedImg &&
        cachedImg.complete &&
        cachedImg.naturalWidth > 0
      ) {
        startShaderTransition(cachedImg);
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = sourceImageUrl;
        img.onload = () => {
          preloadedImagesRef.current.set(sourceImageUrl, img);
          startShaderTransition(img);
        };
        img.onerror = () => startShaderTransition(null);
      }
    };

    window.addEventListener(SHATTERED_REALITY_EVENT, handleTrigger);
    return () => {
      window.removeEventListener(SHATTERED_REALITY_EVENT, handleTrigger);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // IMPORTANT: Always keep the overlay & canvas mounted in the DOM so `canvasRef.current`
  // is NEVER null when triggered repeatedly or after navigating Back (`Назад`)!
  return (
    <div
      className={`dream-dissolve-overlay ${active ? "is-active" : ""}`.trim()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="dream-dissolve-canvas" />
    </div>
  );
}

export const ShatteredRealityTransition = DreamDissolveTransition;
