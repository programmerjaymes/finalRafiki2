'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RadarScanner from '@/components/landing/RadarScanner';
import BusinessListingCard from '@/components/landing/BusinessListingCard';
import SearchableDropdown from '@/components/ui/SearchableDropdown';
import { fetchBusinessesNearby, type NearbyBusiness } from '@/lib/businessesNearby';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import { brandColors } from '@/lib/brandColors';
import type { Category } from '@prisma/client';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function NearbyRadarClient() {
  const router = useRouter();
  const locale = useLocale();
  const messages = t(locale);
  const n = messages.nearby;
  const resultsRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(n.allCategories);

  const [isLocating, setIsLocating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [statusText, setStatusText] = useState<string>(n.chooseCategory);
  const [error, setError] = useState<string | null>(null);
  const [foundBusinesses, setFoundBusinesses] = useState<NearbyBusiness[]>([]);
  const [radarSize, setRadarSize] = useState(96);
  const [categorySearch, setCategorySearch] = useState('');
  const [scannerExpanded, setScannerExpanded] = useState(true);

  const descriptionFallback =
    locale === 'sw'
      ? 'Tazama taarifa, bei na mawasiliano.'
      : 'View details for hours, pricing, and contact info.';

  const categoryOptions = useMemo(
    () => [
      { value: '', label: n.allCategories },
      ...categories.map((cat) => ({
        value: cat.id,
        label: [cat.icon, cat.name].filter(Boolean).join(' '),
        keywords: [cat.name, cat.nameEn, cat.nameSw].filter(Boolean).join(' '),
      })),
    ],
    [categories, n.allCategories],
  );

  const { sideCards, overflowCards } = useMemo(() => {
    const maxSide = 6;
    const side: NearbyBusiness[] = [];
    const overflow: NearbyBusiness[] = [];
    foundBusinesses.forEach((biz, i) => {
      if (i < maxSide) side.push(biz);
      else overflow.push(biz);
    });
    return { sideCards: side, overflowCards: overflow };
  }, [foundBusinesses]);

  const leftCards = sideCards.filter((_, i) => i % 2 === 0);
  const rightCards = sideCards.filter((_, i) => i % 2 === 1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setRadarSize(128);
      else if (w >= 768) setRadarSize(112);
      else setRadarSize(Math.min(96, Math.max(80, w * 0.24)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (foundBusinesses.length === 1 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [foundBusinesses.length]);

  useEffect(() => {
    if (scanComplete && foundBusinesses.length > 0) {
      setScannerExpanded(false);
    }
  }, [scanComplete, foundBusinesses.length]);

  const categoryLabel = selectedCategoryName.toLowerCase();

  const startScan = useCallback(async () => {
    setIsLocating(true);
    setIsScanning(false);
    setScanComplete(false);
    setHasStarted(true);
    setError(null);
    setFoundBusinesses([]);
    setScannerExpanded(true);
    setStatusText(n.gettingLocation);

    if (!navigator.geolocation) {
      setError(n.geolocationUnsupported);
      setIsLocating(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      setStatusText(n.pinpointing);
      setIsLocating(false);
      setIsScanning(true);
      setStatusText(n.scanning.replace('{category}', categoryLabel));

      const businesses = await fetchBusinessesNearby({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        radiusKm: 20,
        categoryId: selectedCategoryId,
      });

      if (businesses.length === 0) {
        setIsScanning(false);
        setScanComplete(true);
        setStatusText(n.noResults.replace('{category}', categoryLabel));
        return;
      }

      const revealed: NearbyBusiness[] = [];
      for (let i = 0; i < businesses.length; i++) {
        await sleep(300 + Math.floor(Math.random() * 250));
        revealed.push(businesses[i]);
        setFoundBusinesses([...revealed]);
        setStatusText(
          n.finding
            .replace('{count}', String(revealed.length))
            .replace('{plural}', revealed.length > 1 ? 'es' : ''),
        );
      }

      setIsScanning(false);
      setScanComplete(true);
      setStatusText(
        n.found
          .replace('{count}', String(businesses.length))
          .replace('{plural}', businesses.length > 1 ? 'es' : ''),
      );
    } catch (err) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr?.code === 1) {
        setError(n.locationDenied);
      } else if (geoErr?.code === 2) {
        setError(n.locationUnavailable);
      } else if (geoErr?.code === 3) {
        setError(n.locationTimeout);
      } else {
        setError(err instanceof Error ? err.message : n.scanFailed);
      }
      setIsLocating(false);
      setIsScanning(false);
    }
  }, [categoryLabel, n, selectedCategoryId]);

  const scanning = isLocating || isScanning;

  const handleCategoryChange = (value: string) => {
    if (!value) {
      setSelectedCategoryId(null);
      setSelectedCategoryName(n.allCategories);
      return;
    }
    const cat = categories.find((c) => c.id === value);
    setSelectedCategoryId(value);
    setSelectedCategoryName(cat?.name ?? n.allCategories);
  };

  const renderCard = (biz: NearbyBusiness) => (
    <BusinessListingCard
      key={biz.id}
      business={biz}
      viewDetailsLabel={messages.search.viewDetails}
      unknownLocationLabel={messages.search.unknownLocation}
      descriptionFallback={descriptionFallback}
      distanceKm={biz.distanceKm}
    />
  );

  const scanButton = (className = '') => (
    <button
      type="button"
      onClick={startScan}
      disabled={scanning}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 disabled:opacity-60 transition ${className}`}
      style={{ backgroundColor: brandColors.accent }}
    >
      {scanning ? (
        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      ) : (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      )}
      <span>{hasStarted ? n.rescan : n.scan}</span>
    </button>
  );

  const statusLine = !error && (
    <div className="flex items-start justify-center gap-2 text-center">
      {scanning && (
        <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#8f0e27]/30 border-t-[#8f0e27] animate-spin" />
      )}
      {scanComplete && foundBusinesses.length > 0 && (
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 leading-snug">{statusText}</p>
    </div>
  );

  const categoryField = (
    <SearchableDropdown
      id="nearby-category"
      label={n.categoryLabel}
      placeholder={n.allCategories}
      searchPlaceholder={n.searchCategories}
      value={selectedCategoryId ?? ''}
      options={categoryOptions}
      search={categorySearch}
      onSearchChange={setCategorySearch}
      onValueChange={handleCategoryChange}
      emptyMessage={n.noCategoriesFound}
    />
  );

  const mobileScannerPanel = error ? (
    <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
        <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" stroke="currentColor" strokeWidth="2" />
          <path d="M12 10v4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-center text-gray-600 dark:text-gray-300 whitespace-pre-line">{error}</p>
      <div className="mt-4">{scanButton('w-full')}</div>
    </div>
  ) : scannerExpanded ? (
    <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div className="shrink-0">
          <RadarScanner scanning={scanning} size={radarSize} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: brandColors.accent }}>
            {n.title}
          </p>
          {statusLine}
        </div>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-800 px-3 sm:px-4 py-3 space-y-3">
        {categoryField}
        {scanButton('w-full')}
      </div>
      {!hasStarted && (
        <p className="px-4 pb-3 text-center text-xs text-gray-500 dark:text-gray-400">{n.tapScan}</p>
      )}
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setScannerExpanded(true)}
      className="w-full flex items-center gap-3 rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm px-4 py-3 text-left"
    >
      <div className="shrink-0">
        <RadarScanner scanning={false} size={52} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedCategoryName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{statusText}</p>
      </div>
      <span
        className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ color: brandColors.accent, backgroundColor: `${brandColors.accent}18` }}
      >
        {n.foundCount.replace('{count}', String(foundBusinesses.length))}
      </span>
    </button>
  );

  const desktopScannerPanel = (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-5 sm:p-6">
      <div className="flex flex-col items-center text-center">
        {error ? (
          <div className="w-full py-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
              <svg className="h-7 w-7 text-red-500" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" stroke="currentColor" strokeWidth="2" />
                <path d="M12 10v4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{error}</p>
            <div className="mt-4">{scanButton()}</div>
          </div>
        ) : (
          <>
            <RadarScanner scanning={scanning} size={radarSize} />
            <div className="mt-3 w-full">{statusLine}</div>
          </>
        )}
      </div>
      {!error && (
        <>
          <div className="mt-4">{categoryField}</div>
          <div className="mt-4">{scanButton('w-full')}</div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4.25rem)] bg-[#f4f7ff] dark:bg-[#080c18] pb-24 lg:pb-10">
      <div className="px-3 sm:px-4 md:px-5 lg:px-6 pt-3 pb-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 mb-3 lg:mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition"
            aria-label={n.back}
          >
            <svg className="h-5 w-5 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{n.title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{n.subtitle}</p>
          </div>
        </div>

        {/* Mobile + tablet */}
        <div className="lg:hidden space-y-3">
          <div className="sticky top-[4.25rem] z-20 -mx-3 px-3 sm:-mx-4 sm:px-4 py-2 bg-[#f4f7ff]/95 dark:bg-[#080c18]/95 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60">
            {mobileScannerPanel}
          </div>

          {foundBusinesses.length > 0 ? (
            <div ref={resultsRef} className="scroll-mt-36">
              <ResultsHeader count={foundBusinesses.length} title={n.resultsTitle} foundLabel={n.foundCount} />
              <div className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                {foundBusinesses.map(renderCard)}
              </div>
            </div>
          ) : scanComplete && !error ? (
            <EmptyResults statusText={statusText} browseHref="/search" browseLabel={messages.home.nearbyBrowseAll} />
          ) : null}
        </div>

        {/* Sticky scan bar — mobile only, when collapsed with results */}
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 bg-gradient-to-t from-[#f4f7ff] via-[#f4f7ff] to-transparent dark:from-[#080c18] dark:via-[#080c18] pointer-events-none">
          <div className="pointer-events-auto flex gap-2 max-w-lg mx-auto">
            {!scannerExpanded && foundBusinesses.length > 0 && (
              <button
                type="button"
                onClick={() => setScannerExpanded(true)}
                className="shrink-0 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-lg"
              >
                {n.categoryLabel}
              </button>
            )}
            {!error && (foundBusinesses.length > 0 || hasStarted) && (
              <div className="flex-1">{scanButton('w-full shadow-lg')}</div>
            )}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-center gap-3 xl:gap-4">
            <div className="flex flex-col gap-3 xl:gap-4 w-[220px] xl:w-[260px] shrink-0 min-h-[320px]">
              {leftCards.map(renderCard)}
            </div>
            <div className="w-[min(100%,380px)] shrink-0 sticky top-[5.5rem]">{desktopScannerPanel}</div>
            <div className="flex flex-col gap-3 xl:gap-4 w-[220px] xl:w-[260px] shrink-0 min-h-[320px]">
              {rightCards.map(renderCard)}
            </div>
          </div>

          {overflowCards.length > 0 && (
            <div className="mt-5">
              <ResultsHeader count={foundBusinesses.length} title={n.resultsTitle} foundLabel={n.foundCount} />
              <div className="grid w-full grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                {overflowCards.map(renderCard)}
              </div>
            </div>
          )}

          {foundBusinesses.length > 0 && sideCards.length > 0 && overflowCards.length === 0 && (
            <div className="mt-4 text-center">
              <span
                className="inline-flex text-xs font-bold px-3 py-1 rounded-full"
                style={{ color: brandColors.accent, backgroundColor: `${brandColors.accent}18` }}
              >
                {n.foundCount.replace('{count}', String(foundBusinesses.length))}
              </span>
            </div>
          )}

          {scanComplete && foundBusinesses.length === 0 && !error && (
            <EmptyResults statusText={statusText} browseHref="/search" browseLabel={messages.home.nearbyBrowseAll} />
          )}
          {!hasStarted && foundBusinesses.length === 0 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line py-8">{n.tapScan}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultsHeader({
  count,
  title,
  foundLabel,
}: {
  count: number;
  title: string;
  foundLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3 sticky top-[calc(4.25rem+1px)] z-10 py-2 -mx-1 px-1 bg-[#f4f7ff]/90 dark:bg-[#080c18]/90 backdrop-blur-sm">
      <span className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: brandColors.accent }} />
      <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate">{title}</h2>
      <span
        className="ml-auto shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
        style={{ color: brandColors.accent, backgroundColor: `${brandColors.accent}18` }}
      >
        {foundLabel.replace('{count}', String(count))}
      </span>
    </div>
  );
}

function EmptyResults({
  statusText,
  browseHref,
  browseLabel,
}: {
  statusText: string;
  browseHref: string;
  browseLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
      <p className="text-sm text-gray-500 dark:text-gray-400">{statusText}</p>
      <Link href={browseHref} className="mt-4 text-sm font-semibold hover:underline" style={{ color: brandColors.accent }}>
        {browseLabel}
      </Link>
    </div>
  );
}
