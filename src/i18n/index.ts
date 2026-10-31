import { ar } from "./locales/ar";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ja } from "./locales/ja";
import { ru } from "./locales/ru";
import { zh } from "./locales/zh";
import { DEFAULT_LOCALE, type Locale, type SiteTranslations } from "./types";

export const TRANSLATIONS: Record<Locale, SiteTranslations> = {
  en,
  ru,
  ar,
  de,
  fr,
  es,
  zh,
  ja,
};

export function getTranslations(locale: Locale): SiteTranslations {
  return TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
}

export * from "./types";
export * from "./helpers";
