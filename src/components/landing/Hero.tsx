'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import RefreshButton from '@/components/landing/RefreshButton';
import { REGISTER_BUSINESS_SIGNUP_HREF } from '@/lib/registerBusiness';

const stats = [
  { value: '1,000+', key: 'businesses' as const },
  { value: '24/7', key: 'access' as const },
  { value: 'TZ', key: 'local' as const },
];

export default function Hero() {
  const locale = useLocale();
  const messages = t(locale);

  const statLabels =
    locale === 'sw'
      ? { businesses: 'Biashara', access: 'Upatikanaji', local: 'Kitaifa' }
      : { businesses: 'Businesses', access: 'Access', local: 'Tanzania' };

  return (
    <section className="relative overflow-hidden text-white pt-[7.5rem] sm:pt-32 pb-28 sm:pb-36">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8f0e27] via-primary-dark to-[#0c111d]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-secondary/25 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.55, 0.4] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-primary-light/30 blur-3xl"
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, delay: 0.5 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
                {locale === 'sw' ? 'Jukwaa la Biashara za Tanzania' : 'Tanzania Business Platform'}
              </span>
              <RefreshButton variant="hero" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold leading-[1.1] tracking-tight">
              {messages.home.heroTitleBefore}{' '}
              <span className="text-secondary">{messages.home.heroTitleHighlight}</span>{' '}
              {messages.home.heroTitleAfter}
            </h1>

            <p className="mt-5 text-base sm:text-lg text-white/80 max-w-lg leading-relaxed">
              {messages.home.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="#search"
                className="inline-flex justify-center items-center rounded-2xl bg-secondary text-gray-900 px-7 py-3.5 font-bold hover:bg-secondary-light transition shadow-lg shadow-black/20"
              >
                {messages.home.heroPrimary}
              </Link>
              <Link
                href={REGISTER_BUSINESS_SIGNUP_HREF}
                className="inline-flex justify-center items-center rounded-2xl border-2 border-white/50 px-7 py-3.5 font-bold hover:bg-white/10 transition"
              >
                {messages.home.heroSecondary}
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/70">{messages.home.heroSocialProof}</p>

            <dl className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              {stats.map((s) => (
                <div
                  key={s.key}
                  className="rounded-2xl bg-white/10 border border-white/15 px-3 py-3 text-center backdrop-blur-sm"
                >
                  <dt className="text-lg sm:text-xl font-bold text-secondary">{s.value}</dt>
                  <dd className="text-[10px] sm:text-xs font-medium text-white/70 uppercase tracking-wide mt-0.5">
                    {statLabels[s.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            className="relative hidden sm:block"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-secondary/40 to-primary/30 blur-2xl opacity-60" />
              <div className="relative rounded-[1.75rem] border border-white/20 bg-white/10 backdrop-blur-xl p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary/90" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
                  <span className="ml-auto h-2 flex-1 max-w-[40%] rounded-full bg-white/20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border border-white/10 bg-white/5"
                    >
                      <div
                        className="h-20 bg-gradient-to-br from-primary/50 to-secondary/30"
                        style={{ opacity: 0.5 + i * 0.1 }}
                      />
                      <div className="p-3 space-y-2">
                        <div className="h-2 rounded bg-white/30 w-4/5" />
                        <div className="h-2 rounded bg-white/20 w-3/5" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 border border-white/10">
                  <span className="text-xs font-medium text-white/80">
                    {locale === 'sw' ? 'Tafuta karibu nawe' : 'Search near you'}
                  </span>
                  <span className="text-xs font-bold text-secondary">→</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 text-[#faf8f6] dark:text-gray-950 leading-none">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-12 sm:h-16">
          <path
            d="M0,40 C300,90 600,0 900,50 C1050,75 1150,60 1200,45 L1200,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
