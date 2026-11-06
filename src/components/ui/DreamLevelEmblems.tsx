import React from "react";

/**
 * Line-art emblems for the Dream Levels route map (they replace the 01/02/03
 * numbers). Each one draws a motif from its level and takes its colour from
 * `currentColor`, so the stop's `--dl-accent` tints it.
 */

export type DreamLevelEmblemKind = "pain" | "guilt" | "breakthrough";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Pain: a surreal tree growing through a crenellated Diriyah mud-brick arch. */
function PainEmblem() {
  return (
    <>
      <path
        {...STROKE}
        d="M10 54V27l4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5 4-5 4 5v27Z"
        fill="currentColor"
        fillOpacity={0.12}
      />
      <path {...STROKE} d="M24 54V40a8 8 0 0 1 16 0v14" />
      <path {...STROKE} d="M32 54V35M32 46l-5-5M32 42l5-5" stroke="#fff" />
      <circle {...STROKE} cx="32" cy="17" r="8" fill="currentColor" fillOpacity={0.3} />
      <circle {...STROKE} cx="23" cy="21" r="5.5" fill="currentColor" fillOpacity={0.22} />
      <circle {...STROKE} cx="41" cy="21" r="5.5" fill="currentColor" fillOpacity={0.22} />
      <circle cx="32" cy="17" r="2.2" fill="#fff" />
    </>
  );
}

/** Guilt: gliding wings over a fractured floating island split by a magenta rift. */
function GuiltEmblem() {
  return (
    <>
      <path
        {...STROKE}
        d="M32 21c-6-8-15-9-22-5 8 0 15 3 22 9 7-6 14-9 22-9-7-4-16-3-22 5Z"
        fill="currentColor"
        fillOpacity={0.28}
      />
      <path
        {...STROKE}
        d="M11 33h42l-8 10-9 9-5-5-6 4-6-9Z"
        fill="currentColor"
        fillOpacity={0.14}
      />
      <path
        d="M33 33l-3.5 6 4 4-3 6"
        fill="none"
        stroke="#f0abfc"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="44" r="2" fill="currentColor" />
      <circle cx="57" cy="41" r="2.6" fill="currentColor" fillOpacity={0.7} />
    </>
  );
}

/** Breakthrough: scattered stones aligning into a stairway toward a golden star. */
function BreakthroughEmblem() {
  return (
    <>
      <rect {...STROKE} x="7" y="48" width="13" height="7" rx="2" fill="currentColor" fillOpacity={0.14} />
      <rect {...STROKE} x="17" y="39" width="13" height="7" rx="2" fill="currentColor" fillOpacity={0.2} />
      <rect {...STROKE} x="27" y="30" width="13" height="7" rx="2" fill="currentColor" fillOpacity={0.26} />
      <rect {...STROKE} x="37" y="21" width="12" height="7" rx="2" fill="currentColor" fillOpacity={0.32} />
      <path
        d="M53 4l2.4 7.1L62 13.5l-6.6 2.4L53 23l-2.4-7.1L44 13.5l6.6-2.4Z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path {...STROKE} d="M53 27v4M58 25l2 3M48 25l-2 3" strokeWidth={1.6} />
    </>
  );
}

export function DreamLevelEmblem({
  kind,
  className,
}: {
  kind: DreamLevelEmblemKind;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      {kind === "pain" ? (
        <PainEmblem />
      ) : kind === "guilt" ? (
        <GuiltEmblem />
      ) : (
        <BreakthroughEmblem />
      )}
    </svg>
  );
}
