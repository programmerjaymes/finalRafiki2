'use client';

import Link from 'next/link';

const items = [
  {
    title: 'Verified listings',
    desc: 'Browse trusted businesses with clear details.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M9 12.75l2 2 4-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 21a9 9 0 100-18 9 9 0 000 18z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    title: 'Fast search',
    desc: 'Find services by category and location.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M21 21l-4.3-4.3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M11 19a8 8 0 110-16 8 8 0 010 16z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    title: 'Grow your business',
    desc: 'Register and get discovered by customers.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 19V5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 19h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
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

export default function LandingHighlights() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center">
                  {it.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{it.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{it.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light text-white dark:text-gray-900 px-6 py-3 font-semibold transition shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Start searching
          </Link>
          <Link
            href="/business-create"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-6 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition w-full sm:w-auto"
          >
            Register a business
          </Link>
        </div>
      </div>
    </section>
  );
}

