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

    let flightProgress = 0;
    let targetFlight = 0;
    let flightRafId: number | null = null;
    let lastTime = performance.now();

    // Desktop CSS sets zoom on <html> (globals.css). Rects and scrollY are in
    // screen px, while px values set inside the page get zoomed, so divide by it.
    const pageZoom = () =>
      parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

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

      const navRect = navSlot.getBoundingClientRect();
      const ctaRect = ctaSlot.getBoundingClientRect();

      const startX = navRect.left + navRect.width / 2;
      const startY = navRect.top + navRect.height / 2;
      const endX = ctaRect.left + ctaRect.width / 2;
      const rawEndY = ctaRect.top + ctaRect.height / 2;
      const endY = Math.min(
        window.innerHeight - 68,
        Math.max(startY + 120, rawEndY)
      );

      // Comfortable margin from the right edge (responsive for mobile, tablet, and desktop)
      const isMobile = window.innerWidth <= 768;
      const minRightMargin = isMobile
        ? Math.max(24, window.innerWidth * 0.06)
        : Math.max(105, window.innerWidth * 0.06);
      const railX = Math.min(startX, window.innerWidth - minRightMargin);

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

      const z = pageZoom();
      btn.style.setProperty("--btn-fly-x", `${(dx / z).toFixed(2)}px`);
      btn.style.setProperty("--btn-fly-y", `${(dy / z).toFixed(2)}px`);
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
          if (heroRef.current) {
            const y = Math.min(window.scrollY / pageZoom(), 800);
            heroRef.current.style.setProperty("--hero-scroll", `${y}`);
          }

          if (roadmapTimelineRef.current) {
            const rect = roadmapTimelineRef.current.getBoundingClientRect();
            const triggerPoint = window.innerHeight * 0.68;
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
            const shouldFlyDown = ctaRect.top < window.innerHeight * 0.88;
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
