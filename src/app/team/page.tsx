"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { NavLinkItem } from "@/data/gameData";
import type {
  DepartmentSummary,
  PublicTeamMember,
  TeamLeader,
} from "@/data/teamData";
import {
  BrushstrokeButtonBg,
  DeckledCanvasFrame,
  OrnamentDivider,
} from "@/components/ui/CanvasFrames";
import { TeamSocialLinks } from "@/components/ui/SocialPlatformIcon";
import { HeaderBar } from "@/components/sections/HeaderBar";
import { FooterBar } from "@/components/sections/FooterBar";
import { LeaderPortraitCard } from "@/components/sections/TeamSection";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeDepartmentLabel } from "@/i18n/helpers";

function StudioMemberCard({ member }: { member: PublicTeamMember }) {
  const { t } = useLanguage();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const avatarSrc = member.avatar_url || null;
  const showAvatar = Boolean(avatarSrc) && failedSrc !== avatarSrc;
  const localizedDept = member.department
    ? localizeDepartmentLabel(member.department, t)
    : "";

  return (
    <article className="lunoris-roster-card">
      <div className="lunoris-canvas-weave" aria-hidden="true" />
      <DeckledCanvasFrame />

      <div className="lunoris-roster-card-inner">
        <div className="lunoris-roster-avatar-slot">
          {showAvatar && avatarSrc ? (
            <img
              src={avatarSrc}
              alt={member.name}
              className="lunoris-roster-avatar-img"
              onError={() => setFailedSrc(avatarSrc)}
            />
          ) : (
            <span className="lunoris-roster-initials">{member.initials}</span>
          )}
        </div>

        <div className="lunoris-roster-info">
          {/* Only what the member filled in: no empty department line or role */}
          {localizedDept ? (
            <div className="lunoris-roster-meta">
              <span className="lunoris-roster-dept-pill">{localizedDept}</span>
            </div>
          ) : null}
          <h3 className="lunoris-roster-name">{member.name}</h3>
          {member.title || member.role ? (
            <p className="lunoris-roster-role">{member.title || member.role}</p>
          ) : null}
        </div>
      </div>

      {member.bio?.trim() ? (
        <p className="lunoris-roster-bio">{member.bio}</p>
      ) : null}

      <TeamSocialLinks
        links={member.links}
        memberName={member.name}
        variant="roster"
      />
    </article>
  );
}

export default function LunorisTeamPage() {
  const { locale, t } = useLanguage();
  const [leaders, setLeaders] = useState<TeamLeader[]>([]);
  const [members, setMembers] = useState<PublicTeamMember[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([
    { key: "all", label: "All Departments", count: 0 },
  ]);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/team?lang=${encodeURIComponent(locale)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.leaders)) {
          setLeaders(data.leaders);
        }
        if (Array.isArray(data.members)) {
          setMembers(data.members);
        }
        if (Array.isArray(data.departments) && data.departments.length > 0) {
          setDepartments(data.departments);
        }
      })
      .catch(() => {
        // Keep current API state on network error
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  const deptGroups = departments.filter((d) => d.key !== "all" && d.count > 0);
  const visibleGroups =
    selectedDept === "all"
      ? deptGroups
      : deptGroups.filter((d) => d.key === selectedDept);

  const teamPageNav: NavLinkItem[] = [
    { href: "/#team", label: t.nav.returnToLeadership },
    { href: "/#world", label: t.nav.theWorld },
    { href: "/#companions", label: t.nav.companions },
    { href: "/#characters", label: t.nav.characters },
    { href: "/#roadmap", label: t.nav.roadmap },
  ];

  return (
    <div className="lunoris-page team-roster-page">
      <HeaderBar logoHref="/" navLinks={teamPageNav} enableFlyingCta={false} />

      <main className="news-archive-main">
        {/* Hero Header */}
        <section className="news-page-hero team-page-hero">
          <div
            className="lunoris-mural-bg"
            style={{ backgroundImage: "url('/assets/elar-hope.jpg')" }}
            aria-hidden="true"
          />
          <div className="lunoris-mural-fade-top" aria-hidden="true" />
          <div className="lunoris-mural-fade-bottom" aria-hidden="true" />

          <div className="lunoris-wide-wrap news-page-hero-inner">
            <OrnamentDivider />
            <span className="lunoris-title-minor">{t.team.pageMinor}</span>
            <h1 className="lunoris-title-major">{t.team.pageMajor}</h1>
            <p className="lunoris-mural-body" style={{ marginTop: "1rem" }}>
              {t.team.pageBodyPrefix}
              <em>{t.team.pageBodyGameTitle}</em>
              {t.team.pageBodySuffix}
            </p>

            {/* Executive Department Heads (strictly from API) */}
            {leaders.length > 0 ? (
              <div
                className="lunoris-leaders-grid team-page-leaders-grid"
                data-count={leaders.length}
              >
                {leaders.map((leader) => (
                  <LeaderPortraitCard key={leader.personId} leader={leader} />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* Full Studio Roster by Department */}
        <section className="news-archive-grid-section team-roster-section">
          <div className="lunoris-wide-wrap">
            {members.length > 0 && (
              <div className="news-filter-bar">
                {departments.map((dept) => {
                  const deptTitle = localizeDepartmentLabel(
                    dept.key === "all" ? "all" : dept.label,
                    t
                  );
                  return (
                    <button
                      key={dept.key}
                      type="button"
                      onClick={() => setSelectedDept(dept.key)}
                      className={`news-filter-pill ${
                        selectedDept === dept.key ? "is-active" : ""
                      }`}
                    >
                      {deptTitle} ({dept.count})
                    </button>
                  );
                })}
              </div>
            )}

            {members.length > 0 ? (
              <div className="lunoris-team-departments-stack">
                {visibleGroups.map((dept) => {
                  const deptMembers = members.filter(
                    (m) => (m.department_key || "studio") === dept.key
                  );
                  if (deptMembers.length === 0) return null;

                  const deptTitle = localizeDepartmentLabel(dept.label, t);

                  return (
                    <div key={dept.key} className="lunoris-dept-group">
                      <div className="lunoris-dept-header">
                        <h2 className="lunoris-dept-title">{deptTitle}</h2>
                        <span className="lunoris-dept-count">
                          {deptMembers.length}{" "}
                          {deptMembers.length === 1
                            ? t.team.memberSingular
                            : t.team.memberPlural}
                        </span>
                        <div className="lunoris-dept-line" />
                      </div>

                      <div
                        className="lunoris-roster-grid"
                        style={
                          deptMembers.length < 3
                            ? {
                                gridTemplateColumns: `repeat(${deptMembers.length}, minmax(280px, 420px))`,
                                justifyContent: "center",
                              }
                            : undefined
                        }
                      >
                        {deptMembers.map((member) => (
                          <StudioMemberCard key={member.id} member={member} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p
                className="lunoris-mural-body"
                style={{
                  margin: "0 auto",
                  textAlign: "center",
                  padding: "3.5rem 0",
                  opacity: 0.76,
                }}
              >
                {loaded ? t.team.emptyRoster : t.team.loadingRoster}
              </p>
            )}

            <div
              className="news-article-actions"
              style={{ marginTop: "4rem", justifyContent: "center" }}
            >
              <Link href="/#team" className="lunoris-all-news-btn">
                <BrushstrokeButtonBg />
                <span>{t.team.returnMainWorldBtn}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FooterBar />
    </div>
  );
}
