"use client";

import React, { useCallback, useEffect, useRef } from "react";

interface ResilientVideoProps {
  src: string;
  poster?: string;
  className?: string;
  preload?: "none" | "metadata" | "auto";
  controls?: boolean;
  pauseWhenOffscreen?: boolean;
}

const MAX_ERROR_RETRIES = 3;
const ERROR_BACKOFF_MS = [700, 2000, 5000] as const;

export function ResilientVideo({
  src,
  poster,
  className,
  preload = "auto",
  controls = false,
  pauseWhenOffscreen = true,
}: ResilientVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isIntersectingRef = useRef<boolean>(true);
  const retryTimerRef = useRef<number | null>(null);
  const errorCountRef = useRef<number>(0);
  const reducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    errorCountRef.current = 0;
  }, [src]);

  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (errorCountRef.current >= MAX_ERROR_RETRIES) return;
    if (!controls && reducedMotionRef.current) return;
    if (pauseWhenOffscreen && !isIntersectingRef.current) return;
    if (document.visibilityState === "hidden") return;

    video.defaultMuted = true;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay or transient decode lock; retry gently
      });
    }
  }, [controls, pauseWhenOffscreen]);

  const scheduleRecovery = useCallback(
    (reloadSource = false) => {
      if (!controls && reducedMotionRef.current) return;
      if (errorCountRef.current >= MAX_ERROR_RETRIES) return;

      let delayMs = 700;
      if (reloadSource) {
        const attempt = errorCountRef.current;
        errorCountRef.current += 1;
        delayMs =
          ERROR_BACKOFF_MS[Math.min(attempt, ERROR_BACKOFF_MS.length - 1)];
      }

      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
      }
      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null;
        const video = videoRef.current;
        if (!video) return;
        if (!controls && reducedMotionRef.current) return;
        if (
          reloadSource ||
          video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE
        ) {
          const lastTime = video.currentTime || 0;
          video.load();
          if (lastTime > 0.1) {
            try {
              video.currentTime = lastTime;
            } catch {
              // Ignore seek before metadata is ready
            }
          }
        } else if (video.paused || video.ended) {
          if (video.ended) {
            video.currentTime = 0;
          }
        }
        safePlay();
      }, delayMs);
    },
    [controls, safePlay]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    reducedMotionRef.current = reducedMotionQuery.matches;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");

    if (!controls && reducedMotionRef.current && !video.paused) {
      video.pause();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isIntersectingRef.current = entry.isIntersecting;

        if (entry.isIntersecting) {
          safePlay();
        } else if (pauseWhenOffscreen && !video.paused) {
          video.pause();
        }
      },
      { threshold: 0.05, rootMargin: "260px 0px 260px 0px" }
    );

    observer.observe(video);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible" && isIntersectingRef.current) {
        safePlay();
      }
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      const v = videoRef.current;
      if (!v) return;
      if (!controls && e.matches) {
        if (!v.paused) {
          v.pause();
        }
      } else if (
        document.visibilityState === "visible" &&
        isIntersectingRef.current
      ) {
        safePlay();
      }
    };

    // Periodic lightweight watchdog: if video is visible on screen and tab is active,
    // but browser evicted the decoder or paused it silently, resume it.
    const watchdogId = window.setInterval(() => {
      const v = videoRef.current;
      if (!v) return;
      if (errorCountRef.current >= MAX_ERROR_RETRIES) return;
      if (!controls && reducedMotionRef.current) return;
      if (
        document.visibilityState === "visible" &&
        isIntersectingRef.current &&
        (v.paused || v.ended) &&
        v.readyState >= 2
      ) {
        if (v.ended) {
          v.currentTime = 0;
        }
        safePlay();
      }
    }, 2500);

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);
    window.addEventListener("pageshow", handleVisibilityOrFocus);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    if (controls || !reducedMotionRef.current) {
      safePlay();
    }

    return () => {
      observer.disconnect();
      window.clearInterval(watchdogId);
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("pageshow", handleVisibilityOrFocus);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
    };
  }, [controls, pauseWhenOffscreen, safePlay]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      autoPlay={controls}
      loop
      muted
      playsInline
      disablePictureInPicture={!controls}
      disableRemotePlayback={!controls}
      preload={preload}
      controls={controls}
      style={
        poster
          ? {
              backgroundImage: `url('${poster}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
      onLoadedData={() => {
        errorCountRef.current = 0;
        safePlay();
      }}
      onCanPlay={safePlay}
      onEnded={() => {
        const video = videoRef.current;
        if (video) {
          video.currentTime = 0;
          safePlay();
        }
      }}
      onStalled={() => scheduleRecovery(false)}
      onError={() => scheduleRecovery(true)}
    />
  );
}
