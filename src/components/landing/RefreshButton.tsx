'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAppCaches } from '@/lib/clearAppCaches';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

type RefreshButtonProps = {
  variant?: 'nav' | 'navSolid' | 'hero';
  onRefreshed?: () => void;
  className?: string;
};

export default function RefreshButton({
  variant = 'nav',
  onRefreshed,
  className = '',
}: RefreshButtonProps) {
  const router = useRouter();
  const locale = useLocale();
  const messages = t(locale);
  const [busy, setBusy] = useState(false);

  const handleRefresh = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await clearAppCaches();
      onRefreshed?.();
      router.refresh();
      window.location.reload();
    } finally {
      setBusy(false);
    }
  };

  const styles =
    variant === 'hero'
      ? 'border-white/25 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'
      : variant === 'navSolid'
        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        : 'border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md';

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={busy}
      title={messages.nav.refreshHint}
      aria-label={messages.nav.refresh}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all disabled:opacity-60 ${styles} ${className}`}
    >
      <svg
        className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M21 12a9 9 0 11-2.64-6.36"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M21 3v6h-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="hidden sm:inline">{busy ? messages.nav.refreshing : messages.nav.refresh}</span>
    </button>
  );
}
