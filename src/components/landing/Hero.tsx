'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from '@/styles/colors.module.css';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

export default function Hero() {
  const locale = useLocale();
  const messages = t(locale);

  return (
    <div 
      className="relative overflow-hidden bg-gradient-to-br from-primary dark:from-primary-dark via-primary-dark dark:via-gray-900 to-gray-900 dark:to-black text-white"
      style={{ 
        background: `linear-gradient(to bottom right, #b71131, #8f0e27, #101828)`,
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'white\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute -bottom-24 -left-24 w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-primary-light/30 to-secondary/20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(183,17,49,0.3) 0%, rgba(253,208,13,0.2) 100%)',
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div 
        className="absolute -top-24 -right-24 w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-secondary/30 to-secondary-dark/30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(253,208,13,0.3) 0%, rgba(209,172,11,0.3) 100%)',
        }}
        animate={{
          y: [0, 20, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left md:w-1/2 mb-6 md:mb-0"
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {messages.home.heroTitleBefore}{' '}
              <span className={`${styles.gradientText}`}>{messages.home.heroTitleHighlight}</span>{' '}
              {messages.home.heroTitleAfter}
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg md:text-xl mb-5 text-gray-200 dark:text-gray-300 max-w-lg mx-auto md:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {messages.home.heroSubtitle}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link
                href="#search"
                className={`bg-secondary text-gray-900 dark:text-gray-900 px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-secondary-light transition duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${styles.secondaryBg}`}
              >
                {messages.home.heroPrimary}
              </Link>
              <Link
                href="/business-create"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-primary transition duration-200 transform hover:scale-[1.02]"
                style={{ borderColor: 'white' }}
              >
                {messages.home.heroSecondary}
              </Link>
            </motion.div>
            
            <motion.div 
              className="mt-5 sm:mt-6 flex items-center gap-3 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden" style={{ backgroundColor: '#d1ac0b', borderColor: 'white' }}>
                    <div className={`w-full h-full ${styles.gradientBg}`}></div>
                  </div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-200 dark:text-gray-300">
                {messages.home.heroSocialProof}
              </p>
            </motion.div>
          </motion.div>
          
          {/* Hero image/illustration */}
          <motion.div 
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="w-full max-w-sm md:max-w-md h-52 sm:h-56 md:h-64 relative bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-xl p-1 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-white/5 rounded-xl overflow-hidden border border-white/30">
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex space-x-1">
                      <div className={`w-3 h-3 rounded-full ${styles.primaryBg}`}></div>
                      <div className={`w-3 h-3 rounded-full ${styles.secondaryBg}`}></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="h-2 w-24 bg-white/30 rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-white/10 rounded-lg overflow-hidden shadow-sm">
                        <div className={`h-16 sm:h-20 ${styles.gradientBg} opacity-20`}></div>
                        <div className="p-2">
                          <div className="h-2 bg-white/40 rounded w-3/4 mb-2"></div>
                          <div className="h-2 bg-white/30 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 text-gray-50 dark:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,140.83,94.17,208.18,82.7Z" fill="currentColor"></path>
        </svg>
      </div>
    </div>
  );
}
