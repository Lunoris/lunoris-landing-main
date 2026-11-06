"use client";

import React, { forwardRef } from "react";

/**
 * One upright 1980s arcade cabinet in John Ford's Diriyah basement row.
 * Built with authentic architectural cabinet anatomy:
 * - Overhanging aluminum-framed backlit acrylic marquee with corner screws & graphic motifs
 * - Recessed dual stereo speaker louver panel beneath the marquee hood
 * - Deep-set CRT monitor well with molded ribbed bezel, curved phosphor glass & attract-mode overlay
 * - Angled control deck with 1P/2P start buttons, dust-washer + chrome-shaft joystick & 6 concave buttons
 * - Heavy die-cast steel double coin door with dual 25¢ amber reject lamps, coin slots, return pockets,
 *   tubular key lock, and riveted unit serial plate on the cashbox door
 * - Heavy rubber leveling feet grounded on the basement carpet
 * - Physical criss-crossed repair/hazard tape & technician service tag for out-of-order cabinets
 */

type CabinetProps = {
  number: string;
  marquee: string;
  poster?: string;
  accentColor?: string;
  glowColor?: string;
  selected?: boolean;
  mystery?: boolean;
  underRepair?: boolean;
  tapeVariant?: 1 | 2 | 3;
  nowPlayingLabel?: string;
  mysteryHint?: string;
  tabId?: string;
  panelId?: string;
  onSelect?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
};

