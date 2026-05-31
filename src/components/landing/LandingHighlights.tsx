'use client';

import Link from 'next/link';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

export default function LandingHighlights() {
  const locale = useLocale();
  const messages = t(locale);
  const items = [
    {
      title: messages.home.highlights.verifiedTitle,
      desc: messages.home.highlights.verifiedDesc,
      gradient: 'from-primary/15 to-primary/5',
      iconColor: 'text-primary dark:text-secondary',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M9 12.75l2 2 4-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: messages.home.highlights.fastTitle,
      desc: messages.home.highlights.fastDesc,
      gradient: 'from-secondary/20 to-secondary/5',
      iconColor: 'text-amber-700 dark:text-secondary',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 19a8 8 0 110-16 8 8 0 010 16z" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: messages.home.highlights.growTitle,
      desc: messages.home.highlights.growDesc,
      gradient: 'from-gray-200/80 to-gray-100/50 dark:from-gray-800 dark:to-gray-900',
      iconColor: 'text-primary dark:text-secondary',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M7 15l4-4 3 3 6-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-primary dark:text-secondary">
            {locale === 'sw' ? 'Kwa Nini Rafiki' : 'Why Rafiki'}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {locale === 'sw' ? 'Rahisi kutafuta, rahisi kukua' : 'Easy to discover, easy to grow'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((it) => (
            <div
              key={it.title}
              className="group relative rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${it.gradient} ${it.iconColor} mb-4`}
              >
                {it.icon}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{it.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex w-full sm:w-auto justify-center items-center rounded-2xl bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light text-white dark:text-gray-900 px-8 py-3.5 font-bold transition shadow-lg shadow-primary/20"
          >
            {messages.home.highlights.primaryCta}
          </Link>
          <Link
            href="/business-create"
            className="inline-flex w-full sm:w-auto justify-center items-center rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-8 py-3.5 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {messages.home.highlights.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
