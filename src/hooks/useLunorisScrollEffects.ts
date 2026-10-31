"use client";

import { useEffect, useRef, useState } from "react";
import { GAME_ROADMAP } from "@/data/gameData";

export function useLunorisScrollEffects() {
  const heroRef = useRef<HTMLElement | null>(null);
  const roadmapTimelineRef = useRef<HTMLDivElement | null>(null);
  const navBtnSlotRef = useRef<HTMLDivElement | null>(null);
  const steamBtnRef = useRef<HTMLAnchorElement | null>(null);
  const finalCtaSlotRef = useRef<HTMLDivElement | null>(null);
  const [roadmapStep, setRoadmapStep] = useState(0);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    elements.forEach((el) => observer.observe(el));

    // Also observe any [data-reveal] elements rendered asynchronously (e.g. after fetch)
    const mutationObserver = new MutationObserver(() => {
      document
        .querySelectorAll("[data-reveal]:not(.is-visible)")
        .forEach((el) => observer.observe(el));
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    let flightProgress = 0;
    let targetFlight = 0;
    let flightRafId: number | null = null;
    let lastTime = performance.now();

    // Desktop CSS sets zoom on <html> (globals.css). Chrome 128+ / Firefox 126+ /
    // Safari 18+ scale getBoundingClientRect() by CSS zoom, whereas Safari 15-17
    // returns unzoomed CSS px in getBoundingClientRect(). Measuring the live ratio
    // between getBoundingClientRect().width and offsetWidth keeps flight & scroll
    // math pixel-accurate across all engines and versions.
    const pageZoom = () =>
      parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

    const getRectMetrics = () => {
      const z = pageZoom();
      const navSlot = navBtnSlotRef.current;
      const rectScale =
        navSlot && navSlot.offsetWidth > 0
          ? navSlot.getBoundingClientRect().width / navSlot.offsetWidth
          : z;
      const safeRectScale = rectScale > 0.01 ? rectScale : 1;
      const vpScale = safeRectScale / z;
      return {
        z,
        rectScale: safeRectScale,
        vpW: window.innerWidth * vpScale,
        vpH: window.innerHeight * vpScale,
      };
    };

    const applySteamFlight = (p: number) => {
      const btn = steamBtnRef.current;
      const navSlot = navBtnSlotRef.current;
      const ctaSlot = finalCtaSlotRef.current;
      if (!btn || !navSlot || !ctaSlot) return;

      if (p <= 0.001) {
        btn.style.setProperty("--btn-fly-x", "0px");
        btn.style.setProperty("--btn-fly-y", "0px");
        btn.style.setProperty("--btn-fly-scale", "1");
        btn.style.setProperty("--btn-fly-rot", "0deg");
        btn.style.setProperty("--cta-morph", "0");
        btn.classList.remove(
          "is-magic-flying",
          "is-magic-landed",
          "is-cta-expanded"
        );
        return;
      }

      const { rectScale, vpW, vpH } = getRectMetrics();
      const navRect = navSlot.getBoundingClientRect();
      const ctaRect = ctaSlot.getBoundingClientRect();

      const startX = navRect.left + navRect.width / 2;
      const startY = navRect.top + navRect.height / 2;
      const endX = ctaRect.left + ctaRect.width / 2;
      const rawEndY = ctaRect.top + ctaRect.height / 2;
      const endY = Math.min(
        vpH - 68 * rectScale,
        Math.max(startY + 120 * rectScale, rawEndY)
      );

      // Comfortable margin from the active side edge (LTR right rail, RTL left rail)
      const isMobile = window.innerWidth <= 768;
      const minSideMargin = isMobile
        ? Math.max(24 * rectScale, vpW * 0.06)
        : Math.max(105 * rectScale, vpW * 0.06);
      const isLeftRail = startX < vpW * 0.5;
      const railX = isLeftRail
        ? Math.max(startX, minSideMargin)
        : Math.min(startX, vpW - minSideMargin);

      // Silky-smooth sine ease-in-out parameter u in [0, 1]
      const u = 0.5 - 0.5 * Math.cos(p * Math.PI);
      const inv = 1 - u;

      // Single continuous Cubic Bezier curve:
      // P0 = (startX, startY)
      // P1 = (railX, startY + (endY - startY) * 0.65)
      // P2 = (railX, endY)
      // P3 = (endX, endY)
      const p1y = startY + (endY - startY) * 0.65;
      const currentX =
        inv * inv * inv * startX +
        3 * inv * inv * u * railX +
        3 * inv * u * u * railX +
        u * u * u * endX;
      const currentY =
        inv * inv * inv * startY +
        3 * inv * inv * u * p1y +
        3 * inv * u * u * endY +
        u * u * u * endY;

      // Smoothstep morph between solo Steam icon and full Ethereal Moonlight button
      const rawMorph = Math.max(0, Math.min(1, (u - 0.48) / 0.48));
      const ctaMorph = rawMorph * rawMorph * (3 - 2 * rawMorph);

      const dx = currentX - startX;
      const dy = currentY - startY;
      const arc = Math.sin(u * Math.PI);
      const dir = targetFlight === 1 ? 1 : -1;
      const scale = 1 + arc * 0.08;
      const rot = Math.sin(u * Math.PI) * (-2.2 * dir);

      btn.style.setProperty("--btn-fly-x", `${(dx / rectScale).toFixed(2)}px`);
      btn.style.setProperty("--btn-fly-y", `${(dy / rectScale).toFixed(2)}px`);
      btn.style.setProperty("--btn-fly-scale", `${scale.toFixed(3)}`);
      btn.style.setProperty("--btn-fly-rot", `${rot.toFixed(2)}deg`);
      btn.style.setProperty("--cta-morph", `${ctaMorph.toFixed(3)}`);

      const isFlying = p > 0.015 && p < 0.985;
      const isLanded = p >= 0.985;
      btn.classList.toggle("is-magic-flying", isFlying);
      btn.classList.toggle("is-magic-landed", isLanded);
      btn.classList.toggle("is-cta-expanded", u > 0.5);
    };

    const stepFlight = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const speed = 1 / 1.12; // 1.12s smooth magical flight duration
      if (Math.abs(targetFlight - flightProgress) > 0.001) {
        if (flightProgress < targetFlight) {
          flightProgress = Math.min(targetFlight, flightProgress + dt * speed);
        } else {
          flightProgress = Math.max(targetFlight, flightProgress - dt * speed);
        }
        applySteamFlight(flightProgress);
        flightRafId = window.requestAnimationFrame(stepFlight);
      } else {
        flightProgress = targetFlight;
        applySteamFlight(flightProgress);
        flightRafId = null;
      }
    };

    const startFlightLoop = () => {
      if (flightRafId === null) {
        lastTime = performance.now();
        flightRafId = window.requestAnimationFrame(stepFlight);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { z, vpH } = getRectMetrics();

          if (heroRef.current) {
            const y = Math.min(window.scrollY / z, 800);
            heroRef.current.style.setProperty("--hero-scroll", `${y}`);
          }

          if (roadmapTimelineRef.current) {
            const rect = roadmapTimelineRef.current.getBoundingClientRect();
            const triggerPoint = vpH * 0.68;
            const rawProgress =
              (triggerPoint - rect.top) / Math.max(1, rect.height);
            const clamped = Math.max(0, Math.min(1, rawProgress));
            roadmapTimelineRef.current.style.setProperty(
              "--roadmap-progress",
              `${clamped}`
            );

            // Determine how many milestones the scroll beam has reached
            const stepIndex = Math.min(
              GAME_ROADMAP.length - 1,
              Math.max(0, Math.floor(clamped * GAME_ROADMAP.length))
            );
            setRoadmapStep(clamped <= 0.02 ? 0 : stepIndex);
          }

          if (finalCtaSlotRef.current) {
            const ctaRect = finalCtaSlotRef.current.getBoundingClientRect();
            const shouldFlyDown = ctaRect.top < vpH * 0.88;
            const nextTarget = shouldFlyDown ? 1 : 0;
            if (nextTarget !== targetFlight) {
              targetFlight = nextTarget;
              startFlightLoop();
            } else if (flightProgress > 0.001 && flightRafId === null) {
              // Keep button locked to the bottom slot while scrolling
              applySteamFlight(flightProgress);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (flightRafId !== null) {
        window.cancelAnimationFrame(flightRafId);
      }
    };
  }, []);

  return {
    heroRef,
    roadmapTimelineRef,
    navBtnSlotRef,
    steamBtnRef,
    finalCtaSlotRef,
    roadmapStep,
  };
}
