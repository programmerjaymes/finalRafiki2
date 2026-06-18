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
  if (image.startsWith('/') || image.startsWith('http')) return image; // stored path or URL
  return `data:image/jpeg;base64,${image}`; // legacy base64
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

        const displaySrc = imageSrc(imgData);
        if (!displaySrc) return null;
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
        <ProductCarousel business={business} className="h-full w-full" />

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
