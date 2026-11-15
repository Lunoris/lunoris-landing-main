import { en } from "./locales/en";
import { DEFAULT_LOCALE, type Locale, type SiteTranslations } from "./types";

const loadedLocales = new Map<Locale, SiteTranslations>([[DEFAULT_LOCALE, en]]);
const inFlightLoads = new Map<Locale, Promise<SiteTranslations>>();

const LOCALE_LOADERS: Record<Exclude<Locale, "en">, () => Promise<SiteTranslations>> = {
  ru: () => import("./locales/ru").then((m) => m.ru),
  ar: () => import("./locales/ar").then((m) => m.ar),
  de: () => import("./locales/de").then((m) => m.de),
  fr: () => import("./locales/fr").then((m) => m.fr),
  es: () => import("./locales/es").then((m) => m.es),
  zh: () => import("./locales/zh").then((m) => m.zh),
  ja: () => import("./locales/ja").then((m) => m.ja),
};

/**
 * Synchronous accessor returning an already-loaded dictionary or the bundled English baseline.
 */
export function getTranslations(locale: Locale): SiteTranslations {
  return loadedLocales.get(locale) ?? en;
}

/**
 * Lazily loads a locale dictionary on demand and caches it in memory so the initial
 * client JS bundle only carries English instead of all 8 translation files.
 */
export async function loadTranslations(locale: Locale): Promise<SiteTranslations> {
  const cached = loadedLocales.get(locale);
  if (cached) return cached;

  if (locale === "en") return en;

  const existing = inFlightLoads.get(locale);
  if (existing) return existing;

  const promise = LOCALE_LOADERS[locale]()
    .then((dict) => {
      loadedLocales.set(locale, dict);
      return dict;
    })
    .catch(() => en)
    .finally(() => {
      inFlightLoads.delete(locale);
    });

  inFlightLoads.set(locale, promise);
  return promise;
}

export * from "./types";
export * from "./helpers";
