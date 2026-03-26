'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Select from '@/components/form/select/Select';
import Navbar from '@/components/landing/Navbar';
import type { Business, Category, Region } from '@prisma/client';
import Link from 'next/link';
import { FaPhone } from 'react-icons/fa';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

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

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const messages = t(locale);
  const [businesses, setBusinesses] = useState<BusinessWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 9;

  // Get values from URL search params
  const categoryFromUrl = searchParams.get('category') || '';
  const regionFromUrl = searchParams.get('region') || '';
  const priceRangeFromUrl = searchParams.get('priceRange') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedRegion, setSelectedRegion] = useState(regionFromUrl);
  const [priceRange, setPriceRange] = useState(priceRangeFromUrl);

  // Update selected values when URL params change
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setSelectedRegion(regionFromUrl);
    setPriceRange(priceRangeFromUrl);
  }, [categoryFromUrl, regionFromUrl, priceRangeFromUrl]);

  // Fetch businesses with current filters
  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('page', currentPage.toString());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedRegion) params.append('region', selectedRegion);
      if (priceRange) params.append('priceRange', priceRange);

      const response = await fetch(`/api/businesses?${params.toString()}`);
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
  }, [selectedCategory, selectedRegion, priceRange, currentPage]);

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

  // Initial data load
  useEffect(() => {
    // Load reference data
    fetchReferenceData();
    
    // Load businesses with current filters
    fetchBusinesses();
  }, [fetchBusinesses, fetchReferenceData]);

  const handleSearch = () => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    // Update URL with current filters
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedRegion) params.append('region', selectedRegion);
    if (priceRange) params.append('priceRange', priceRange);
    
    // Navigate to new URL with updated filters
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedRegion('');
    setPriceRange('');
    setCurrentPage(1);
    router.push('/search');
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedRegion ? 1 : 0) + (priceRange ? 1 : 0);

  // Debug active selections
  console.log('Current selections:', { 
    categoryParam: searchParams.get('category'),
    selectedCategory,
    regionParam: searchParams.get('region'),
    selectedRegion,
    priceRangeParam: searchParams.get('priceRange'),
    priceRange
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {messages.search.title}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                {messages.search.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {messages.search.clearFilters}
                </button>
              )}
              <Link
                href="/business-create"
                className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light px-4 py-2.5 text-sm font-semibold text-white dark:text-gray-900 transition shadow-sm"
              >
                {messages.search.registerBusiness}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filters */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{messages.search.filters}</h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-xs rounded-full bg-gray-50 dark:bg-gray-800 px-2 py-1 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
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
                      {messages.search.location}
                    </label>
                    <Select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
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
                    onClick={handleSearch}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light px-4 py-3 text-sm font-semibold text-white dark:text-gray-900 transition shadow-sm"
                  >
                    {messages.search.applyFilters}
                  </button>
                </div>
              </div>
            </aside>

            {/* Results */}
            <section className="lg:col-span-8 xl:col-span-9">
              {!loading && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {totalResults.toLocaleString()} {totalResults === 1 ? messages.search.result : messages.search.results}
                  </h2>
                  {totalPages > 1 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {messages.search.page} {currentPage} {messages.search.of} {totalPages}
                    </p>
                  )}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-5 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                          <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="mt-4 h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                      <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                      <div className="mt-5 flex items-center justify-between">
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.isArray(businesses) && businesses.map((business) => {
                      const logoSrc =
                        business.logo && business.logo.startsWith('data:')
                          ? business.logo
                          : business.logo
                            ? `data:image/jpeg;base64,${business.logo}`
                            : null;

                      return (
                        <Link
                          key={business.id}
                          href={`/businesses/${business.id}`}
                          className="group block rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-shadow"
                        >
                          <div className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800">
                                {logoSrc ? (
                                  <img
                                    src={logoSrc}
                                    alt={business.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-gray-700 dark:text-gray-200 font-bold">
                                    {business.name?.charAt(0)?.toUpperCase() || 'B'}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                    {business.name}
                                  </h3>
                                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700">
                                    <span aria-hidden>{business.category?.icon || '•'}</span>
                                    <span className="truncate max-w-[120px]">{business.category?.name || 'Category'}</span>
                                  </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                  {business.description || messages.search.viewDetails}
                                </p>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {business.region?.name || messages.search.unknownLocation}
                                  </span>

                                  {business.phone ? (
                                    <span className="inline-flex items-center text-xs font-medium text-primary dark:text-secondary">
                                      <FaPhone className="mr-1.5 text-[11px]" />
                                      <span className="truncate max-w-[140px]">{business.phone}</span>
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">{messages.search.noPhone}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 h-px bg-gray-100 dark:bg-gray-800" />
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                                {messages.search.viewDetails}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                                →
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
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
                          onClick={clearFilters}
                          className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light px-6 py-3 text-sm font-semibold text-white dark:text-gray-900 transition shadow-sm"
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
                                  ? 'bg-primary text-white dark:bg-secondary dark:text-gray-900 border-transparent'
                                  : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
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
    </div>
  );
}

// Loading fallback component
function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
