'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import {
  businessProductImageSources,
  resolveBusinessImageSrc,
  type BusinessImageSource,
} from '@/lib/businessImage';

type BusinessProductCarouselProps = {
  business: BusinessImageSource;
  className?: string;
  emptyLabel?: string;
};

export default function BusinessProductCarousel({
  business,
  className = '',
  emptyLabel = 'Photo of products of this business for now',
}: BusinessProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);

  const productImages = useMemo(
    () => businessProductImageSources(business),
    [business.coverImage, business.images, business.logo],
  );

  const hasImages = productImages.length > 0;
  const totalImages = productImages.length;
  const businessName = business.name ?? 'Business';

  useEffect(() => {
    if (!hasImages) return;
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      next.add((currentIndex + 1) % totalImages);
      return next;
    });
  }, [currentIndex, hasImages, totalImages]);

  useEffect(() => {
    if (totalImages <= 1 || !containerRef.current) return;

    let interval: ReturnType<typeof setInterval>;
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
      { threshold: 0.5 },
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
      <div
        className={`bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center ${className}`}
      >
        <div className="h-12 w-12 rounded-full bg-white/50 dark:bg-gray-700/50 flex items-center justify-center mb-2">
          <FiImage className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center px-2">
          {emptyLabel}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden group/carousel ${className}`}>
      {productImages.map((imgData, idx) => {
        const isLoaded = loadedImages.has(idx);
        const isCurrent = idx === currentIndex;
        if (!isLoaded) return null;

        const displaySrc = resolveBusinessImageSrc(imgData);
        if (!displaySrc) return null;
        return (
          <img
            key={idx}
            src={displaySrc}
            alt={`${businessName} - Photo ${idx + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        );
      })}

      {!loadedImages.has(currentIndex) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-[5]">
          <FiImage className="h-8 w-8 text-gray-300 dark:text-gray-600 animate-pulse" />
        </div>
      )}

      {totalImages > 1 && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm z-20">
          {currentIndex + 1} / {totalImages}
        </div>
      )}

      {totalImages > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg transition-all z-20"
            aria-label="Previous photo"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg transition-all z-20"
            aria-label="Next photo"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {productImages.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
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
