export type Locale = "en" | "ru" | "ar" | "de" | "fr" | "es" | "zh" | "ja";

export interface LocaleOption {
  code: Locale;
  shortLabel: string;
  nativeName: string;
  englishName: string;
  dir: "ltr" | "rtl";
}

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "lunoris_lang";

export const SUPPORTED_LOCALES: readonly LocaleOption[] = [
  {
    code: "en",
    shortLabel: "EN",
    nativeName: "English",
    englishName: "English",
    dir: "ltr",
  },
  {
    code: "ru",
    shortLabel: "RU",
    nativeName: "Русский",
    englishName: "Russian",
    dir: "ltr",
  },
  {
    code: "ar",
    shortLabel: "AR",
    nativeName: "العربية",
    englishName: "Arabic",
    dir: "rtl",
  },
  {
    code: "de",
    shortLabel: "DE",
    nativeName: "Deutsch",
    englishName: "German",
    dir: "ltr",
  },
  {
    code: "fr",
    shortLabel: "FR",
    nativeName: "Français",
    englishName: "French",
    dir: "ltr",
  },
  {
    code: "es",
    shortLabel: "ES",
    nativeName: "Español",
    englishName: "Spanish",
    dir: "ltr",
  },
  {
    code: "zh",
    shortLabel: "ZH",
    nativeName: "中文",
    englishName: "Chinese",
    dir: "ltr",
  },
  {
    code: "ja",
    shortLabel: "JA",
    nativeName: "日本語",
    englishName: "Japanese",
    dir: "ltr",
  },
] as const;

export function normalizeLocale(raw?: string | null): Locale {
  if (!raw) return DEFAULT_LOCALE;
  const cleaned = raw.trim().toLowerCase().split(/[-_]/)[0];
  const found = SUPPORTED_LOCALES.find((item) => item.code === cleaned);
  return found ? found.code : DEFAULT_LOCALE;
}

export function getLocaleOption(locale: Locale): LocaleOption {
  return (
    SUPPORTED_LOCALES.find((item) => item.code === locale) ??
    SUPPORTED_LOCALES[0]
  );
}

export interface LocalizedNewsSection {
  heading: string;
  paragraphs: string[];
  quote?: string;
  imageCaption?: string;
}

export interface LocalizedNewsEntry {
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  lead: string;
  highlights: string[];
  sections: LocalizedNewsSection[];
}

export interface SiteTranslations {
  meta: {
    siteTitle: string;
    languageSelectorLabel: string;
  };
  nav: {
    latestNews: string;
    theWorld: string;
    companions: string;
    characters: string;
    team: string;
    roadmap: string;
    returnToGameWorld: string;
    allNewsBack: string;
    gameHome: string;
    returnToLeadership: string;
  };
  steamCta: {
    ariaLabel: string;
    playFreeDemo: string;
    wishlistOnSteam: string;
  };
  hero: {
    quoteLine1: string;
    quoteLine2: string;
    platformsLine: string;
    awardKicker: string;
    awardTitle: string;
    awardQuote: string;
  };
  news: {
    sectionTitle: string;
    allNewsBtn: string;
    readMore: string;
    prevAria: string;
    nextAria: string;
    emptySoon: string;
    archiveMinor: string;
    archiveMajor: string;
    archiveBody: string;
    featuredBadge: string;
    allChroniclesFilter: string;
    emptyArchive: string;
    categories: {
      All: string;
      Update: string;
      "World & Lore": string;
      Video: string;
    };
    article: {
      breadcrumbHome: string;
      breadcrumbNews: string;
      highlightsKicker: string;
      allChroniclesBtn: string;
      returnMainWorldBtn: string;
      moreDispatchesHeading: string;
    };
    articles: Record<string, LocalizedNewsEntry>;
  };
  world: {
    minor: string;
    major: string;
    body: string;
    locations: Record<
      "dream-levels" | "retro-games" | "nightmare",
      {
        title: string;
        desc: string;
      }
    >;
  };
  companions: {
    minor: string;
    major: string;
    items: Record<
      "Fareeda" | "Kurtam" | "Freddy" | "Centric",
      {
        name: string;
        title: string;
        species: string;
        desc: string;
      }
    >;
  };
  characters: {
    minor: string;
    major: string;
    body: string;
    items: Record<
      | "Lunora"
      | "Fareeda"
      | "Kurtam"
      | "Freddy"
      | "John Ford"
      | "Centric"
      | "Young Lunora"
      | "Kai"
      | "Kane"
      | "Samantha",
      {
        name: string;
        lore: string;
      }
    >;
  };
  team: {
    minor: string;
    major: string;
    intro: string;
    ctaBtn: string;
    portraitCaption: string;
    pageMinor: string;
    pageMajor: string;
    pageBodyPrefix: string;
    pageBodyGameTitle: string;
    pageBodySuffix: string;
    memberSingular: string;
    memberPlural: string;
    emptyRoster: string;
    loadingRoster: string;
    returnMainWorldBtn: string;
    departments: Record<string, string>;
  };
  roadmap: {
    minor: string;
    major: string;
    milestones: {
      phase: string;
      date: string;
      title: string;
      desc: string;
      highlight: string;
    }[];
  };
  finalCta: {
    minor: string;
    major: string;
  };
  footer: {
    legal: string;
  };
}
