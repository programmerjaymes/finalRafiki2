'use client';

import { FormEvent } from 'react';
import RadarScanner from '@/components/landing/RadarScanner';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import { brandColors } from '@/lib/brandColors';

type SearchNearbySearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  scanning: boolean;
};

export default function SearchNearbySearch({
  query,
  onQueryChange,
  onSearch,
  scanning,
}: SearchNearbySearchProps) {
  const locale = useLocale();
  const messages = t(locale);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section
      className="mb-6 overflow-hidden rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg"
      aria-label={messages.home.nearbySearchTitle}
    >
      <div className="grid md:grid-cols-[minmax(7rem,auto)_1fr] gap-4 md:gap-6 p-5 sm:p-6 md:p-7 items-center">
        <div className="flex flex-col items-center gap-2">
          <RadarScanner scanning={scanning} size={120} />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-center text-gray-500 dark:text-gray-400 max-w-[8rem]">
            {scanning ? messages.home.nearbyScanning : messages.home.nearbyScanIdle}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: brandColors.accent }}>
            {messages.home.finderPill}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {messages.home.nearbySearchTitle}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{messages.home.nearbySearchSubtitle}</p>

          <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
            <label className="sr-only" htmlFor="search-page-query">
              {messages.home.nearbySearchPlaceholder}
            </label>
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                id="search-page-query"
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={messages.home.nearbySearchPlaceholder}
                disabled={scanning}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8f4a54]/40 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={scanning}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-70 sm:min-w-[11rem]"
              style={{ backgroundColor: brandColors.accent }}
            >
              {scanning ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  {messages.home.nearbyScanning}
                </>
              ) : (
                messages.home.nearbySearchCta
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
