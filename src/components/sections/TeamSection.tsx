"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { TeamLeader } from "@/data/teamData";
import {
  BrushstrokeButtonBg,
  OrnamentDivider,
  TallDeckledCanvasFrame,
} from "@/components/ui/CanvasFrames";
import { TeamSocialLinks } from "@/components/ui/SocialPlatformIcon";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeLeader } from "@/i18n/helpers";

export function LeaderPortraitCard({ leader }: { leader: TeamLeader }) {
  const { locale, t } = useLanguage();
  const localized = localizeLeader(leader, locale, t);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const avatarSrc = localized.avatar || null;
  const showPhoto = Boolean(avatarSrc) && failedSrc !== avatarSrc;

  return (
    <article
      className="lunoris-leader-card"
      data-slot={localized.id}
      style={
        {
          "--leader-accent": localized.accentColor,
        } as React.CSSProperties
      }
    >
      <div className="lunoris-canvas-weave" aria-hidden="true" />
      <TallDeckledCanvasFrame />

      {/* Dedicated Profile Photo Slot */}
      <div className="lunoris-leader-portrait-slot">
        {showPhoto && avatarSrc ? (
          <img
            src={avatarSrc}
            alt={
              localized.role
                ? `${localized.name} — ${localized.role}`
                : localized.name
            }
            className="lunoris-leader-photo"
            onError={() => setFailedSrc(avatarSrc)}
          />
        ) : null}

        <div
          className={`lunoris-leader-portrait-placeholder ${
            showPhoto ? "is-hidden" : ""
          }`}
          aria-hidden={showPhoto}
        >
          <div className="lunoris-leader-halo" />
          <svg
            className="lunoris-leader-silhouette"
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="44"
              r="20"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeDasharray="4 3"
            />
            <path
              d="M24 104C27 82 41 70 60 70C79 70 93 82 96 104"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="lunoris-leader-monogram">{localized.initials}</span>
          <span className="lunoris-leader-photo-caption">
            {t.team.portraitCaption}
          </span>
        </div>
      </div>

      {localized.role ? (
        <span className="lunoris-leader-role-badge">{localized.role}</span>
      ) : null}

      <div className="lunoris-leader-body">
        {localized.department ? (
          <span className="lunoris-leader-dept">{localized.department}</span>
        ) : null}
        <h3 className="lunoris-leader-name">{localized.name}</h3>
        {localized.bio?.trim() ? (
          <p className="lunoris-leader-bio">{localized.bio}</p>
        ) : null}
        <TeamSocialLinks
          links={localized.links}
          memberName={localized.name}
          variant="leader"
        />
      </div>
    </article>
  );
}

export function TeamSection() {
  const { locale, t } = useLanguage();
  const [leaders, setLeaders] = useState<TeamLeader[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/team?lang=${encodeURIComponent(locale)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.leaders)) {
          setLeaders(data.leaders);
        }
      })
      .catch(() => {
        // Keep current API state on transient network failure
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <section id="team" className="lunoris-team-section">
      <div className="lunoris-wide-wrap">
        <div className="lunoris-heading-stack" data-reveal="up">
          <OrnamentDivider />
          <span className="lunoris-title-minor">{t.team.minor}</span>
          <h2 className="lunoris-title-major">{t.team.major}</h2>
          <div className="lunoris-center-bar" />
          <p className="lunoris-mural-body lunoris-team-intro">
            {t.team.intro}
          </p>
        </div>

        {leaders.length > 0 ? (
          <div
            className="lunoris-leaders-grid"
            data-count={leaders.length}
            data-reveal="up"
          >
            {leaders.map((leader) => (
              <LeaderPortraitCard key={leader.personId} leader={leader} />
            ))}
          </div>
        ) : (
          <p
            className="lunoris-mural-body"
            style={{
              margin: "2.5rem auto 0",
              textAlign: "center",
              opacity: 0.76,
            }}
          >
            {loaded ? t.team.emptyRoster : t.team.loadingRoster}
          </p>
        )}

        <div className="lunoris-news-bottom-bar" data-reveal="up">
          <Link
            href="/team"
            className="lunoris-all-news-btn lunoris-team-cta-btn"
          >
            <BrushstrokeButtonBg />
            <span>{t.team.ctaBtn}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
