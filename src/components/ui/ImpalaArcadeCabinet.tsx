"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BrushstrokeButtonBg,
  DeckledCanvasFrame,
  OrnamentDivider,
  WideDeckledCanvasFrame,
} from "@/components/ui/CanvasFrames";
import { MagneticLetters } from "@/components/ui/MagneticLetters";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import { useLanguage } from "@/i18n/LanguageContext";

type ArcadeState = "attract" | "playing" | "victory" | "gameover";

interface ObstacleCar {
  id: number;
  lane: number; // -1 (left), 0 (center), 1 (right)
  z: number; // 1.0 (horizon) -> 0.0 (player)
  color: string;
  tailColor: string;
  speedFactor: number;
}

interface HighwayOrb {
  id: number;
  lane: number;
  z: number;
  collected: boolean;
}

let arcadeAudioCtx: AudioContext | null = null;

function getArcadeAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!arcadeAudioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) arcadeAudioCtx = new Ctx();
  }
  return arcadeAudioCtx;
}

function playArcadeSound(
  type: "coin" | "orb" | "hit" | "win" | "over",
  muted: boolean
) {
  if (muted || typeof window === "undefined") return;
  const ctx = getArcadeAudio();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  try {
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.14, now);
    master.connect(ctx.destination);

    if (type === "coin") {
      [987.77, 1318.51].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        const t0 = now + i * 0.08;
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.22, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + 0.19);
      });
    } else if (type === "orb") {
      [587.33, 880, 1174.66].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        const t0 = now + i * 0.05;
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.24, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + 0.13);
      });
    } else if (type === "hit") {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.24);
      g.gain.setValueAtTime(0.28, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === "win") {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        const t0 = now + i * 0.09;
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.22, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + 0.23);
      });
    } else if (type === "over") {
      [392.0, 349.23, 311.13, 261.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sawtooth";
        const t0 = now + i * 0.11;
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.2, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + 0.21);
      });
    }
  } catch {
    // Ignore audio errors
  }
}

