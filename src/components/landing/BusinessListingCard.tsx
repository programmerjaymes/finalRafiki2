'use client';

import Link from 'next/link';
import { FaPhone } from 'react-icons/fa';
import { brandColors } from '@/lib/brandColors';
import BusinessProductCarousel from '@/components/landing/BusinessProductCarousel';
import type { BusinessImageRecord } from '@/lib/businessImage';

export type BusinessCardData = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  logo: string | null;
  coverImage?: string | null;
  images?: BusinessImageRecord[];
  category: { name: string; icon?: string | null };
  region?: { name: string | null } | null;
  district?: { name: string | null } | null;
  ward?: { name: string | null } | null;
};

type BusinessListingCardProps = {
  business: BusinessCardData;
  viewDetailsLabel: string;
  unknownLocationLabel: string;
  descriptionFallback?: string;
};

export default function BusinessListingCard({
  business,
  unknownLocationLabel,
}: BusinessListingCardProps) {
  const location =
    business.ward?.name ||
    business.district?.name ||
    business.region?.name ||
    unknownLocationLabel;

  return (
    <Link
      href={`/businesses/${business.id}`}
      className="group block rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-lg transition-shadow active:scale-[0.99]"
    >
      {/* Carousel — always visible, taller on larger screens */}
      <div className="relative h-44 sm:h-52 md:h-56 overflow-hidden">
        <BusinessProductCarousel business={business} className="h-full w-full" />

        {/* Business name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 py-2 pt-10 z-10">
          <h2 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
            {business.name}
          </h2>
        </div>
      </div>

      {/* Info row */}
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full truncate max-w-[140px]">
            <span aria-hidden>{business.category?.icon || '•'}</span>
            {business.category?.name}
          </span>
          {location && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{location}</p>
          )}
        </div>
        {business.phone && (
          <span
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: brandColors.accent }}
          >
            <FaPhone className="h-2.5 w-2.5" />
            <span className="truncate max-w-[80px]">{business.phone}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
