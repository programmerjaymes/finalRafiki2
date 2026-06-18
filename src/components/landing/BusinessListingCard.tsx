'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
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
}

// Optimized Product Photo Carousel - Lazy loads images
function ProductCarousel({ business, className = '' }: { business: BusinessCardData; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);

  // Get product photos metadata (lightweight - just strings)
  const productImages = useMemo(() => {
    const imgs: string[] = [];
    if (business.coverImage) imgs.push(business.coverImage);
    if (business.images && business.images.length > 0) {
      imgs.push(...business.images.map(img => img.imageData));
    }
    if (business.logo) imgs.push(business.logo);
    return imgs;
  }, [business.coverImage, business.images?.length, business.logo]);

  const hasImages = productImages.length > 0;
  const totalImages = productImages.length;

  // Load image when index changes (lazy loading)
  useEffect(() => {
    if (!hasImages) return;
    setLoadedImages(prev => {
      const next = new Set(prev);
      next.add(currentIndex);
      next.add((currentIndex + 1) % totalImages);
      return next;
    });
  }, [currentIndex, hasImages, totalImages]);

  // Auto-play with intersection observer
  useEffect(() => {
    if (totalImages <= 1 || !containerRef.current) return;

    let interval: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            interval = setInterval(() => {
              setCurrentIndex((prev) => (prev + 1) % totalImages);
            }, 3000);
          } else {
            clearInterval(interval);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [totalImages]);

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

  return (
    <div ref={containerRef} className={`relative overflow-hidden group/carousel ${className}`}>
      {/* Only render images that have been marked for loading */}
      {productImages.map((imgData, idx) => {
        const isLoaded = loadedImages.has(idx);
        const isCurrent = idx === currentIndex;
        if (!isLoaded) return null;

        const displaySrc = imgData.startsWith('data:') ? imgData : `data:image/jpeg;base64,${imgData}`;
        return (
          <img
            key={idx}
            src={displaySrc}
            alt={`${business.name} - Photo ${idx + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        );
      })}

      {/* Loading Placeholder */}
      {!loadedImages.has(currentIndex) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-5">
          <div className="animate-pulse flex flex-col items-center">
            <FiImage className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          </div>
        </div>
      )}

      {/* Photo Count Badge */}
      {totalImages > 1 && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm z-20">
          {currentIndex + 1} / {totalImages}
        </div>
      )}

      {/* Navigation Arrows */}
      {totalImages > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg transition-all z-20"
            aria-label="Previous photo"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg transition-all z-20"
            aria-label="Next photo"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {productImages.slice(0, 5).map((_, idx: number) => (
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
      {/* Phone: compact list row */}
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

      {/* Tablet / desktop: card with carousel filling most of card */}
      <div className="hidden md:flex flex-col h-72 lg:h-80">
        {/* Product Photo Carousel - Fills most of card */}
        <div className="relative flex-1">
          <ProductCarousel business={business} className="h-full w-full" />
          
          {/* Business Name overlaid on carousel */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 z-10">
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
              {business.name}
            </h3>
          </div>
        </div>

        {/* Compact info at bottom */}
        <div className="p-3 flex-none">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 text-[10px] font-medium text-primary-600 dark:text-primary-400">
              <span aria-hidden>{business.category?.icon || '•'}</span>
              <span className="truncate max-w-[100px]">{business.category?.name}</span>
            </span>
            
            {business.phone ? (
              <span
                className="inline-flex items-center font-semibold shrink-0 text-[11px]"
                style={{ color: brandColors.accent }}
              >
                <FaPhone className="mr-1 h-3 w-3" />
                <span className="truncate max-w-[80px]">{business.phone}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
