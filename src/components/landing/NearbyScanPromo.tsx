'use client';

import Link from 'next/link';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import { brandColors } from '@/lib/brandColors';

export default function NearbyScanPromo() {
  const locale = useLocale();
  const messages = t(locale);

  return (
    <Link
      href="/nearby"
      className="group block mb-6 overflow-hidden rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-gradient-to-br from-white to-[#f0f4ff] dark:from-gray-900 dark:to-[#0f1629] shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div
          className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${brandColors.accent}, #6b0b1f)` }}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-[#8f0e27] dark:group-hover:text-[#fdd00d] transition-colors">
            {messages.nearby.scanPromoTitle}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {messages.nearby.scanPromoSubtitle}
          </p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-gray-400 group-hover:translate-x-0.5 transition-transform"
          style={{ color: brandColors.accent }}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
