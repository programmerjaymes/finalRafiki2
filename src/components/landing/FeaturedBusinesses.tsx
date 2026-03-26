'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FaPhone } from 'react-icons/fa';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

type FeaturedBusiness = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  logo: string | null;
  category: { name: string; icon: string | null };
  region: { name: string | null } | null;
};

export default function FeaturedBusinesses() {
  const locale = useLocale();
  const messages = t(locale);
  const [businesses, setBusinesses] = useState<FeaturedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const shimmerCards = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/featured-businesses');
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error((json && json.error) || 'Failed to load featured businesses');
        if (!cancelled) setBusinesses(Array.isArray(json?.businesses) ? json.businesses : []);
      } catch (err) {
        console.error('Error fetching featured businesses:', err);
        if (!cancelled) setBusinesses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shimmerCards.map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
              >
                <div className="p-5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1">
                      <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                  <div className="mt-4 h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="mt-5 flex items-center justify-between">
                    <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(businesses) || businesses.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {messages.home.featuredTitleBefore}{' '}
            <span className="text-primary dark:text-secondary">{messages.home.featuredTitleHighlight}</span>
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            {messages.home.featuredEmpty}
          </p>
          <div className="mt-7">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light text-white dark:text-gray-900 px-6 py-3 font-semibold transition shadow-md hover:shadow-lg"
            >
              {messages.home.featuredBrowseAll}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {messages.home.featuredTitleBefore}{' '}
            <span className="text-primary dark:text-secondary">{messages.home.featuredTitleHighlight}</span>
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {messages.home.featuredSubtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => {
            const logoSrc =
              business.logo && business.logo.startsWith('data:')
                ? business.logo
                : business.logo
                  ? `data:image/jpeg;base64,${business.logo}`
                  : null;

            return (
              <Link
                key={business.id}
                href={`/businesses/${business.id}`}
                className="group block rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={business.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-200 font-bold">
                          {business.name?.charAt(0)?.toUpperCase() || 'B'}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                          {business.name}
                        </h3>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
                          <span aria-hidden>{business.category?.icon || '•'}</span>
                          <span className="truncate max-w-[120px]">{business.category?.name || 'Category'}</span>
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {business.description || 'Quality service provider — view details for hours, pricing, and more.'}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {business.region?.name || 'Unknown location'}
                        </span>

                        {business.phone ? (
                          <span className="inline-flex items-center text-xs font-medium text-primary dark:text-secondary">
                            <FaPhone className="mr-1.5 text-[11px]" />
                            <span className="truncate max-w-[140px]">{business.phone}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">No phone listed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-px bg-gray-100 dark:bg-gray-800" />
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                      View details
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light text-white dark:text-gray-900 px-8 py-3 font-semibold transition shadow-md hover:shadow-lg"
          >
            {messages.home.featuredViewAll}
          </Link>
        </div>
      </div>
    </section>
  );
}
