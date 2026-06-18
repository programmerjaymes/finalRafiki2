'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { FaPhone } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import { brandColors } from '@/lib/brandColors';

interface BusinessImage {
  id: string;
  imageData: string;
  sortOrder: number;
}

export type BusinessCardData = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  logo: string | null;
  coverImage?: string | null;
  images?: BusinessImage[];
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

function imageSrc(image: string | null) {
  if (!image) return null;
  if (image.startsWith('data:')) return image;
  return `data:image/jpeg;base64,${image}`;
}

type BusinessListingCardProps = {
  business: BusinessCardData;
  viewDetailsLabel: string;
  unknownLocationLabel: string;
  descriptionFallback?: string;
};

// Product Photo Carousel Component
function ProductCarousel({ business, className = '' }: { business: BusinessCardData; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const productImages = useMemo(() => {
    const imgs: string[] = [];
    if (business.coverImage) imgs.push(business.coverImage);
    if (business.images && business.images.length > 0) {
      imgs.push(...business.images.map(img => img.imageData));
    }
    if (business.logo) imgs.push(business.logo);
    return imgs;
  }, [business.coverImage, business.images, business.logo]);

  const hasImages = productImages.length > 0;
  const totalImages = productImages.length;

  // Auto-play carousel when more than one image
  useEffect(() => {
    if (totalImages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(interval);
  }, [totalImages]);

  if (!hasImages) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center ${className}`}>
        <div className="h-12 w-12 rounded-full bg-white/50 dark:bg-gray-700/50 flex items-center justify-center mb-2">
          <FiImage className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center px-2">
          Photo of products of this business for now
        </span>
      </div>
    );
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const currentImage = productImages[currentIndex];
  const displayImage = imageSrc(currentImage);

  return (
    <div className={`relative overflow-hidden group/carousel ${className}`}>
      <img
        src={displayImage || ''}
        alt={`${business.name} - Photo ${currentIndex + 1}`}
        className="h-full w-full object-cover transition-opacity duration-500"
        loading="lazy"
      />

      {/* Photo Count Badge */}
      {totalImages > 1 && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {totalImages}
        </div>
      )}

      {/* Navigation Arrows */}
      {totalImages > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg transition-all"
            aria-label="Previous photo"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg transition-all"
            aria-label="Next photo"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {productImages.slice(0, 5).map((_: string, idx: number) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); }}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/50'
                }`}
                aria-label={`Go to photo ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BusinessListingCard({
  business,
  viewDetailsLabel,
  unknownLocationLabel,
  descriptionFallback = 'View details for contact info and more.',
}: BusinessListingCardProps) {
  const location =
    business.region?.name ||
    business.district?.name ||
    unknownLocationLabel;

  return (
    <Link
      href={`/businesses/${business.id}`}
      className="group block rounded-xl md:rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md md:hover:shadow-xl transition-all md:hover:-translate-y-0.5 active:scale-[0.99]"
    >
      {/* Phone: compact list row with small carousel */}
      <div className="flex md:hidden items-center gap-3 p-3">
        <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden">
          <ProductCarousel business={business} className="h-full w-full" />
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

      {/* Tablet / desktop: card layout with product carousel */}
      <div className="hidden md:flex flex-col">
        {/* Product Photo Carousel - Main Feature */}
        <ProductCarousel business={business} className="h-36 lg:h-40 w-full" />

        <div className="flex flex-col flex-1 p-3 lg:p-4">
          {/* Category Badge */}
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 text-[10px] font-medium text-primary-600 dark:text-primary-400 mb-2">
            <span aria-hidden>{business.category?.icon || '•'}</span>
            <span className="truncate max-w-[140px]">{business.category?.name}</span>
          </span>

          {/* Business Name */}
          <h2 className="text-sm lg:text-base font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
            {business.name}
          </h2>

          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug mb-2">
            {business.description || descriptionFallback}
          </p>

          <div className="flex items-center justify-between gap-2 text-[11px] lg:text-xs mb-3">
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

          <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
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
