"use client";

import React from "react";
import {
  GAME_ROADMAP,
  ROADMAP_VISUALS,
  type RoadmapMilestone,
} from "@/data/gameData";
import { DeckledCanvasFrame } from "@/components/ui/CanvasFrames";
import { useLanguage } from "@/i18n/LanguageContext";

function RoadmapMilestoneRow({
  item,
  index,
  roadmapStep,
}: {
  item: RoadmapMilestone;
  index: number;
  roadmapStep: number;
}) {
  const isLeft = index % 2 === 0;
  const isReached = index <= roadmapStep;
  const isCurrent = index === roadmapStep;
  const bgImage = ROADMAP_VISUALS[index % ROADMAP_VISUALS.length];

  return (
    <div
      className={`lunoris-timeline-row ${isLeft ? "row-left" : "row-right"} ${
        isReached ? "is-reached" : ""
      } ${isCurrent ? "is-current" : ""}`}
    >
      {/* Opposite-side Date & Phase Counterbalance */}
      <div className="lunoris-timeline-meta">
        <span className="lunoris-timeline-phase">{item.phase}</span>
        <div className="lunoris-timeline-date">{item.date}</div>
        <span className={`lunoris-roadmap-status status-${item.status}`}>
          {item.highlight}
        </span>
      </div>

      {/* Center Line Node */}
      <div className="lunoris-timeline-axis" aria-hidden="true">
        <div className={`lunoris-timeline-node status-${item.status}`}>
          <span className="lunoris-timeline-node-core" />
        </div>
      </div>

      {/* Milestone Painted Canvas Card */}
      <article className={`lunoris-timeline-card status-${item.status}`}>
        <div
          className="lunoris-timeline-card-bg"
          style={{ backgroundImage: `url('${bgImage}')` }}
          aria-hidden="true"
        />
        <div className="lunoris-canvas-weave" aria-hidden="true" />
        <div className="lunoris-timeline-card-shade" aria-hidden="true" />
        <DeckledCanvasFrame />
        <div className="lunoris-timeline-card-body">
          <div className="lunoris-timeline-card-mobile-meta">
            <span className="lunoris-roadmap-phase">{item.phase}</span>
            <span className={`lunoris-roadmap-status status-${item.status}`}>
              {item.highlight}
            </span>
          </div>
          <div className="lunoris-timeline-card-mobile-date">{item.date}</div>
          <h3 className="lunoris-roadmap-title">{item.title}</h3>
          <p className="lunoris-roadmap-desc">{item.desc}</p>
        </div>
      </article>
    </div>
  );
}

interface RoadmapSectionProps {
  roadmapTimelineRef: React.RefObject<HTMLDivElement | null>;
  roadmapStep: number;
}

export function RoadmapSection({
  roadmapTimelineRef,
  roadmapStep,
}: RoadmapSectionProps) {
  const { t } = useLanguage();

  return (
    <section id="roadmap" className="lunoris-roadmap-section">
      <div className="lunoris-wide-wrap">
        <div className="lunoris-heading-stack" data-reveal="up">
          <span className="lunoris-title-minor">{t.roadmap.minor}</span>
          <h2 className="lunoris-title-major">{t.roadmap.major}</h2>
          <div className="lunoris-center-bar" />
        </div>

        <div className="lunoris-center-timeline" ref={roadmapTimelineRef}>
          {/* Central Vertical Spine & Live Scroll Beam */}
          <div className="lunoris-timeline-spine" aria-hidden="true">
            <div className="lunoris-timeline-track" />
            <div className="lunoris-timeline-fill">
              <span className="lunoris-timeline-spark" />
            </div>
          </div>

          {GAME_ROADMAP.map((item, idx) => {
            const trItem = t.roadmap.milestones[idx];
            const localizedMilestone: RoadmapMilestone = trItem
              ? {
                  ...item,
                  phase: trItem.phase,
                  date: trItem.date,
                  title: trItem.title,
                  desc: trItem.desc,
                  highlight: trItem.highlight,
                }
              : item;

            return (
              <RoadmapMilestoneRow
                key={item.phase}
                item={localizedMilestone}
                index={idx}
                roadmapStep={roadmapStep}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
