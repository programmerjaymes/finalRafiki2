'use client';

import GridShape from '@/components/common/GridShape';
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';
import { ThemeProvider } from '@/context/ThemeContext';
import Link from 'next/link';
import React from 'react';

export default function AccountPrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full min-h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          <div className="flex w-full flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-20 xl:px-24 overflow-y-auto">
            <div className="mb-8 flex items-center justify-between lg:justify-start lg:absolute lg:top-6 lg:left-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
              >
                <span aria-hidden>←</span> Home
              </Link>
              <div className="lg:hidden">
                <ThemeTogglerTwo />
              </div>
            </div>
            <div className="mx-auto w-full max-w-lg">{children}</div>
          </div>
          <div className="lg:w-1/2 w-full min-h-[200px] bg-brand-600 dark:bg-brand-800 lg:grid items-center hidden">
            <div className="relative items-center justify-center flex z-1">
              <GridShape />
              <div className="flex flex-col items-center max-w-md px-8 py-16">
                <Link href="/" className="block mb-6">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-9 h-9 text-white"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.516 2.17a.75.75 0 00-1.032 0 11 11 0 00-6.429 9.842c.084.314.17.628.272.937A12.001 12.001 0 0012 22a12 12 0 009.715-5.082.75.75 0 00-.437-.695A54.645 54.645 0 0018 11.25c0-1.516-.175-2.99-.5-4.384.216-.618.375-1.258.475-1.911a.75.75 0 00-1.022-.82 11.999 11.999 0 00-5.505 3.09zM7.362 10.072a.75.75 0 01 1.06 0 1.5 1.5 0 002.122 0 .75.75 0 011.061 0 3 3 0 006.121-1.8.75.75 0 01-.012-.221 10.5 10.5 0 01-3.54-1.59l-.022-.011-.025-.013a11.35 11.35 0 01-2.864-2.49.75.75 0 11-1.06 1.04 9.5 9.5 0 002.17 2.37c.466.422.982.79 1.525 1.121a.75.75 0 01-.188 1.386l-.16.047c-1.621.47-2.682 1.916-2.682 3.592a.75.75 0 01-1.5 0c0-1.403.785-2.656 1.945-3.307l-.16-.047z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white text-center">Rafiki</h1>
                </Link>
                <p className="text-center text-white/90 text-sm leading-relaxed">
                  You can delete your account yourself when eligible, or ask us to delete your
                  account or specific personal data. We process requests as required by applicable
                  privacy laws and our policies.
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
