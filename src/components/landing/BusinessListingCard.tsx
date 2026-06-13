'use client';

import Link from 'next/link';
import { FaPhone } from 'react-icons/fa';
import { brandColors } from '@/lib/brandColors';

export type BusinessCardData = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  logo: string | null;
  category: { name: string; icon?: string | null };
  region?: { name: string | null } | null;
  district?: { name: string | null } | null;
  ward?: { name: string | null } | null;
};

function logoSrc(logo: string | null) {
  if (!logo) return null;
  if (logo.startsWith('data:')) return logo;
  return `data:image/jpeg;base64,${logo}`;
}

type BusinessListingCardProps = {
  business: BusinessCardData;
  viewDetailsLabel: string;
  unknownLocationLabel: string;
  descriptionFallback?: string;
};

export default function BusinessListingCard({
  business,
  viewDetailsLabel,
  unknownLocationLabel,
  descriptionFallback = 'View details for contact info and more.',
}: BusinessListingCardProps) {
  const img = logoSrc(business.logo);
  const location =
    business.region?.name ||
    business.district?.name ||
    unknownLocationLabel;

  return (
    <Link
      href={`/businesses/${business.id}`}
      className="group block rounded-xl md:rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md md:hover:shadow-xl transition-all md:hover:-translate-y-0.5 active:scale-[0.99]"
    >
      {/* Phone: compact list row */}
      <div className="flex md:hidden items-center gap-2.5 p-2.5 min-h-[4.25rem]">
        <div
          className="h-10 w-10 shrink-0 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          style={{ background: img ? undefined : brandColors.cardHeader }}
        >
          {img ? (
            <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <span className="text-sm font-bold text-white">
              {business.name?.charAt(0)?.toUpperCase() || 'B'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
            {business.name}
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
            <span aria-hidden>{business.category?.icon || '•'}</span>{' '}
            {business.category?.name}
            {location ? ` · ${location}` : ''}
          </p>
          {business.phone && (
            <p className="text-[11px] font-semibold truncate mt-0.5" style={{ color: brandColors.accent }}>
              <FaPhone className="inline h-2.5 w-2.5 mr-0.5 -mt-px" />
              {business.phone}
            </p>
          )}
        </div>
        <span className="shrink-0 text-gray-400 text-sm pr-0.5" aria-hidden>
          →
        </span>
      </div>

      {/* Tablet / desktop: card layout */}
      <div className="hidden md:flex flex-col">
        <div className="relative h-24 lg:h-28 overflow-hidden" style={{ background: brandColors.cardHeader }}>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 80%, rgba(232, 200, 74, 0.45), transparent 50%)',
            }}
          />
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end gap-2.5">
            <div className="h-11 w-11 lg:h-12 lg:w-12 shrink-0 rounded-lg border-2 border-white/90 bg-white dark:bg-gray-800 shadow overflow-hidden flex items-center justify-center">
              {img ? (
                <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="text-base font-bold" style={{ color: brandColors.accent }}>
                  {business.name?.charAt(0)?.toUpperCase() || 'B'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-0.5">
              <h2 className="text-sm lg:text-base font-bold text-white truncate drop-shadow-sm">
                {business.name}
              </h2>
              <span className="inline-flex mt-0.5 items-center gap-1 rounded-full bg-white/20 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-white border border-white/25">
                <span aria-hidden>{business.category?.icon || '•'}</span>
                <span className="truncate max-w-[120px]">{business.category?.name}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-3 lg:p-4">
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug">
            {business.description || descriptionFallback}
          </p>

          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] lg:text-xs">
            <span className="text-gray-500 dark:text-gray-400 truncate">{location}</span>
            {business.phone ? (
              <span
                className="inline-flex items-center font-semibold shrink-0"
                style={{ color: brandColors.accent }}
              >
                <FaPhone className="mr-1 h-3 w-3" />
                <span className="truncate max-w-[90px]">{business.phone}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">
              {viewDetailsLabel}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 text-sm group-hover:text-white transition-colors [.group:hover_&]:bg-[#8f0e27]">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
