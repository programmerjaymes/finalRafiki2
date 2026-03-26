'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n';

export const LOCALE_COOKIE = 'rafiki_locale';
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

function readCookieLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  const m = document.cookie.match(/(?:^|;\s*)rafiki_locale=(en|sw)(?:;|$)/i);
  if (!m) return 'en';
  return m[1].toLowerCase() === 'sw' ? 'sw' : 'en';
}

function writeCookieLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE_SEC};SameSite=Lax`;
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(readCookieLocale());
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      writeCookieLocale(next);
      setLocaleState(next);
      router.refresh();
    },
    [router]
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx.locale;
}

export function useSetLocale(): LocaleContextValue['setLocale'] {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useSetLocale must be used within LocaleProvider');
  }
  return ctx.setLocale;
}
