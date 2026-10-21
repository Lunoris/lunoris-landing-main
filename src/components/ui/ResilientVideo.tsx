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

  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (pauseWhenOffscreen && !isIntersectingRef.current) return;
    if (document.visibilityState === "hidden") return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay or transient decode lock; retry gently
      });
    }
  }, [pauseWhenOffscreen]);

  const scheduleRecovery = useCallback(
    (reloadSource = false) => {
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
      }
      retryTimerRef.current = window.setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;
        if (reloadSource || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
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
      }, 650);
    },
    [safePlay]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

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

    // Periodic lightweight watchdog: if video is visible on screen and tab is active,
    // but browser evicted the decoder or paused it silently, resume it.
    const watchdogId = window.setInterval(() => {
      const v = videoRef.current;
      if (!v) return;
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

    safePlay();

    return () => {
      observer.disconnect();
      window.clearInterval(watchdogId);
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("pageshow", handleVisibilityOrFocus);
    };
  }, [pauseWhenOffscreen, safePlay]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
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
      onLoadedData={safePlay}
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
