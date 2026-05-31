'use client';

import { useState } from 'react';
import BusinessSearch from '@/components/landing/BusinessSearch';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

export default function CompactHomeSearch() {
  const locale = useLocale();
  const messages = t(locale);
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3.5 shadow-sm hover:shadow-md transition text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
              {messages.home.searchToggle}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
              {messages.home.searchCardDesc}
            </span>
          </span>
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          id="search"
          className="mt-3 rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-lg"
        >
          <BusinessSearch />
        </div>
      )}
    </div>
  );
}
