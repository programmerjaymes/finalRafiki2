'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import { brandColors } from '@/lib/brandColors';

import 'swiper/css';
import 'swiper/css/free-mode';

type Category = {
  id: string;
  name: string;
  icon: string | null;
};

export default function LandingCategoriesCarousel() {
  const locale = useLocale();
  const messages = t(locale);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json().catch(() => []);
        if (!cancelled) {
          setCategories(Array.isArray(data) ? data.slice(0, 16) : []);
        }
      } catch {
        if (!cancelled) setCategories([]);
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
      <section className="mb-5 md:mb-7" aria-hidden>
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-800 animate-pulse mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 w-28 shrink-0 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="mb-5 md:mb-7 overflow-hidden" aria-label={messages.home.carouselCategoriesTitle}>
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <p
            className="text-[10px] sm:text-xs font-bold uppercase tracking-widest"
            style={{ color: brandColors.accent }}
          >
            {messages.home.carouselCategoriesEyebrow}
          </p>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {messages.home.carouselCategoriesTitle}
          </h2>
        </div>
        <Link
          href="/search"
          className="text-xs sm:text-sm font-semibold shrink-0 hover:underline"
          style={{ color: brandColors.accent }}
        >
          {messages.home.listingsViewMore} →
        </Link>
      </div>

      <div className="overflow-hidden -mx-0.5 px-0.5">
        <Swiper
          modules={[Autoplay, FreeMode]}
          slidesPerView="auto"
          spaceBetween={10}
          freeMode
          loop={categories.length > 4}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          className="landing-categories-carousel w-full overflow-hidden"
        >
        {categories.map((cat) => (
          <SwiperSlide key={cat.id} className="!w-[6.5rem] sm:!w-[7.5rem]">
            <Link
              href={`/search?category=${cat.id}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl text-xl sm:text-2xl transition group-hover:scale-105"
                style={{
                  background: `linear-gradient(145deg, ${brandColors.accent}22, ${brandColors.accent}08)`,
                }}
              >
                <span aria-hidden>{cat.icon || '🏢'}</span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800 dark:text-gray-200 text-center line-clamp-2 leading-tight">
                {cat.name}
              </span>
            </Link>
          </SwiperSlide>
        ))}
        </Swiper>
      </div>
    </section>
  );
}
