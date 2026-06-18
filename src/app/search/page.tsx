'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Select from '@/components/form/select/Select';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BusinessListingCard from '@/components/landing/BusinessListingCard';
import SearchNearbySearch from '@/components/landing/SearchNearbySearch';
import type { Business, Category, Region } from '@prisma/client';
import Link from 'next/link';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import { brandColors } from '@/lib/brandColors';
import { registerBusinessHref } from '@/lib/registerBusiness';

interface BusinessWithCategory extends Business {
  category: {
    name: string;
    icon?: string;
  };
  region: {
    name: string;
  };
}

interface BusinessResponse {
  businesses: BusinessWithCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

type AreaOption = { id: string; name: string | null };

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const locale = useLocale();
  const messages = t(locale);
  const registerBusinessLink = registerBusinessHref(session);
  const [businesses, setBusinesses] = useState<BusinessWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<AreaOption[]>([]);
  const [wards, setWards] = useState<AreaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 12;

  // Get values from URL search params
  const categoryFromUrl = searchParams.get('category') || '';
  const regionFromUrl = searchParams.get('region') || '';
  const districtFromUrl = searchParams.get('district') || '';
  const wardFromUrl = searchParams.get('ward') || '';
  const priceRangeFromUrl = searchParams.get('priceRange') || '';
  const searchTextFromUrl = searchParams.get('search') || '';

  const [searchText, setSearchText] = useState(searchTextFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedRegion, setSelectedRegion] = useState(regionFromUrl);
  const [selectedDistrict, setSelectedDistrict] = useState(districtFromUrl);
  const [selectedWard, setSelectedWard] = useState(wardFromUrl);
  const [priceRange, setPriceRange] = useState(priceRangeFromUrl);

