import React from "react";

export function CanvasStar({
  className,
  color = "#fbbf24",
}: {
  className: string;
  color?: string;
}) {
  return (
    <svg
      className={`canvas-fixed-star ${className}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 2 L14.8 9.2 L22 12 L14.8 14.8 L12 22 L9.2 14.8 L2 12 L9.2 9.2 Z"
        fill={color}
      />
    </svg>
  );
}

export function SteamLogoSvg({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}

export function LaurelBranchSvg({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className={`lunoris-laurel-icon${flip ? " lunoris-laurel-flip" : ""}`}
      viewBox="0 0 64 120"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M54 110C28 96 14 68 18 28C20 14 28 6 36 4C26 16 24 38 30 62C36 82 46 98 58 106"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M22 24C12 22 8 14 12 8C18 12 22 18 22 24ZM20 44C8 40 6 30 10 24C18 28 20 36 20 44ZM24 66C12 62 8 50 14 44C22 50 24 58 24 66ZM32 86C20 84 14 74 20 66C28 72 32 80 32 86Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function OrnamentDivider() {
  return (
    <div className="lunoris-ornament-divider" aria-hidden="true">
      <span className="ornament-line ornament-line-left" />
      <span className="ornament-diamond ornament-diamond-sm" />
      <span className="ornament-diamond ornament-diamond-lg">
        <span className="ornament-diamond-core" />
      </span>
      <span className="ornament-diamond ornament-diamond-sm" />
      <span className="ornament-line ornament-line-right" />
    </div>
  );
}

export function BrushstrokeButtonBg() {
  const rawId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const crescentFillId = `crescentFill-${rawId}`;
  const crescentRimId = `crescentRim-${rawId}`;
  const crescentGlowId = `crescentGlow-${rawId}`;

  return (
    <i className="canvas-brush-btn-bg" aria-hidden="true">
      <i className="canvas-brush-pill">
        <svg
          className="canvas-brush-crescent-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMinYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Crescent moon translucent lavender-purple fill */}
            <linearGradient
              id={crescentFillId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f3e8ff" stopOpacity="0.42" />
              <stop offset="50%" stopColor="#d8b4fe" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
            </linearGradient>

            {/* Crescent moon bright glowing rim */}
            <linearGradient
              id={crescentRimId}
              x1="0%"
              y1="0%"
              x2="50%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#faf5ff" />
              <stop offset="50%" stopColor="#e9d5ff" />
              <stop offset="100%" stopColor="#d8b4fe" />
            </linearGradient>

            <filter
              id={crescentGlowId}
              filterUnits="userSpaceOnUse"
              x="-32"
              y="-20"
              width="104"
              height="140"
            >
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glowing Crescent Moon hugging the left semicircle of the pill */}
          <path
            d="M 50 0 A 62 50 0 0 0 50 100 A 50 50 0 0 1 50 0 Z"
            fill={`url(#${crescentFillId})`}
            stroke={`url(#${crescentRimId})`}
            strokeWidth="2.2"
            strokeLinejoin="round"
            filter={`url(#${crescentGlowId})`}
          />
        </svg>
      </i>
    </i>
  );
}

export function AwardBrushWash() {
  return (
    <>
      <svg
        className="canvas-square-frame-svg"
        viewBox="0 0 800 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Outer crisp square/rectangular gilded frame matching site cards */}
        <rect
          x="6"
          y="6"
          width="788"
          height="168"
          fill="none"
          stroke="rgba(251, 191, 36, 0.72)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner gallery mat line */}
        <rect
          x="14"
          y="14"
          width="772"
          height="152"
          fill="none"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* Four square corner ornamental L-brackets */}
        <path
          d="M6,34 L6,6 L34,6 M766,6 L794,6 L794,34 M794,146 L794,174 L766,174 M34,174 L6,174 L6,146"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="square"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-sq-tl" />
      <CanvasStar className="star-sq-tr" />
      <CanvasStar className="star-sq-br" />
      <CanvasStar className="star-sq-bl" />
    </>
  );
}

export function ArchedCanvasFrame({
  strokeColor = "rgba(251, 191, 36, 0.85)",
  accentColor = "#fbbf24",
}: {
  strokeColor?: string;
  accentColor?: string;
}) {
  return (
    <>
      <svg
        className="canvas-arched-frame-svg"
        viewBox="0 0 400 520"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* All three paths trace the card's own outline (.lunoris-media-tile border-radius in globals.css),
            so the neon runs along the container edge. Change both together. */}
        {/* Constant pulsing neon portal halo along the arched perimeter */}
        <path
          className="portal-arch-neon-halo"
          d="M1.5,197.6 A198.5,196.1 0 0 1 200,1.5 A198.5,196.1 0 0 1 398.5,197.6 L398.5,491.4 A22.5,27.1 0 0 1 376,518.5 L24,518.5 A22.5,27.1 0 0 1 1.5,491.4 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth="5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Subtle continuous base track along outer arch */}
        <path
          d="M1.5,197.6 A198.5,196.1 0 0 1 200,1.5 A198.5,196.1 0 0 1 398.5,197.6 L398.5,491.4 A22.5,27.1 0 0 1 376,518.5 L24,518.5 A22.5,27.1 0 0 1 1.5,491.4 Z"
          fill="none"
          stroke={strokeColor}
          strokeOpacity="0.28"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
        {/* Outer animated glowing dashed segments flowing around the card contour */}
        <path
          className="portal-arch-flow-outer"
          d="M1.5,197.6 A198.5,196.1 0 0 1 200,1.5 A198.5,196.1 0 0 1 398.5,197.6 L398.5,491.4 A22.5,27.1 0 0 1 376,518.5 L24,518.5 A22.5,27.1 0 0 1 1.5,491.4 Z"
          pathLength="1000"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="65 22 110 26 42 18 95 22"
          vectorEffect="non-scaling-stroke"
        />
        {/* Bottom corner painterly flourishes */}
        <path
          d="M1.5,440 L1.5,491.4 A22.5,27.1 0 0 0 24,518.5 L70,518.5 M398.5,440 L398.5,491.4 A22.5,27.1 0 0 1 376,518.5 L330,518.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-arch-crown" color={accentColor} />
    </>
  );
}