function CabinetBody({
  marquee,
  poster,
  number,
  mystery,
  underRepair,
  tapeVariant = 1,
  selected,
}: Pick<
  CabinetProps,
  | "marquee"
  | "poster"
  | "number"
  | "mystery"
  | "underRepair"
  | "tapeVariant"
  | "selected"
>) {
  const isOff = Boolean(mystery || underRepair);
  const variantClass =
    number === "01"
      ? "is-unit-01"
      : number === "02"
        ? "is-unit-02"
        : "is-unit-mystery";

  return (
    <span
      className={`retro-arcade-cabinet-chassis ${variantClass} is-tape-${tapeVariant}`}
      aria-hidden="true"
    >
      {/* Side wooden panel wings with extruded T-molding trim */}
      <span className="retro-arcade-cabinet-wing is-left" />
      <span className="retro-arcade-cabinet-wing is-right" />

      {/* Overhanging backlit marquee hood */}
      <span className="retro-arcade-cabinet-hood">
        <span className="retro-arcade-cabinet-marquee">
          <span className="retro-arcade-cabinet-marquee-art" />
          <i className="retro-arcade-cabinet-screw is-tl" />
          <i className="retro-arcade-cabinet-screw is-tr" />
          <i className="retro-arcade-cabinet-screw is-bl" />
          <i className="retro-arcade-cabinet-screw is-br" />
          <span className="retro-arcade-cabinet-marquee-title">{marquee}</span>
          <span className="retro-arcade-cabinet-marquee-sub">
            {underRepair
              ? "UNDER REPAIR · OFF"
              : mystery
                ? "NO SIGNAL · OFF"
                : number === "01"
                  ? "HI-SPEED CHASE · 1987"
                  : "DESERT FLIGHT · 1988"}
          </span>
        </span>
      </span>

      {/* Slotted stereo speaker grille panel under the marquee */}
      <span className="retro-arcade-cabinet-speakers">
        <span className="retro-arcade-cabinet-speaker-grille" />
        <span className="retro-arcade-cabinet-speaker-badge">88-DX</span>
        <span className="retro-arcade-cabinet-speaker-grille" />
      </span>

      {/* Deep recessed CRT monitor cavity and molded ribbed bezel */}
      <span className="retro-arcade-cabinet-well">
        <span className="retro-arcade-cabinet-bezel">
          <i className="retro-arcade-cabinet-bezel-screw is-tl" />
          <i className="retro-arcade-cabinet-bezel-screw is-tr" />
          <i className="retro-arcade-cabinet-bezel-screw is-bl" />
          <i className="retro-arcade-cabinet-bezel-screw is-br" />

          <span className="retro-arcade-cabinet-screen">
            {isOff ? (
              <span className="retro-arcade-cabinet-static">
                {underRepair && poster ? (
                  <img
                    src={poster}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="retro-arcade-cabinet-ghost-poster"
                  />
                ) : null}
                <span className="retro-arcade-cabinet-off-line" />
              </span>
            ) : (
              <>
                <img src={poster} alt="" loading="lazy" decoding="async" />
                <span className="retro-arcade-cabinet-crt-hud">
                  <span>1UP {number === "01" ? "024850" : "041200"}</span>
                  <span>{selected ? "PLAYING" : "INSERT COIN"}</span>
                </span>
              </>
            )}
            <span className="retro-arcade-cabinet-glass" />
          </span>

          <span className="retro-arcade-cabinet-bezel-footer">
            <span className="retro-arcade-cabinet-bezel-spec">
              CRT-19 · 15KHZ RGB
            </span>
            <i className="retro-arcade-cabinet-power-led" />
          </span>
        </span>
      </span>

      {/* Forward-jutting angled control panel deck */}
      <span className="retro-arcade-cabinet-deck-wrap">
        <span className="retro-arcade-cabinet-deck">
          <span className="retro-arcade-cabinet-deck-starts">
            <i className="retro-arcade-cabinet-start-btn" />
            <i className="retro-arcade-cabinet-start-btn" />
          </span>

          <span className="retro-arcade-cabinet-deck-controls">
            {/* Microswitch ball-top joystick with dust washer and chrome shaft */}
            <span className="retro-arcade-cabinet-joystick">
              <i className="retro-arcade-cabinet-washer" />
              <i className="retro-arcade-cabinet-shaft" />
              <i className="retro-arcade-cabinet-ball" />
            </span>

            {/* 6-button curved arcade pushbutton cluster */}
            <span className="retro-arcade-cabinet-buttons">
              <i className="retro-arcade-cabinet-btn is-row1 is-c1" />
              <i className="retro-arcade-cabinet-btn is-row1 is-c2" />
              <i className="retro-arcade-cabinet-btn is-row1 is-c3" />
              <i className="retro-arcade-cabinet-btn is-row2 is-c1" />
              <i className="retro-arcade-cabinet-btn is-row2 is-c2" />
              <i className="retro-arcade-cabinet-btn is-row2 is-c3" />
            </span>
          </span>
        </span>
        <span className="retro-arcade-cabinet-deck-lip" />
      </span>

      {/* Lower wooden cabinet & heavy steel double coin door */}
      <span className="retro-arcade-cabinet-lower">
        <span className="retro-arcade-cabinet-coindoor">
          <i className="retro-arcade-cabinet-keylock" />

          <span className="retro-arcade-cabinet-coin-pair">
            <span className="retro-arcade-cabinet-coin-mech">
              <i className="retro-arcade-cabinet-coin-slot" />
              <span className="retro-arcade-cabinet-coin-lamp">
                <span>25¢</span>
              </span>
              <i className="retro-arcade-cabinet-coin-return" />
            </span>

            <span className="retro-arcade-cabinet-coin-mech">
              <i className="retro-arcade-cabinet-coin-slot" />
              <span className="retro-arcade-cabinet-coin-lamp">
                <span>25¢</span>
              </span>
              <i className="retro-arcade-cabinet-coin-return" />
            </span>
          </span>

          <span className="retro-arcade-cabinet-cashbox">
            <i className="retro-arcade-cabinet-cashbox-lock" />
            <span className="retro-arcade-cabinet-plate">
              UNIT {number}
            </span>
          </span>
        </span>

        <span className="retro-arcade-cabinet-kickplate" />
      </span>

      {/* Heavy rubber leveling feet */}
      <span className="retro-arcade-cabinet-feet">
        <i />
        <i />
      </span>

      {/* Physical caution / under-repair ribbons & taped service tag */}
      {isOff ? (
        <span className="retro-arcade-cabinet-repair-wrap">
          <span className="retro-arcade-cabinet-tape is-strip-a">
            <span>OUT OF ORDER · UNDER REPAIR · OUT OF ORDER</span>
          </span>
          <span className="retro-arcade-cabinet-tape is-strip-b">
            <span>
              {underRepair
                ? "SERVICE TAG #02 · DO NOT COIN"
                : "UNDER REPAIR · NO POWER · DO NOT USE"}
            </span>
          </span>
          <span className="retro-arcade-cabinet-service-note">
            <i className="retro-arcade-cabinet-note-pin" />
            <span className="retro-arcade-cabinet-note-kicker">
              {underRepair ? "SERVICE LOG #02" : "BASEMENT LOG"}
            </span>
            <strong className="retro-arcade-cabinet-note-title">
              UNDER REPAIR
            </strong>
            <span className="retro-arcade-cabinet-note-sub">
              {underRepair ? "ROM / CRT SYNC" : "OUT OF ORDER"}
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );
}

export const RetroCabinet = forwardRef<HTMLButtonElement, CabinetProps>(
  function RetroCabinet(
    {
      number,
      marquee,
      poster,
      accentColor,
      glowColor,
      selected = false,
      mystery = false,
      underRepair = false,
      tapeVariant = 1,
      nowPlayingLabel,
      mysteryHint,
      tabId,
      panelId,
      onSelect,
      onKeyDown,
    },
    ref
  ) {
    const style = {
      "--cab-accent": accentColor ?? "#64748b",
      "--cab-glow": glowColor ?? "rgba(100, 116, 139, 0.4)",
    } as React.CSSProperties;

    if (mystery || underRepair) {
      return (
        <div
          className={
            "retro-arcade-cabinet is-mystery" +
            (underRepair ? " is-under-repair" : "")
          }
          style={style}
          role="presentation"
          title={mysteryHint}
        >
          <CabinetBody
            marquee={marquee}
            poster={poster}
            number={number}
            mystery={mystery}
            underRepair={underRepair}
            tapeVariant={tapeVariant}
          />
          <span className="retro-arcade-cabinet-hint" aria-hidden="true">
            {mysteryHint}
          </span>
          <span className="retro-arcade-cabinet-floor" aria-hidden="true" />
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={tabId}
        aria-selected={selected}
        aria-controls={panelId}
        tabIndex={selected ? 0 : -1}
        aria-label={`${marquee} (${number})`}
        className={"retro-arcade-cabinet" + (selected ? " is-selected" : "")}
        style={style}
        onClick={onSelect}
        onKeyDown={onKeyDown}
      >
        {selected && nowPlayingLabel ? (
          <span className="retro-arcade-cabinet-badge" aria-hidden="true">
            <i className="retro-arcade-cabinet-badge-led" />
            <span>{nowPlayingLabel}</span>
          </span>
        ) : null}
        <CabinetBody
          marquee={marquee}
          poster={poster}
          number={number}
          selected={selected}
        />
        <span className="retro-arcade-cabinet-floor" aria-hidden="true" />
      </button>
    );
  }
);