  // Update selected values when URL params change
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setSelectedRegion(regionFromUrl);
    setSelectedDistrict(districtFromUrl);
    setSelectedWard(wardFromUrl);
    setPriceRange(priceRangeFromUrl);
  }, [categoryFromUrl, regionFromUrl, districtFromUrl, wardFromUrl, priceRangeFromUrl, searchTextFromUrl]);

  useEffect(() => {
    setSearchText(searchTextFromUrl);
  }, [searchTextFromUrl]);

  // Fetch businesses with current filters
  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('page', currentPage.toString());
      if (searchText.trim()) params.append('search', searchText.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedRegion) params.append('region', selectedRegion);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedWard) params.append('ward', selectedWard);
      if (priceRange) params.append('priceRange', priceRange);

      params.append('lean', 'true');
      params.append('_', Date.now().toString());

      const response = await fetch(`/api/businesses?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }
      
      const data: BusinessResponse = await response.json();
      
      // Extract businesses array from response or use empty array as fallback
      const businessesData = data.businesses || [];
      setBusinesses(Array.isArray(businessesData) ? businessesData : []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalResults(data.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedRegion, selectedDistrict, selectedWard, priceRange, searchText, currentPage, searchRefreshKey]);

  // Load districts when mkoa (region) changes
  useEffect(() => {
    if (!selectedRegion) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/districts?regionId=${encodeURIComponent(selectedRegion)}`);
        if (!r.ok) throw new Error('districts');
        const data: unknown = await r.json();
        if (!cancelled && Array.isArray(data)) {
          setDistricts(
            data.map((d: { id?: string; name?: string | null }) => ({
              id: String(d.id),
              name: d.name ?? null,
            })),
          );
        }
      } catch {
        if (!cancelled) setDistricts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedRegion]);

  // Load wards when wilaya (district) changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/wards?districtId=${encodeURIComponent(selectedDistrict)}`,
        );
        if (!r.ok) throw new Error('wards');
        const data: unknown = await r.json();
        if (!cancelled && Array.isArray(data)) {
          setWards(
            data.map((w: { id?: string; name?: string | null }) => ({
              id: String(w.id),
              name: w.name ?? null,
            })),
          );
        }
      } catch {
        if (!cancelled) setWards([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict]);

  // Fetch reference data (categories and regions)
  const fetchReferenceData = useCallback(async () => {
    try {
      const [categoriesResponse, regionsResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/regions')
      ]);
      
      if (!categoriesResponse.ok || !regionsResponse.ok) {
        throw new Error('Failed to fetch reference data');
      }
      
      const categoriesData = await categoriesResponse.json();
      const regionsData = await regionsResponse.json();
      
      setCategories(categoriesData);
      setRegions(regionsData);
    } catch (err) {
      console.error('Error fetching reference data:', err);
    }
  }, []);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (!loading) setScanning(false);
  }, [loading]);

  const pushSearchUrl = (page = 1) => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.append('search', searchText.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedRegion) params.append('region', selectedRegion);
    if (selectedDistrict) params.append('district', selectedDistrict);
    if (selectedWard) params.append('ward', selectedWard);
    if (priceRange) params.append('priceRange', priceRange);
    if (page > 1) params.append('page', String(page));
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/search');
  };

  const handleNearbySearch = () => {
    setScanning(true);
    setCurrentPage(1);
    setSearchRefreshKey((k) => k + 1);
    pushSearchUrl(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    pushSearchUrl(1);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedWard('');
    setPriceRange('');
    setCurrentPage(1);
    router.push('/search');
  };

  const activeFiltersCount =
    (searchText.trim() ? 1 : 0) +
    (selectedCategory ? 1 : 0) +
    (selectedRegion ? 1 : 0) +
    (selectedDistrict ? 1 : 0) +
    (selectedWard ? 1 : 0) +
    (priceRange ? 1 : 0);

  const descriptionFallback =
    locale === 'sw'
      ? 'Tazama taarifa na mawasiliano.'
      : 'View details for contact info and more.';

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5f3] dark:bg-gray-950">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-40 dark:opacity-25"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 40% at 50% 0%, rgba(61, 42, 46, 0.06), transparent),
            radial-gradient(ellipse 40% 30% at 100% 20%, rgba(201, 162, 39, 0.04), transparent)
          `,
        }}
      />
      <Navbar />
      <main className="flex-grow w-full rafiki-nav-offset pb-12">
        <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
          <div className="md:hidden mb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{messages.search.title}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{messages.search.subtitle}</p>
          </div>

          <div className="hidden md:flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4 md:mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: brandColors.accent }}>
                Rafiki
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {messages.search.title}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                {messages.search.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                ← {locale === 'sw' ? 'Nyumbani' : 'Home'}
              </Link>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {messages.search.clearFilters}
                </button>
              )}
              <Link
                href={registerBusinessLink}
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90"
                style={{ backgroundColor: brandColors.accent }}
              >
                {messages.search.registerBusiness}
              </Link>
            </div>
          </div>

          <SearchNearbySearch
            query={searchText}
            onQueryChange={setSearchText}
            onSearch={handleNearbySearch}
            scanning={scanning}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5">
            <aside className="lg:col-span-3 xl:col-span-3">
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="lg:hidden w-full mb-2 flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white"
              >
                <span>{messages.search.filters}</span>
                <span className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <span
                      className="text-xs rounded-full px-2 py-0.5 font-semibold text-white"
                      style={{ backgroundColor: brandColors.accent }}
                    >
                      {activeFiltersCount}
                    </span>
                  )}
                  <span className="text-gray-400">{filtersOpen ? '−' : '+'}</span>
                </span>
              </button>
              <div
                className={`lg:sticky lg:top-[5.25rem] rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg p-4 md:p-5 ${
                  filtersOpen ? 'block' : 'hidden lg:block'
                }`}
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{messages.search.filters}</h2>
                  {activeFiltersCount > 0 && (
                    <span
                      className="text-xs rounded-full px-2.5 py-1 font-semibold text-white"
                      style={{ backgroundColor: brandColors.accent }}
                    >
                      {activeFiltersCount} {messages.search.active}
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {messages.search.category}
                    </label>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full"
                    >
                      <option value="">{messages.search.allCategories}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {messages.search.mkoa}
                    </label>
                    <Select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedDistrict('');
                        setSelectedWard('');
                      }}
                      className="w-full"
                    >
                      <option value="">{messages.search.allLocations}</option>
                      {regions.map((region) => (
                        <option key={String(region.id)} value={String(region.id)}>
                          {region.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {messages.search.wilaya}
                    </label>
                    <Select
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setSelectedWard('');
                      }}
                      disabled={!selectedRegion}
                      className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!selectedRegion
                          ? messages.search.pickMkoaFirst
                          : messages.search.allWilaya}
                      </option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name || d.id}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {messages.search.kijiji}
                    </label>
                    <Select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      disabled={!selectedDistrict}
                      className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!selectedDistrict
                          ? messages.search.pickWilayaFirst
                          : messages.search.allKijiji}
                      </option>
                      {wards.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name || w.id}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {messages.search.priceRange}
                    </label>
                    <Select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full"
                    >
                      <option value="">{messages.search.anyPrice}</option>
                      <option value="low">{messages.search.budget}</option>
                      <option value="medium">{messages.search.standard}</option>
                      <option value="high">{messages.search.premium}</option>
                    </Select>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Price range is optional and may not be supported for all listings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSearch}
                    className="w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white transition shadow-md hover:opacity-90"
                    style={{ backgroundColor: brandColors.accent }}
                  >
                    {messages.search.applyFilters}
                  </button>
                </div>
              </div>
            </aside>

            <section className="lg:col-span-9 xl:col-span-9 min-w-0">
              {!loading && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2 md:mb-4">
                  <div>
                    <h2 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                      {totalResults.toLocaleString()}{' '}
                      {totalResults === 1 ? messages.search.result : messages.search.results}
                    </h2>
                    {searchText.trim() && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {locale === 'sw' ? 'Kwa' : 'For'}: &ldquo;{searchText.trim()}&rdquo;
                      </p>
                    )}
                  </div>
                  {totalPages > 1 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {messages.search.page} {currentPage} {messages.search.of} {totalPages}
                    </p>
                  )}
                </div>
              )}

              {loading ? (
                <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden animate-pulse"
                    >
                      <div className="h-28 bg-gray-100 dark:bg-gray-800" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-full rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid w-full grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
                    {Array.isArray(businesses) &&
                      businesses.map((business) => (
                        <BusinessListingCard
                          key={business.id}
                          business={business}
                          viewDetailsLabel={messages.search.viewDetails}
                          unknownLocationLabel={messages.search.unknownLocation}
                          descriptionFallback={descriptionFallback}
                        />
                      ))}
                  </div>

                  {businesses.length === 0 && (
                    <div className="mt-10 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {messages.search.noResultsTitle}
                      </h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {messages.search.noResultsDesc}
                      </p>
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white transition shadow-md hover:opacity-90"
                          style={{ backgroundColor: brandColors.accent }}
                        >
                          {messages.search.clearFilters}
                        </button>
                      </div>
                    </div>
                  )}

                  {totalPages > 1 && businesses.length > 0 && (
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let page;
                          if (totalPages <= 7) page = i + 1;
                          else if (currentPage <= 4) page = i + 1;
                          else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                          else page = currentPage - 3 + i;

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`h-10 min-w-10 px-3 rounded-xl transition border ${
                                currentPage === page
                                  ? 'text-white border-transparent'
                                  : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                              style={
                                currentPage === page
                                  ? { backgroundColor: brandColors.accent }
                                  : undefined
                              }
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Loading fallback component
function SearchLoading() {
  return (
    <div className="min-h-screen bg-[#f7f5f3] dark:bg-gray-950">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResults />
    </Suspense>
  );
}
