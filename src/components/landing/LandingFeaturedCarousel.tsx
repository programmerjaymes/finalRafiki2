'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import BusinessListingCard from '@/components/landing/BusinessListingCard';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import { brandColors } from '@/lib/brandColors';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

type FeaturedBusiness = Parameters<typeof BusinessListingCard>[0]['business'];

export default function LandingFeaturedCarousel() {
  const locale = useLocale();
  const messages = t(locale);
  const [businesses, setBusinesses] = useState<FeaturedBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  const descriptionFallback =
    locale === 'sw'
      ? 'Tazama taarifa, bei na mawasiliano.'
      : 'View details for hours, pricing, and contact info.';

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/featured-businesses?_=${Date.now()}`, {
          cache: 'no-store',
        });
        const json = await res.json().catch(() => null);
        if (!cancelled) {
          setBusinesses(Array.isArray(json?.businesses) ? json.businesses : []);
        }
      } catch {
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
      <section className="mb-6 md:mb-8" aria-hidden>
        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 w-[85%] sm:w-[45%] lg:w-[32%] shrink-0 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (businesses.length === 0) return null;

  return (
    <section
      className="landing-featured-carousel carouselFour relative mb-6 md:mb-8 pb-2"
      aria-label={`${messages.home.featuredTitleBefore} ${messages.home.featuredTitleHighlight}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
        <div>
          <p
            className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
            style={{ color: brandColors.accent }}
          >
            {messages.home.featuredTitleBefore}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {messages.home.featuredTitleHighlight}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
            {messages.home.featuredSubtitle}
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex shrink-0 self-start sm:self-center rounded-full px-4 py-2 text-sm font-bold text-white shadow-md transition hover:opacity-90"
          style={{ backgroundColor: brandColors.accent }}
        >
          {messages.home.featuredViewAll} →
        </Link>
      </div>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={12}
        slidesPerView={1.12}
        breakpoints={{
          480: { slidesPerView: 1.4, spaceBetween: 14 },
          640: { slidesPerView: 2.1, spaceBetween: 16 },
          1024: { slidesPerView: 3, spaceBetween: 16 },
          1536: { slidesPerView: 4, spaceBetween: 18 },
        }}
        loop={businesses.length > 3}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: '.landing-featured-prev',
          nextEl: '.landing-featured-next',
        }}
        className="!pb-10"
      >
        {businesses.map((business) => (
          <SwiperSlide key={business.id} className="!h-auto">
            <BusinessListingCard
              business={business}
              viewDetailsLabel={messages.search.viewDetails}
              unknownLocationLabel={messages.search.unknownLocation}
              descriptionFallback={descriptionFallback}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        aria-label={locale === 'sw' ? 'Iliyopita' : 'Previous'}
        className="landing-featured-prev absolute left-0 top-[calc(50%+1rem)] z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        <FiChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={locale === 'sw' ? 'Inayofuata' : 'Next'}
        className="landing-featured-next absolute right-0 top-[calc(50%+1rem)] z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        <FiChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
}
