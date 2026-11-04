"use client";

import React from "react";
import { MagneticLetters } from "@/components/ui/MagneticLetters";
import { ResilientVideo } from "@/components/ui/ResilientVideo";
import type { RetroLevelEntry } from "@/data/retroLevels";
import type { RetroLevelText } from "@/i18n/types";

/**
 * "Attract mode" screen for the selected cabinet: the level clip (or poster) in a
 * CRT frame, its pitch and challenge, then one card per chapter.
 */
export function RetroLevelPanel({
  level,
  text,
  number,
  cabinetLabel,
  challengeLabel,
  panelId,
  tabId,
}: {
  level: RetroLevelEntry;
  text: RetroLevelText;
  number: string;
  cabinetLabel: string;
  challengeLabel: string;
  panelId: string;
  tabId: string;
}) {
  return (
    <section
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      className="retro-arcade-panel"
      style={
        {
          "--cab-accent": level.accentColor,
          "--cab-glow": level.glowColor,
        } as React.CSSProperties
      }
    >
      {/* key: remount on level change so the content fades in fresh */}
      <div key={level.id} className="retro-arcade-panel-inner">
        <div className="retro-arcade-panel-main">
          <div className="retro-arcade-panel-crt">
            {level.videoSrc ? (
              <ResilientVideo
                className="retro-arcade-panel-media"
                src={level.videoSrc}
                poster={level.poster}
                preload="metadata"
              />
            ) : (
              <img
                src={level.poster}
                alt={`${level.title} — ${text.roleSuffix}`}
                className="retro-arcade-panel-media"
              />
            )}
          </div>

          <div className="retro-arcade-panel-copy">
            <span className="retro-arcade-panel-kicker">
              {cabinetLabel} {number}
            </span>
            <h2 className="retro-arcade-panel-title">
              <MagneticLetters text={level.title} glowColor={level.glowColor} intensity={1.08} />
            </h2>
            <p className="retro-arcade-panel-role">{text.roleSuffix}</p>
            <p className="retro-arcade-panel-overview">{text.overview}</p>
            <div className="retro-arcade-panel-challenge">
              <span>{challengeLabel}</span>
              <p>{text.challenge}</p>
            </div>
          </div>
        </div>

        {text.chapters.length > 0 ? (
          <div className="retro-arcade-panel-chapters">
            {text.chapters.map((chapter, i) => (
              <article key={chapter.title} className="retro-arcade-chapter">
                {level.chapterImages[i] ? (
                  <img
                    src={level.chapterImages[i]}
                    alt={chapter.title}
                    className="retro-arcade-chapter-img"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <div className="retro-arcade-chapter-copy">
                  <span className="retro-arcade-chapter-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="retro-arcade-chapter-title">{chapter.title}</h3>
                  <ul className="retro-arcade-chapter-list">
                    {chapter.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
