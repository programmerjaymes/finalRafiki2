'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const BANNER_SLIDES = [
  {
    src: '/images/correctDimensions.png',
    altEn: 'Rafiki — Discover, connect, and grow together',
    altSw: 'Rafiki — Gundua, unganisha, kukua pamoja',
    href: '/search',
  },
  {
    src: '/images/correctDImension2.png',
    altEn: 'Rafiki — Tanzania business directory platform',
    altSw: 'Rafiki — Jukwaa la saraka ya biashara Tanzania',
    href: '/business-create',
  },
  {
    src: '/images/help.png',
    altEn: 'Rafiki support — We are ready to help you',
    altSw: 'Usaidizi wa Rafiki — Tuko tayari kukusaidia',
    href: 'mailto:programmerjames12@gmail.com',
    external: true,
  },
] as const;

const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 819;

export default function LandingPromoImages() {
  const locale = useLocale();
  const messages = t(locale);

  return (
    <section
      className="landing-promo-banner carouselFour relative w-full mb-4 md:mb-5 pb-2"
      aria-label={messages.home.carouselPromoTitle}
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        loop
        speed={700}
        autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: '.landing-promo-prev',
          nextEl: '.landing-promo-next',
        }}
        className="rounded-xl md:rounded-2xl overflow-hidden shadow-md shadow-black/10 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800"
      >
        {BANNER_SLIDES.map((slide, index) => {
          const alt = locale === 'sw' ? slide.altSw : slide.altEn;
          const image = (
            <Image
              src={slide.src}
              alt={alt}
              width={BANNER_WIDTH}
              height={BANNER_HEIGHT}
              className="w-full h-auto"
              priority={index === 0}
              sizes="100vw"
            />
          );

          return (
            <SwiperSlide key={slide.src}>
              {'external' in slide && slide.external ? (
                <a
                  href={slide.href}
                  className="block w-full transition hover:opacity-95"
                  aria-label={alt}
                >
                  {image}
                </a>
              ) : (
                <Link
                  href={slide.href}
                  className="block w-full transition hover:opacity-95"
                  aria-label={alt}
                >
                  {image}
                </Link>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

      <button
        type="button"
        aria-label={locale === 'sw' ? 'Picha iliyopita' : 'Previous banner'}
        className="landing-promo-prev absolute left-2 sm:left-3 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white"
      >
        <FiChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={locale === 'sw' ? 'Picha inayofuata' : 'Next banner'}
        className="landing-promo-next absolute right-2 sm:right-3 top-1/2 z-20 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white"
      >
        <FiChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}
