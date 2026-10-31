"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getTranslations } from "./index";
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
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync with localStorage on mount if cookie wasn't set yet
  useEffect(() => {
    try {
      const hasCookie = document.cookie
        .split(";")
        .some((c) => c.trim().startsWith(`${LOCALE_COOKIE_NAME}=`));
      if (!hasCookie) {
        const stored = window.localStorage.getItem(LOCALE_COOKIE_NAME);
        if (stored) {
          const normalized = normalizeLocale(stored);
          setLocaleState(normalized);
          persistLocale(normalized);
        }
      }
    } catch {
      // Ignore storage read restrictions
    }
  }, []);

  const option = getLocaleOption(locale);
  const t = useMemo(() => getTranslations(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = option.dir;
    if (t.meta.siteTitle && document.location.pathname === "/") {
      document.title = t.meta.siteTitle;
    }
  }, [locale, option.dir, t.meta.siteTitle]);

  const setLocale = useCallback((next: Locale) => {
    const normalized = normalizeLocale(next);
    setLocaleState(normalized);
    persistLocale(normalized);
  }, []);

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