export function ImpalaArcadeCabinet() {
  const { locale } = useLanguage();
  const isRu = locale === "ru";

  const [isOpen, setIsOpen] = useState(false);
  const [gameState, setGameState] = useState<ArcadeState>("attract");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(4850);
  const [muted, setMuted] = useState(false);
  const [steerDir, setSteerDir] = useState<-1 | 0 | 1>(0);
  const [boosting, setBoosting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<{ left: boolean; right: boolean; boost: boolean }>({
    left: false,
    right: false,
    boost: false,
  });
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const handleOpenEasterEgg = useCallback(() => {
    playArcadeSound("coin", mutedRef.current);
    setIsOpen(true);
  }, []);

  const handleCloseCabinet = useCallback(() => {
    setIsOpen(false);
    setGameState("attract");
    setSteerDir(0);
    setBoosting(false);
    keysRef.current = { left: false, right: false, boost: false };
  }, []);

  const startNewRace = useCallback(() => {
    playArcadeSound("coin", mutedRef.current);
    setScore(0);
    setGameState("playing");
  }, []);

  const returnToAttract = useCallback(() => {
    setGameState("attract");
    setSteerDir(0);
    setBoosting(false);
    keysRef.current = { left: false, right: false, boost: false };
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseCabinet();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, handleCloseCabinet]);

  // Keyboard listeners when cabinet is open and in playing state
  useEffect(() => {
    if (!isOpen || gameState !== "playing") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowLeft" ||
        e.key === "a" ||
        e.key === "A" ||
        e.key === "ф" ||
        e.key === "Ф"
      ) {
        e.preventDefault();
        keysRef.current.left = true;
        setSteerDir(-1);
      } else if (
        e.key === "ArrowRight" ||
        e.key === "d" ||
        e.key === "D" ||
        e.key === "в" ||
        e.key === "В"
      ) {
        e.preventDefault();
        keysRef.current.right = true;
        setSteerDir(1);
      } else if (
        e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === "W" ||
        e.key === "ц" ||
        e.key === "Ц" ||
        e.key === " "
      ) {
        e.preventDefault();
        keysRef.current.boost = true;
        setBoosting(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowLeft" ||
        e.key === "a" ||
        e.key === "A" ||
        e.key === "ф" ||
        e.key === "Ф"
      ) {
        keysRef.current.left = false;
        setSteerDir(keysRef.current.right ? 1 : 0);
      } else if (
        e.key === "ArrowRight" ||
        e.key === "d" ||
        e.key === "D" ||
        e.key === "в" ||
        e.key === "В"
      ) {
        keysRef.current.right = false;
        setSteerDir(keysRef.current.left ? -1 : 0);
      } else if (
        e.key === "ArrowUp" ||
        e.key === "w" ||
        e.key === "W" ||
        e.key === "ц" ||
        e.key === "Ц" ||
        e.key === " "
      ) {
        keysRef.current.boost = false;
        setBoosting(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keysRef.current = { left: false, right: false, boost: false };
    };
  }, [isOpen, gameState]);

  // Main 60fps Canvas Arcade Loop matching the 1988 Diriyah / 1967 Impala visual style
  useEffect(() => {
    if (!isOpen || gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number | null = null;
    let lastTime = performance.now();

    let playerX = 0; // -1.1 .. +1.1 across the 3 lanes
    let playerVelX = 0;
    let speedKmh = 131; // Matches 131 KM/H from the in-game screenshot
    let distanceLeftKm = 2.4;
    let timeLeftSec = 42.0;
    let shield = 3;
    let hitCooldown = 0;
    let currentScore = 0;
    let roadPhase = 0;
    let nextEntityId = 1;
    let spawnCarTimer = 0.6;
    let spawnOrbTimer = 0.45;

    const trafficColors = [
      { body: "#1e1b4b", tail: "#ff2a6d" },
      { body: "#31102f", tail: "#fb7185" },
      { body: "#172554", tail: "#f43f5e" },
    ];

    const cars: ObstacleCar[] = [];
    const orbs: HighwayOrb[] = [];

    const W = 720;
    const H = 420;
    canvas.width = W;
    canvas.height = H;

    const horizonY = Math.round(H * 0.36);
    const vanishX = W * 0.5;
    const roadTopHalfW = 34;
    const roadBotHalfW = W * 0.44;

    const projectRoad = (laneOffset: number, z: number) => {
      const p = Math.pow(1 - Math.max(0, Math.min(1, z)), 1.85);
      const y = horizonY + p * (H - horizonY);
      const halfW = roadTopHalfW + p * (roadBotHalfW - roadTopHalfW);
      const x = vanishX + laneOffset * (halfW * 0.64);
      const scale = 0.14 + p * 0.86;
      return { x, y, halfW, scale, p };
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const steerInput =
        (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
      const targetSpeed = keysRef.current.boost ? 168 : 131;
      speedKmh += (targetSpeed - speedKmh) * Math.min(1, dt * 5.5);

      if (hitCooldown > 0) {
        hitCooldown = Math.max(0, hitCooldown - dt);
      }

      playerVelX += steerInput * 5.6 * dt;
      playerVelX *= Math.pow(0.06, dt);
      playerX += playerVelX * dt * 2.8;
      playerX = Math.max(-1.08, Math.min(1.08, playerX));

      const worldSpeed = (speedKmh / 131) * 0.72;
      roadPhase = (roadPhase + dt * worldSpeed * 3.2) % 1;

      distanceLeftKm = Math.max(
        0,
        distanceLeftKm - dt * (speedKmh / 3600) * 1.9
      );
      timeLeftSec = Math.max(0, timeLeftSec - dt);
      currentScore += Math.round(dt * speedKmh * 1.4);

      if (distanceLeftKm <= 0) {
        const finalBonus = Math.round(timeLeftSec * 50) + shield * 300;
        const total = currentScore + finalBonus;
        setScore(total);
        setHighScore((prev) => Math.max(prev, total));
        playArcadeSound("win", mutedRef.current);
        setGameState("victory");
        return;
      }
      if (timeLeftSec <= 0 || shield <= 0) {
        setScore(currentScore);
        setHighScore((prev) => Math.max(prev, currentScore));
        playArcadeSound("over", mutedRef.current);
        setGameState("gameover");
        return;
      }

      spawnCarTimer -= dt * worldSpeed;
      if (spawnCarTimer <= 0) {
        spawnCarTimer = 0.68 + Math.random() * 0.55;
        const lanes = [-1, 0, 1];
        const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];
        const palette =
          trafficColors[Math.floor(Math.random() * trafficColors.length)];
        cars.push({
          id: nextEntityId++,
          lane: chosenLane,
          z: 0.99,
          color: palette.body,
          tailColor: palette.tail,
          speedFactor: 0.35 + Math.random() * 0.2,
        });
      }

      spawnOrbTimer -= dt * worldSpeed;
      if (spawnOrbTimer <= 0) {
        spawnOrbTimer = 0.85 + Math.random() * 0.6;
        const lanes = [-1, 0, 1];
        const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];
        orbs.push({
          id: nextEntityId++,
          lane: chosenLane,
          z: 0.99,
          collected: false,
        });
      }

      for (let i = cars.length - 1; i >= 0; i--) {
        const c = cars[i];
        c.z -= dt * (worldSpeed - c.speedFactor * 0.45);
        if (
          hitCooldown <= 0 &&
          c.z < 0.16 &&
          c.z > 0.04 &&
          Math.abs(playerX - c.lane) < 0.42
        ) {
          shield -= 1;
          hitCooldown = 1.15;
          speedKmh = Math.max(75, speedKmh - 42);
          playArcadeSound("hit", mutedRef.current);
          cars.splice(i, 1);
          continue;
        }
        if (c.z < -0.08) {
          cars.splice(i, 1);
        }
      }

      for (let i = orbs.length - 1; i >= 0; i--) {
        const o = orbs[i];
        o.z -= dt * worldSpeed;
        if (
          !o.collected &&
          o.z < 0.18 &&
          o.z > 0.03 &&
          Math.abs(playerX - o.lane) < 0.46
        ) {
          o.collected = true;
          currentScore += 250;
          playArcadeSound("orb", mutedRef.current);
          orbs.splice(i, 1);
          continue;
        }
        if (o.z < -0.05) {
          orbs.splice(i, 1);
        }
      }

      setScore(currentScore);

      // RENDER SCENE
      ctx.clearRect(0, 0, W, H);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, "#120317");
      skyGrad.addColorStop(0.55, "#240626");
      skyGrad.addColorStop(1, "#3f0c2e");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY + 2);

      const buildings = [
        { x: 18, w: 62, h: 74 },
        { x: 92, w: 54, h: 52 },
        { x: 268, w: 72, h: 66 },
        { x: 348, w: 64, h: 58 },
        { x: 422, w: 48, h: 72 },
        { x: 580, w: 68, h: 62 },
        { x: 656, w: 56, h: 78 },
      ];
      buildings.forEach((b, bIdx) => {
        const by = horizonY - b.h;
        ctx.fillStyle = "#160521";
        ctx.fillRect(b.x, by, b.w, b.h);
        ctx.fillStyle = "rgba(124, 58, 237, 0.72)";
        for (let wy = by + 8; wy < horizonY - 12; wy += 11) {
          for (let wx = b.x + 7; wx < b.x + b.w - 8; wx += 11) {
            if ((wx + wy + bIdx) % 3 !== 0) {
              ctx.fillRect(wx, wy, 5, 6);
            }
          }
        }
      });

      ctx.fillStyle = "#1c0623";
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.quadraticCurveTo(W * 0.16, horizonY - 42, W * 0.35, horizonY);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(W * 0.65, horizonY);
      ctx.quadraticCurveTo(W * 0.84, horizonY - 44, W, horizonY);
      ctx.fill();

      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      groundGrad.addColorStop(0, "#1c0726");
      groundGrad.addColorStop(0.35, "#11051a");
      groundGrad.addColorStop(1, "#07030d");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      ctx.fillStyle = "#0b0614";
      ctx.beginPath();
      ctx.moveTo(vanishX - roadTopHalfW, horizonY);
      ctx.lineTo(vanishX + roadTopHalfW, horizonY);
      ctx.lineTo(vanishX + roadBotHalfW, H);
      ctx.lineTo(vanishX - roadBotHalfW, H);
      ctx.closePath();
      ctx.fill();

      const playerProj = projectRoad(playerX, 0.1);
      const beamGrad = ctx.createRadialGradient(
        playerProj.x,
        playerProj.y - 18,
        10,
        playerProj.x,
        playerProj.y - 110,
        160
      );
      beamGrad.addColorStop(0, "rgba(253, 230, 138, 0.22)");
      beamGrad.addColorStop(0.5, "rgba(167, 139, 250, 0.1)");
      beamGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(playerProj.x - 42, playerProj.y - 12);
      ctx.lineTo(playerProj.x - 130, horizonY + 18);
      ctx.lineTo(playerProj.x + 130, horizonY + 18);
      ctx.lineTo(playerProj.x + 42, playerProj.y - 12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(192, 132, 252, 0.52)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(vanishX - roadTopHalfW, horizonY);
      ctx.lineTo(vanishX - roadBotHalfW, H);
      ctx.moveTo(vanishX + roadTopHalfW, horizonY);
      ctx.lineTo(vanishX + roadBotHalfW, H);
      ctx.stroke();

      const numSlices = 10;
      for (let i = 0; i < numSlices; i++) {
        const z = ((i / numSlices) - roadPhase / numSlices + 1) % 1;
        const zNext = Math.max(0, z - 0.045);
        const p1 = projectRoad(0, z);
        const p2 = projectRoad(0, zNext);

        [-0.34, 0.34].forEach((div) => {
          const x1 = vanishX + div * p1.halfW;
          const x2 = vanishX + div * p2.halfW;
          const w1 = Math.max(1.2, 6 * p1.scale);
          ctx.strokeStyle = `rgba(216, 180, 254, ${(0.25 + p1.p * 0.65).toFixed(2)})`;
          ctx.lineWidth = w1;
          ctx.beginPath();
          ctx.moveTo(x1, p1.y);
          ctx.lineTo(x2, p2.y);
          ctx.stroke();
        });

        if (i % 2 === 0) {
          const postSize = Math.max(2, Math.round(11 * p1.scale));
          ctx.fillStyle = `rgba(248, 250, 252, ${(0.35 + p1.p * 0.65).toFixed(2)})`;
          ctx.fillRect(
            vanishX - p1.halfW - postSize * 1.8,
            p1.y - postSize,
            postSize,
            postSize * 1.25
          );
          ctx.fillRect(
            vanishX + p1.halfW + postSize * 0.8,
            p1.y - postSize,
            postSize,
            postSize * 1.25
          );
        }

        if (i % 3 === 0) {
          const poleH = 95 * p1.scale;
          const armW = 22 * p1.scale;
          const lx = vanishX - p1.halfW * 1.28;
          const rx = vanishX + p1.halfW * 1.28;

          ctx.strokeStyle = `rgba(192, 132, 252, ${(0.3 + p1.p * 0.55).toFixed(2)})`;
          ctx.lineWidth = Math.max(1, 3 * p1.scale);

          ctx.beginPath();
          ctx.moveTo(lx, p1.y);
          ctx.lineTo(lx, p1.y - poleH);
          ctx.lineTo(lx + armW, p1.y - poleH);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(rx, p1.y);
          ctx.lineTo(rx, p1.y - poleH);
          ctx.lineTo(rx - armW, p1.y - poleH);
          ctx.stroke();

          ctx.fillStyle = "#f472b6";
          ctx.shadowColor = "#e879f9";
          ctx.shadowBlur = 10 * p1.scale;
          const lampR = Math.max(1.5, 4 * p1.scale);
          ctx.fillRect(
            lx + armW - lampR,
            p1.y - poleH - lampR * 0.5,
            lampR * 2,
            lampR
          );
          ctx.fillRect(
            rx - armW - lampR,
            p1.y - poleH - lampR * 0.5,
            lampR * 2,
            lampR
          );
          ctx.shadowBlur = 0;
        }
      }

      const renderables: {
        z: number;
        draw: () => void;
      }[] = [];

      orbs.forEach((o) => {
        renderables.push({
          z: o.z,
          draw: () => {
            const proj = projectRoad(o.lane, o.z);
            const r = Math.max(3, 16 * proj.scale);
            ctx.save();
            ctx.shadowColor = "#fbbf24";
            ctx.shadowBlur = 14 * proj.scale;
            ctx.fillStyle = "#fde68a";
            ctx.beginPath();
            ctx.arc(proj.x, proj.y - r * 0.9, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(proj.x, proj.y - r * 0.9, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          },
        });
      });

      cars.forEach((c) => {
        renderables.push({
          z: c.z,
          draw: () => {
            const proj = projectRoad(c.lane, c.z);
            const cw = Math.max(8, 86 * proj.scale);
            const ch = Math.max(6, 46 * proj.scale);
            const cx = proj.x - cw * 0.5;
            const cy = proj.y - ch;

            ctx.save();
            ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
            ctx.fillRect(cx - 2, proj.y - 4, cw + 4, 6);

            ctx.fillStyle = c.color;
            ctx.fillRect(cx, cy + ch * 0.38, cw, ch * 0.62);

            ctx.fillStyle = "#090514";
            ctx.fillRect(cx + cw * 0.16, cy, cw * 0.68, ch * 0.44);

            ctx.fillStyle = c.tailColor;
            ctx.shadowColor = c.tailColor;
            ctx.shadowBlur = 8 * proj.scale;
            const tw = Math.max(2, cw * 0.18);
            const th = Math.max(1.5, ch * 0.16);
            ctx.fillRect(cx + cw * 0.08, cy + ch * 0.58, tw, th);
            ctx.fillRect(cx + cw * 0.74, cy + ch * 0.58, tw, th);
            ctx.restore();
          },
        });
      });

      renderables.sort((a, b) => b.z - a.z);
      renderables.forEach((r) => r.draw());

      // Player's 1967 Chevrolet Impala
      const impalaProj = projectRoad(playerX, 0.08);
      const impW = 146;
      const impH = 68;
      const ix = impalaProj.x - impW * 0.5;
      const iy = H - impH - 22;
      const blinkSkip =
        hitCooldown > 0 && Math.floor(hitCooldown * 14) % 2 === 0;

      if (!blinkSkip) {
        ctx.save();
        ctx.translate(impalaProj.x, iy + impH * 0.5);
        ctx.rotate(playerVelX * 0.035);
        ctx.translate(-impalaProj.x, -(iy + impH * 0.5));

        ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
        ctx.fillRect(ix - 8, iy + impH - 4, impW + 16, 12);

        ctx.fillStyle = "#05030a";
        ctx.beginPath();
        ctx.moveTo(ix + 22, iy + 4);
        ctx.lineTo(ix + impW - 22, iy + 4);
        ctx.lineTo(ix + impW, iy + 30);
        ctx.lineTo(ix + impW + 4, iy + impH - 6);
        ctx.lineTo(ix - 4, iy + impH - 6);
        ctx.lineTo(ix, iy + 30);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(88, 28, 135, 0.32)";
        ctx.beginPath();
        ctx.moveTo(ix + 28, iy + 9);
        ctx.lineTo(ix + impW - 28, iy + 9);
        ctx.lineTo(ix + impW - 16, iy + 27);
        ctx.lineTo(ix + 16, iy + 27);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(148, 163, 184, 0.35)";
        ctx.fillRect(ix + 4, iy + impH - 12, impW - 8, 3);

        ctx.shadowColor = "#ff2a6d";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#ff2a6d";
        ctx.fillRect(ix + 14, iy + 40, 24, 11);
        ctx.fillRect(ix + impW - 38, iy + 40, 24, 11);

        ctx.fillStyle = "#ffe4e6";
        ctx.fillRect(ix + 18, iy + 42, 16, 6);
        ctx.fillRect(ix + impW - 34, iy + 42, 16, 6);

        if (keysRef.current.boost) {
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "#f59e0b";
          ctx.shadowBlur = 12;
          ctx.fillRect(ix + 26, iy + impH - 4, 10, 7 + Math.random() * 6);
          ctx.fillRect(
            ix + impW - 36,
            iy + impH - 4,
            10,
            7 + Math.random() * 6
          );
        }

        ctx.restore();
      }

      // Top HUD Bar in Lunoris Ovo Serif + Neon Gold aesthetic
      ctx.save();
      ctx.fillStyle = "rgba(8, 5, 18, 0.84)";
      ctx.fillRect(14, 12, W - 28, 36);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.52)";
      ctx.lineWidth = 1.25;
      ctx.strokeRect(14, 12, W - 28, 36);

      ctx.font = '600 13.5px "Ovo", Georgia, serif';
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(251, 191, 36, 0.7)";
      ctx.shadowBlur = 8;

      ctx.fillStyle = "#fef3c7";
      ctx.textAlign = "left";
      ctx.fillText(
        `✦ DIRIYAH: ${distanceLeftKm.toFixed(2)} KM`,
        26,
        30
      );

      ctx.fillStyle = timeLeftSec < 10 ? "#fb7185" : "#fffbeb";
      ctx.textAlign = "center";
      ctx.fillText(`TIME · ${timeLeftSec.toFixed(1)}S`, W * 0.52, 30);

      ctx.fillStyle = "#fbbf24";
      ctx.textAlign = "right";
      ctx.fillText(
        `IMPALA · ${"✦".repeat(Math.max(0, shield))}${"✧".repeat(
          Math.max(0, 3 - shield)
        )}`,
        W - 26,
        30
      );

      // Bottom-Right Speedometer Gauge in Lunoris Ovo Serif + Violet/Gold glow
      const gaugeX = W - 82;
      const gaugeY = H - 24;
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 64, Math.PI, Math.PI * 2);
      ctx.fillStyle = "rgba(22, 10, 42, 0.9)";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.75)";
      ctx.stroke();

      ctx.font = '700 22px "Ovo", Georgia, serif';
      ctx.fillStyle = "#fef3c7";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(251, 191, 36, 0.9)";
      ctx.shadowBlur = 12;
      ctx.fillText(`${Math.round(speedKmh)}`, gaugeX + 6, gaugeY - 22);
      ctx.font = '600 10px "Ovo", Georgia, serif';
      ctx.fillStyle = "#e879f9";
      ctx.shadowBlur = 0;
      ctx.fillText("KM / H", gaugeX + 6, gaugeY - 6);
      ctx.restore();

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [isOpen, gameState]);

  const setTouchSteer = (dir: -1 | 0 | 1) => {
    keysRef.current.left = dir === -1;
    keysRef.current.right = dir === 1;
    setSteerDir(dir);
  };

  const setTouchBoost = (active: boolean) => {
    keysRef.current.boost = active;
    setBoosting(active);
  };

  return (
    <>
      {/* Subtle Corner Easter Egg Trigger on /retro-games */}
      <button
        type="button"
        onClick={handleOpenEasterEgg}
        className={`impala-easter-egg-trigger ${isOpen ? "is-hidden" : ""}`}
        aria-label={
          isRu
            ? "Секретный аркадный автомат · 1967 Impala"
            : "Secret Arcade Cabinet · 1967 Impala"
        }
        title={
          isRu
            ? "Пасхалка: запустить аркадный автомат 1967 Impala"
            : "Easter Egg: Launch 1967 Impala Arcade Cabinet"
        }
      >
        <span className="impala-egg-icon-box" aria-hidden="true">
          <svg
            viewBox="0 0 44 28"
            className="impala-egg-car-svg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Classic 1967 Impala Rear Silhouette + Twin Crimson Taillights */}
            <path
              d="M7 18L11 9H33L37 18L39 23H5L7 18Z"
              fill="rgba(12, 8, 24, 0.95)"
              stroke="rgba(251, 191, 36, 0.78)"
              strokeWidth="1.4"
            />
            <rect
              x="8.5"
              y="18.5"
              width="7"
              height="3"
              rx="0.8"
              fill="#ff2a6d"
            />
            <rect
              x="28.5"
              y="18.5"
              width="7"
              height="3"
              rx="0.8"
              fill="#ff2a6d"
            />
          </svg>
          <span className="impala-egg-coin-tag">25¢</span>
        </span>
        <span className="impala-egg-label">
          <MagneticLetters
            text={isRu ? "✦ 1988 · АВТОМАТ" : "✦ 1988 · ARCADE"}
            glowColor="rgba(251, 191, 36, 0.92)"
            intensity={0.92}
          />
        </span>
      </button>

      {/* Full Lunoris-Styled Arcade Cabinet Modal when Easter Egg is activated */}
      {isOpen ? (
        <div
          className="impala-arcade-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseCabinet();
          }}
        >
          <div
            className="impala-arcade-cabinet"
            role="dialog"
            aria-modal="true"
            aria-label="1967 Impala — The Baby Race Arcade Cabinet"
          >
            <div className="lunoris-canvas-weave" aria-hidden="true" />
            <WideDeckledCanvasFrame />

            <button
              type="button"
              onClick={handleCloseCabinet}
              className="impala-cabinet-close-btn"
              aria-label={isRu ? "Закрыть автомат" : "Close cabinet"}
            >
              ✕
            </button>

            {/* Top Glowing Arcade Marquee Header in Page Typography */}
            <div className="impala-cabinet-marquee">
              <div className="impala-marquee-titles">
                <span className="lunoris-title-minor impala-marquee-sub">
                  <MagneticLetters
                    text={
                      isRu
                        ? "СЕКРЕТНЫЙ АВТОМАТ ДЖОНА ФОРДА · ЭД-ДИРЪИЯ 1988"
                        : "JOHN FORD SECRET CABINET · 1988 DIRIYAH"
                    }
                    glowColor="rgba(251, 191, 36, 0.9)"
                    intensity={0.92}
                  />
                </span>
                <h3 className="impala-marquee-main">
                  <MagneticLetters
                    text="1967 IMPALA · THE BABY RACE"
                    glowColor="rgba(251, 191, 36, 0.98)"
                    intensity={1.1}
                  />
                </h3>
                <OrnamentDivider />
              </div>
            </div>

            {/* CRT Screen Framed with DeckledCanvasFrame */}
            <div className="impala-cabinet-bezel">
              <div className="impala-crt-score-strip">
                <span className="impala-score-item">
                  <MagneticLetters
                    text={`1UP · ${String(score).padStart(5, "0")}`}
                    glowColor="rgba(251, 191, 36, 0.9)"
                    intensity={0.88}
                  />
                </span>
                <span className="impala-crt-mode-pill">
                  <MagneticLetters
                    text={
                      gameState === "attract"
                        ? isRu
                          ? "ЗАСТАВКА · НАЖМИТЕ START"
                          : "ATTRACT MODE · PRESS START"
                        : isRu
                          ? "УПРАВЛЕНИЕ · A / D ИЛИ ◀ / ▶"
                          : "CONTROLS · A / D OR ◀ / ▶"
                    }
                    glowColor="rgba(251, 191, 36, 0.88)"
                    intensity={0.72}
                  />
                </span>
                <span className="impala-score-item">
                  <MagneticLetters
                    text={`BEST · ${String(highScore).padStart(5, "0")}`}
                    glowColor="rgba(251, 191, 36, 0.9)"
                    intensity={0.88}
                  />
                </span>
              </div>

              <div className="impala-crt-screen">
                <DeckledCanvasFrame />

                {/* Attract Mode: Real in-game video from the build + Press Start overlay */}
                {gameState === "attract" ? (
                  <div className="impala-crt-attract">
                    <ResilientVideo
                      className="impala-crt-video"
                      src="/assets/car-level-loop.mp4"
                      poster="/assets/car-level-poster.jpg"
                      preload="metadata"
                    />
                    <div className="impala-crt-attract-overlay">
                      <span className="impala-attract-badge">
                        <MagneticLetters
                          text={
                            isRu
                              ? "ЭХО-ВОСПОМИНАНИЕ 01 · 1988 ДИРЪИЯ"
                              : "ECHO MEMORY 01 · 1988 DIRIYAH"
                          }
                          glowColor="rgba(251, 191, 36, 0.9)"
                          intensity={0.88}
                        />
                      </span>
                      <h4 className="impala-attract-title">
                        <MagneticLetters
                          text="THE BABY RACE"
                          glowColor="rgba(251, 191, 36, 0.96)"
                          intensity={1.1}
                        />
                      </h4>
                      <p className="impala-attract-hint">
                        <MagneticLetters
                          text={
                            isRu
                              ? "Ведите 1967 Chevrolet Impala по ночному шоссе к дому бабушки"
                              : "Drive the 1967 Chevrolet Impala down the midnight highway"
                          }
                          glowColor="rgba(251, 191, 36, 0.82)"
                          intensity={0.68}
                        />
                      </p>
                      <button
                        type="button"
                        onClick={startNewRace}
                        className="lunoris-all-news-btn impala-brush-cta-btn"
                      >
                        <BrushstrokeButtonBg />
                        <span>
                          <MagneticLetters
                            text={
                              isRu
                                ? "✦ INSERT COIN · НАЧАТЬ ЗАЕЗД ✦"
                                : "✦ INSERT COIN · START RACE ✦"
                            }
                            glowColor="rgba(251, 191, 36, 0.98)"
                            intensity={0.95}
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Live Playable Canvas */}
                <canvas
                  ref={canvasRef}
                  className={`impala-crt-canvas ${
                    gameState === "playing" ? "is-active" : ""
                  }`}
                />

                {/* Victory Overlay */}
                {gameState === "victory" ? (
                  <div className="impala-crt-result-overlay is-victory">
                    <span className="impala-result-badge">
                      <MagneticLetters
                        text={
                          isRu
                            ? "ВОСПОМИНАНИЕ ЗАВЕРШЕНО · 1988 ДИРЪИЯ"
                            : "MEMORY COMPLETED · 1988 DIRIYAH"
                        }
                        glowColor="rgba(251, 191, 36, 0.9)"
                        intensity={0.88}
                      />
                    </span>
                    <h4 className="impala-result-title">
                      <MagneticLetters
                        text={
                          isRu
                            ? "ВЫ УСПЕЛИ ВОВРЕМЯ!"
                            : "ARRIVED AT GRANDMOTHER'S!"
                        }
                        glowColor="rgba(251, 191, 36, 0.96)"
                        intensity={1.08}
                      />
                    </h4>
                    <p className="impala-result-quote">
                      <MagneticLetters
                        text="“Stubborn and impatient. Just like her mother.”"
                        glowColor="rgba(251, 191, 36, 0.85)"
                        intensity={0.68}
                      />
                    </p>
                    <p className="impala-result-score">
                      <MagneticLetters
                        text={`SCORE · ${score}`}
                        glowColor="rgba(251, 191, 36, 0.95)"
                        intensity={0.95}
                      />
                    </p>
                    <div className="impala-result-actions">
                      <button
                        type="button"
                        onClick={startNewRace}
                        className="lunoris-all-news-btn impala-brush-cta-btn"
                      >
                        <BrushstrokeButtonBg />
                        <span>
                          <MagneticLetters
                            text={isRu ? "СЫГРАТЬ ЕЩЁ РАЗ" : "PLAY AGAIN"}
                            glowColor="rgba(251, 191, 36, 0.96)"
                            intensity={0.95}
                          />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={returnToAttract}
                        className="impala-secondary-btn"
                      >
                        <MagneticLetters
                          text={isRu ? "К ВИДЕО ИЗ ИГРЫ" : "BUILD VIDEO"}
                          glowColor="rgba(232, 121, 249, 0.9)"
                          intensity={0.88}
                        />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Game Over Overlay */}
                {gameState === "gameover" ? (
                  <div className="impala-crt-result-overlay is-gameover">
                    <span className="impala-result-badge">
                      <MagneticLetters
                        text={
                          isRu ? "СИГНАЛ ПРЕРВАН" : "MEMORY INTERRUPTED"
                        }
                        glowColor="rgba(251, 191, 36, 0.9)"
                        intensity={0.88}
                      />
                    </span>
                    <h4 className="impala-result-title">
                      <MagneticLetters
                        text="CONTINUE? 9 · 8 · 7"
                        glowColor="rgba(251, 191, 36, 0.96)"
                        intensity={1.08}
                      />
                    </h4>
                    <p className="impala-result-score">
                      <MagneticLetters
                        text={`SCORE · ${score}`}
                        glowColor="rgba(251, 191, 36, 0.95)"
                        intensity={0.95}
                      />
                    </p>
                    <div className="impala-result-actions">
                      <button
                        type="button"
                        onClick={startNewRace}
                        className="lunoris-all-news-btn impala-brush-cta-btn"
                      >
                        <BrushstrokeButtonBg />
                        <span>
                          <MagneticLetters
                            text={
                              isRu
                                ? "ВСТАВИТЬ МОНЕТУ · ПОВТОР"
                                : "INSERT COIN · RETRY"
                            }
                            glowColor="rgba(251, 191, 36, 0.96)"
                            intensity={0.95}
                          />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={returnToAttract}
                        className="impala-secondary-btn"
                      >
                        <MagneticLetters
                          text={isRu ? "К ВИДЕО ИЗ ИГРЫ" : "BUILD VIDEO"}
                          glowColor="rgba(232, 121, 249, 0.9)"
                          intensity={0.88}
                        />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="lunoris-retro-crt-screen" aria-hidden="true" />
              </div>
            </div>

            {/* Arcade Control Panel Styled in Page's Golden-Violet Aesthetic */}
            <div className="impala-cabinet-control-deck">
              <div className="impala-deck-left">
                <div
                  className={`impala-joystick-base ${
                    steerDir === -1
                      ? "is-tilted-left"
                      : steerDir === 1
                        ? "is-tilted-right"
                        : ""
                  }`}
                  aria-hidden="true"
                >
                  <div className="impala-joystick-shaft">
                    <div className="impala-joystick-ball" />
                  </div>
                </div>

                <div className="impala-steer-pad">
                  <button
                    type="button"
                    className={`impala-arcade-btn is-steer ${
                      steerDir === -1 ? "is-pressed" : ""
                    }`}
                    onMouseDown={() => setTouchSteer(-1)}
                    onMouseUp={() => setTouchSteer(0)}
                    onMouseLeave={() => setTouchSteer(0)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setTouchSteer(-1);
                    }}
                    onTouchEnd={() => setTouchSteer(0)}
                    aria-label="Steer Left"
                  >
                    <MagneticLetters
                      text="◀ A"
                      glowColor="rgba(251, 191, 36, 0.9)"
                      intensity={0.9}
                    />
                  </button>
                  <button
                    type="button"
                    className={`impala-arcade-btn is-steer ${
                      steerDir === 1 ? "is-pressed" : ""
                    }`}
                    onMouseDown={() => setTouchSteer(1)}
                    onMouseUp={() => setTouchSteer(0)}
                    onMouseLeave={() => setTouchSteer(0)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setTouchSteer(1);
                    }}
                    onTouchEnd={() => setTouchSteer(0)}
                    aria-label="Steer Right"
                  >
                    <MagneticLetters
                      text="D ▶"
                      glowColor="rgba(251, 191, 36, 0.9)"
                      intensity={0.9}
                    />
                  </button>
                </div>
              </div>

              <div className="impala-deck-center">
                <button
                  type="button"
                  onClick={
                    gameState === "playing" ? returnToAttract : startNewRace
                  }
                  className="impala-arcade-btn is-start-pill"
                >
                  <MagneticLetters
                    text={
                      gameState === "playing"
                        ? isRu
                          ? "✦ СТОП / ВИДЕО"
                          : "✦ EXIT TO VIDEO"
                        : "✦ START 1P · 25¢"
                    }
                    glowColor="rgba(251, 191, 36, 0.96)"
                    intensity={0.95}
                  />
                </button>
              </div>

              <div className="impala-deck-right">
                <button
                  type="button"
                  className={`impala-arcade-btn is-nitro ${
                    boosting ? "is-pressed" : ""
                  }`}
                  onMouseDown={() => setTouchBoost(true)}
                  onMouseUp={() => setTouchBoost(false)}
                  onMouseLeave={() => setTouchBoost(false)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setTouchBoost(true);
                  }}
                  onTouchEnd={() => setTouchBoost(false)}
                >
                  <MagneticLetters
                    text="▲ NITRO"
                    glowColor="rgba(232, 121, 249, 0.92)"
                    intensity={0.9}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  className="impala-arcade-btn is-sfx"
                  title={muted ? "Unmute SFX" : "Mute SFX"}
                >
                  <MagneticLetters
                    text={muted ? "SFX OFF" : "SFX ON"}
                    glowColor="rgba(251, 191, 36, 0.88)"
                    intensity={0.88}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
