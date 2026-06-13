'use client';

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import HomeBusinessListings from '@/components/landing/HomeBusinessListings';
import LandingPromoImages from '@/components/landing/LandingPromoImages';
import LandingCategoriesCarousel from '@/components/landing/LandingCategoriesCarousel';
import LandingFeaturedCarousel from '@/components/landing/LandingFeaturedCarousel';
import { useLocale } from '@/lib/useLocale';
import { brandColors } from '@/lib/brandColors';

export default function Home() {
  const locale = useLocale();
  const downloadLabel =
    locale === 'sw' ? 'Pakua Programu Ya Simu' : 'Download Our App';

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f3] dark:bg-gray-950">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-50 dark:opacity-30"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 40% at 50% 0%, rgba(143, 14, 39, 0.07), transparent),
            radial-gradient(ellipse 40% 30% at 100% 20%, rgba(201, 162, 39, 0.04), transparent)
          `,
        }}
      />

      <Navbar />

      <main className="flex-grow w-full pt-[4.25rem] sm:pt-[4.75rem] pb-8">
        <div className="w-full max-w-[100vw] px-3 sm:px-4 md:px-5 lg:px-6">
          <LandingPromoImages />
          <LandingCategoriesCarousel />
          <LandingFeaturedCarousel />
          <HomeBusinessListings />
        </div>
      </main>

      <a
        href="/downloads/rafiki-app-release.apk"
        download
        className="fixed bottom-5 right-4 sm:right-6 z-[70] inline-flex items-center gap-2 rounded-2xl text-white px-4 py-3 sm:px-5 sm:py-3.5 text-sm font-semibold shadow-xl hover:scale-[1.02] hover:opacity-90 transition-transform"
        style={{ backgroundColor: brandColors.accent }}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M8 11l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {downloadLabel}
      </a>

      <Footer />
    </div>
  );
}
