import { getRetroGamesPageCopy, type RetroGameShowcaseItem } from "./retroGamesData";

/**
 * Registry of the arcade cabinets on /retro-levels (John Ford's basement).
 *
 * HOW TO ADD A NEW RETRO LEVEL
 * 1. Add an entry to `RETRO_LEVELS` below (id, marquee, title, media, colours).
 *    Media can come from an existing `retroGamesData.ts` item via `fromGame()`.
 * 2. Add its text to `portalPages.retro.levels["<id>"]` in
 *    `src/i18n/locales/en.ts` (roleSuffix, overview, challenge, chapters).
 *    Other languages are optional: missing translations fall back to English.
 * 3. Done. The cabinet appears in the row and gets the next number.
 *
 * `MYSTERY_CABINETS` is decoration only: switched-off "???" cabinets after the
 * real ones. It is not a count of upcoming games and nothing about future levels
 * is shown on the page.
 */

export interface RetroLevelEntry {
  /** Stable id: used for the URL hash (#id) and the i18n `levels` key. */
  id: string;
  /** Short name on the lit cabinet marquee. */
  marquee: string;
  /** Level name (kept in English in every locale, like other level names). */
  title: string;
  /** Still image on the cabinet screen and fallback for the level screen. */
  poster: string;
  /** Optional looping clip for the level screen. */
  videoSrc?: string;
  accentColor: string;
  glowColor: string;
  /** One image per chapter; chapter text lives in the i18n `levels` entry. */
  chapterImages: string[];
  /** If true, the cabinet is powered down and taped off as under repair. */
  underRepair?: boolean;
}

export const MYSTERY_CABINETS = 2;

const games = getRetroGamesPageCopy("en").games;

function fromGame(
  id: string
): Pick<RetroLevelEntry, "poster" | "videoSrc" | "accentColor" | "glowColor" | "chapterImages"> {
  const g = games.find((item) => item.id === id) as RetroGameShowcaseItem | undefined;
  if (!g) throw new Error(`retroLevels: unknown retroGamesData id "${id}"`);
  return {
    poster: g.image,
    videoSrc: g.videoSrc,
    accentColor: g.accentColor,
    glowColor: g.glowColor,
    chapterImages: [g.chapter1Image, g.chapter2Image],
  };
}

export const RETRO_LEVELS: RetroLevelEntry[] = [
  {
    id: "car-level",
    marquee: "BABY RACE",
    title: "THE BABY RACE",
    ...fromGame("car-level"),
    // Neon pink so the two lit cabinets read as different machines.
    accentColor: "#f472b6",
    glowColor: "rgba(244, 114, 182, 0.75)",
  },
  {
    id: "falcon-hunting",
    marquee: "FALCON",
    title: "FALCON HUNTING",
    ...fromGame("falcon-hunting"),
    underRepair: true,
  },
];
