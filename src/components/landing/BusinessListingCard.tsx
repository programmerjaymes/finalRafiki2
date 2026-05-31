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
    [business.ward?.name, business.district?.name, business.region?.name]
      .filter(Boolean)
      .join(', ') ||
    business.region?.name ||
    unknownLocationLabel;

  return (
    <Link
      href={`/businesses/${business.id}`}
      className="group flex flex-col rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative h-28 sm:h-32 overflow-hidden" style={{ background: brandColors.cardHeader }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 80%, rgba(232, 200, 74, 0.45), transparent 50%)',
          }}
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
          <div className="h-14 w-14 shrink-0 rounded-xl border-2 border-white/90 bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex items-center justify-center">
            {img ? (
              <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <span className="text-lg font-bold" style={{ color: brandColors.accent }}>
                {business.name?.charAt(0)?.toUpperCase() || 'B'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 pb-0.5">
            <h2 className="text-base font-bold text-white truncate drop-shadow-sm">{business.name}</h2>
            <span className="inline-flex mt-1 items-center gap-1 rounded-full bg-white/20 backdrop-blur px-2 py-0.5 text-[11px] font-medium text-white border border-white/25">
              <span aria-hidden>{business.category?.icon || '•'}</span>
              <span className="truncate max-w-[140px]">{business.category?.name}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 flex-1 leading-relaxed">
          {business.description || descriptionFallback}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400 truncate">{location}</span>
          {business.phone ? (
            <span
              className="inline-flex items-center font-semibold shrink-0"
              style={{ color: brandColors.accent }}
            >
              <FaPhone className="mr-1 h-3 w-3" />
              <span className="truncate max-w-[100px]">{business.phone}</span>
            </span>
          ) : null}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:opacity-80 transition-opacity">
            {viewDetailsLabel}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 group-hover:text-white transition-colors [.group:hover_&]:bg-[#8f4a54]">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