export function DeckledCanvasFrame() {
  return (
    <>
      <svg
        className="canvas-deckled-frame-svg"
        viewBox="0 0 500 340"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Organic brushstroke perimeter */}
        <path
          d="M36,12 C164,6 348,8 472,16 C486,18 492,30 490,54 C494,138 491,226 486,304 C484,322 470,329 446,328 C312,333 168,331 28,324 C14,322 8,310 10,286 C6,196 9,104 14,34 C16,18 24,13 36,12 Z"
          fill="none"
          stroke="rgba(251, 191, 36, 0.52)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="210 10 130 8 190 12"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner sketchy artist pencil/chalk guide line */}
        <path
          d="M42,22 C178,17 340,18 464,25 C476,26 480,36 479,58 C481,142 479,224 475,296 C473,310 462,317 440,317 C308,321 170,319 36,314 C24,312 19,302 20,280 C18,194 20,108 24,42 C25,28 32,23 42,22 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-card-tl" />
      <CanvasStar className="star-card-br" />
    </>
  );
}

export function TallDeckledCanvasFrame() {
  return (
    <>
      <svg
        className="canvas-deckled-frame-svg"
        viewBox="0 0 500 620"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M36,14 C164,6 348,8 472,18 C486,20 492,34 490,62 C494,230 491,410 486,574 C484,598 470,608 446,606 C312,612 168,610 28,602 C14,598 8,584 10,554 C6,386 9,204 14,44 C16,22 24,15 36,14 Z"
          fill="none"
          stroke="rgba(251, 191, 36, 0.52)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="240 10 150 8 210 12"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M42,24 C178,18 340,20 464,28 C476,30 480,42 479,68 C481,234 479,408 475,564 C473,584 462,594 440,594 C308,598 170,596 36,590 C24,588 19,574 20,546 C18,384 20,208 24,52 C25,34 32,26 42,24 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-card-tl" />
      <CanvasStar className="star-card-br" />
    </>
  );
}

export function SquareCompanionFrame() {
  return (
    <>
      <svg
        className="canvas-square-frame-svg"
        viewBox="0 0 400 640"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Outer crisp square/rectangular gilded frame */}
        <rect
          x="10"
          y="10"
          width="380"
          height="620"
          fill="none"
          stroke="rgba(251, 191, 36, 0.72)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inner gallery mat line */}
        <rect
          x="20"
          y="20"
          width="360"
          height="600"
          fill="none"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* Four square corner ornamental L-brackets */}
        <path
          d="M10,42 L10,10 L42,10 M358,10 L390,10 L390,42 M390,598 L390,630 L358,630 M42,630 L10,630 L10,598"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="3.2"
          strokeLinecap="square"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <CanvasStar className="star-sq-tl" />
      <CanvasStar className="star-sq-tr" />
      <CanvasStar className="star-sq-br" />
      <CanvasStar className="star-sq-bl" />
    </>
  );
}
