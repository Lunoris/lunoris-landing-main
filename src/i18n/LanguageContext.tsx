"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getTranslations, loadTranslations } from "./index";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  getLocaleOption,
  normalizeLocale,
  type Locale,
  type SiteTranslations,
} from "./types";

interface LanguageContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: SiteTranslations;
  setLocale: (next: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readPersistedClientLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  try {
    const cookiePart = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${LOCALE_COOKIE_NAME}=`));
    if (cookiePart) {
      const raw = decodeURIComponent(
        cookiePart.slice(LOCALE_COOKIE_NAME.length + 1)
      );
      return normalizeLocale(raw);
    }
    const stored = window.localStorage.getItem(LOCALE_COOKIE_NAME);
    if (stored) {
      return normalizeLocale(stored);
    }
  } catch {
    // Ignore storage access errors in restricted contexts
  }
  return null;
}

function persistLocale(nextLocale: Locale) {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(
      nextLocale
    )}; path=/; max-age=31536000; SameSite=Lax`;
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LOCALE_COOKIE_NAME, nextLocale);
    } catch {
      // Ignore storage access errors in private/restricted contexts
    }
  }
}

export function LanguageProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [bundle, setBundle] = useState<{
    locale: Locale;
    t: SiteTranslations;
  }>(() => ({
    locale: initialLocale,
    t: getTranslations(initialLocale),
  }));

  const applyLocaleAsync = useCallback((target: Locale, shouldPersist: boolean) => {
    const normalized = normalizeLocale(target);
    if (shouldPersist) {
      persistLocale(normalized);
    }
    const immediateOption = getLocaleOption(normalized);
    if (typeof document !== "undefined") {
      document.documentElement.lang = normalized;
      document.documentElement.dir = immediateOption.dir;
    }

    void loadTranslations(normalized).then((dict) => {
      setBundle({ locale: normalized, t: dict });
    });
  }, []);

  // Hydrate persisted locale from cookie / localStorage immediately on client mount
  useEffect(() => {
    const saved = readPersistedClientLocale();
    if (saved && saved !== initialLocale) {
      persistLocale(saved);
      void loadTranslations(saved).then((dict) => {
        setBundle({ locale: saved, t: dict });
      });
    }
  }, [initialLocale]);

  const { locale, t } = bundle;
  const option = getLocaleOption(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = option.dir;
    const path = document.location.pathname;
    if (path === "/" && t.meta.siteTitle) {
      document.title = t.meta.siteTitle;
    } else if (path === "/news" && t.news.archiveMajor) {
      document.title = `${t.news.archiveMajor} | Lunoris: Piece of Mind`;
    } else if (path === "/team" && t.team.pageMajor) {
      document.title = `${t.team.pageMajor} | Lunoris: Piece of Mind`;
    } else if (path === "/dream-levels") {
      document.title = `${t.world.locations["dream-levels"].title} | Lunoris: Piece of Mind`;
    } else if (path === "/retro-levels") {
      document.title = `${t.world.locations["retro-games"].title} | Lunoris: Piece of Mind`;
    } else if (path === "/nightmare") {
      document.title = `${t.world.locations.nightmare.title} | Lunoris: Piece of Mind`;
    }
  }, [locale, option.dir, t]);

  const setLocale = useCallback(
    (next: Locale) => {
      applyLocaleAsync(next, true);
    },
    [applyLocaleAsync]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: option.dir,
      t,
      setLocale,
    }),
    [locale, option.dir, t, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    const fallbackOption = getLocaleOption(DEFAULT_LOCALE);
    return {
      locale: DEFAULT_LOCALE,
      dir: fallbackOption.dir,
      t: getTranslations(DEFAULT_LOCALE),
      setLocale: () => {},
    };
  }
  return ctx;
}
