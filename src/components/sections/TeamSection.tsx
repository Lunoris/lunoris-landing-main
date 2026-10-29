"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TEAM_LEADERS, type TeamLeader } from "@/data/teamData";
import {
  BrushstrokeButtonBg,
  OrnamentDivider,
  TallDeckledCanvasFrame,
} from "@/components/ui/CanvasFrames";

export function LeaderPortraitCard({ leader }: { leader: TeamLeader }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const avatarSrc = leader.avatar || null;
  const showPhoto = Boolean(avatarSrc) && failedSrc !== avatarSrc;

  return (
    <article
      className="lunoris-leader-card"
      data-slot={leader.id}
      style={
        {
          "--leader-accent": leader.accentColor,
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
            alt={`${leader.name} — ${leader.role}`}
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
          <span className="lunoris-leader-monogram">{leader.initials}</span>
          <span className="lunoris-leader-photo-caption">Profile Portrait</span>
        </div>

      </div>
      <span className="lunoris-leader-role-badge">{leader.role}</span>

      <div className="lunoris-leader-body">
        <span className="lunoris-leader-dept">{leader.department}</span>
        <h3 className="lunoris-leader-name">{leader.name}</h3>
        <p className="lunoris-leader-bio">{leader.bio}</p>
      </div>
    </article>
  );
}

export function TeamSection() {
  const [leaders, setLeaders] = useState<TeamLeader[]>(TEAM_LEADERS);

  useEffect(() => {
    let active = true;
    fetch("/api/team", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && Array.isArray(data.leaders)) {
          setLeaders(data.leaders);
        }
      })
      .catch(() => {
        // Fallback to default TEAM_LEADERS
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="team" className="lunoris-team-section">
      <div className="lunoris-wide-wrap">
        <div className="lunoris-heading-stack" data-reveal="up">
          <OrnamentDivider />
          <span className="lunoris-title-minor">
            The Architects Behind the Dream
          </span>
          <h2 className="lunoris-title-major">Lunoris Team</h2>
          <div className="lunoris-center-bar" />
          <p className="lunoris-mural-body lunoris-team-intro">
            Guided by three department heads and brought to life by our
            international collective of developers, artists, composers, and
            storytellers.
          </p>
        </div>

        <div className="lunoris-leaders-grid" data-reveal="up">
          {leaders.map((leader) => (
            <LeaderPortraitCard key={leader.id} leader={leader} />
          ))}
        </div>

        <div className="lunoris-news-bottom-bar" data-reveal="up">
          <Link
            href="/team"
            className="lunoris-all-news-btn lunoris-team-cta-btn"
          >
            <BrushstrokeButtonBg />
            <span>Meet the Full Studio</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
