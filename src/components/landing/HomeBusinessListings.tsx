'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BusinessListingCard from '@/components/landing/BusinessListingCard';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import { brandColors } from '@/lib/brandColors';

const HOME_LIMIT = 12;

export default function HomeBusinessListings() {
  const locale = useLocale();
  const messages = t(locale);
  const [businesses, setBusinesses] = useState<Parameters<typeof BusinessListingCard>[0]['business'][]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const shimmerCards = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/businesses?page=1&limit=${HOME_LIMIT}&lean=true&_=${Date.now()}`,
          { cache: 'no-store' },
        );
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error('Failed to load businesses');
        if (!cancelled) {
          setBusinesses(Array.isArray(json?.businesses) ? json.businesses : []);
          setTotal(json?.pagination?.total ?? 0);
        }
      } catch (err) {
        console.error('Error loading home businesses:', err);
        if (!cancelled) {
          setBusinesses([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const descriptionFallback =
    locale === 'sw'
      ? 'Tazama taarifa, bei na mawasiliano.'
      : 'View details for hours, pricing, and contact info.';

  return (
    <section className="pb-10 w-full" aria-label={messages.home.listingsTitle}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 md:mb-5">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {messages.home.listingsTitle}
          </h1>
          {!loading && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {total > 0
                ? `${total.toLocaleString()} ${total === 1 ? messages.search.result : messages.search.results}`
                : messages.home.listingsEmptyHint}
            </p>
          )}
        </div>
        <Link
          href="/search"
          className="inline-flex shrink-0 items-center justify-center self-start sm:self-center rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
          style={{ backgroundColor: brandColors.accent }}
        >
          {messages.home.listingsViewMore} →
        </Link>
      </div>

      {loading ? (
        <div className="grid w-full grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
          {shimmerCards.map((i) => (
            <div
              key={i}
              className="rounded-xl md:rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden animate-pulse"
            >
              <div className="h-44 sm:h-52 md:h-56 bg-gray-100 dark:bg-gray-800" />
              <div className="hidden md:block p-4 space-y-3">
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 p-10 text-center">
          <p className="text-gray-600 dark:text-gray-300">{messages.home.featuredEmpty}</p>
          <Link
            href="/search"
            className="mt-5 inline-flex rounded-xl text-white px-6 py-3 font-semibold"
            style={{ backgroundColor: brandColors.accent }}
          >
            {messages.home.featuredBrowseAll}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid w-full grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
            {businesses.map((business) => (
              <BusinessListingCard
                key={business.id}
                business={business}
                viewDetailsLabel={messages.search.viewDetails}
                unknownLocationLabel={messages.search.unknownLocation}
                descriptionFallback={descriptionFallback}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-2xl text-white px-8 py-3.5 font-bold shadow-lg transition hover:opacity-90"
              style={{ backgroundColor: brandColors.accent }}
            >
              {messages.home.listingsViewMore}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
