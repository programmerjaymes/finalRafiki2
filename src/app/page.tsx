'use client';

import Hero from '@/components/landing/Hero';
import BusinessSearch from '@/components/landing/BusinessSearch';
import FeaturedBusinesses from '@/components/landing/FeaturedBusinesses';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import LandingHighlights from '@/components/landing/LandingHighlights';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

export default function Home() {
  const locale = useLocale();
  const messages = t(locale);
  const downloadLabel =
    locale === 'sw' ? 'Pakua Programu Ya simu' : 'Download Our Application';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="pt-24 sm:pt-28 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-secondary">
                {locale === 'sw' ? 'Biashara Zilizopendekezwa' : 'Featured Businesses'}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {locale === 'sw'
                  ? 'Machaguo maarufu kwa sasa - orodha zilizothibitishwa zenye ufuatiliaji mkubwa.'
                  : 'Popular picks right now — verified listings with the most interest.'}
              </p>
            </div>
          </div>
        </section>

        <div className="pb-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <FeaturedBusinesses showHeader={false} />
        </div>

        <section id="search" className="pt-6 sm:pt-8 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900/90 backdrop-blur-xl shadow-lg p-4 sm:p-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug">
                  {messages.home.searchCardTitle}
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-snug">
                  {messages.home.searchCardDesc}
                </p>
              </div>
              <div className="mt-3 sm:mt-4">
                <BusinessSearch />
              </div>
            </div>
          </div>
        </section>
        <Hero />

        <LandingHighlights />

        {/* CTA Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl text-white shadow-xl border border-white/10 bg-gradient-to-br from-primary via-primary-dark to-gray-900 dark:from-gray-900 dark:via-black dark:to-black">
              {/* subtle pattern */}
              <div
                className="absolute inset-0 opacity-[0.18] pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 20%, rgba(253,208,13,0.55), transparent 45%), radial-gradient(circle at 80% 30%, rgba(183,17,49,0.55), transparent 40%), radial-gradient(circle at 40% 90%, rgba(59,130,246,0.35), transparent 50%)',
                }}
              />
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.18]" />

              <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="text-center lg:text-left">
                  <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
                    {messages.home.ctaPill}
                  </span>
                  <h2 className="mt-3 text-2xl sm:text-3xl font-bold">
                    {messages.home.ctaTitle}
                  </h2>
                  <p className="mt-2 text-white/85 max-w-2xl">
                    {messages.home.ctaDesc}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                  <a
                    href="/search"
                    className="bg-secondary text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-secondary-light transition-colors shadow-md hover:shadow-lg"
                  >
                    {messages.home.ctaPrimary}
                  </a>
                  <a
                    href="/business-create"
                    className="bg-white/10 border border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/15 transition-colors backdrop-blur"
                  >
                    {messages.home.ctaSecondary}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <a
        href="/downloads/rafiki-app-release.apk"
        download
        className="fixed bottom-6 right-4 sm:right-6 z-[70] inline-flex items-center gap-2 rounded-full bg-primary text-white px-5 py-3 font-semibold shadow-xl hover:bg-primary-dark transition-all duration-300 animate-pulse hover:animate-none"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {downloadLabel}
      </a>
      <Footer />
    </div>
  );
}
