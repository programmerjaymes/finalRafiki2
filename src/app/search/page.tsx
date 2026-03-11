'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Select from '@/components/form/select/Select';
import Navbar from '@/components/landing/Navbar';
import type { Business, Category, Region } from '@prisma/client';
import Link from 'next/link';
import { FaPhone } from 'react-icons/fa';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="py-24"> {/* Increased padding-top to account for fixed navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <Select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full"
                >
                  <option value="">All Locations</option>
                  {regions.map((region) => (
                    <option key={region.id.toString()} value={region.id.toString()}>
                      {region.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price Range
                </label>
                <Select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full"
                >
                  <option value="">Any Price</option>
                  <option value="low">Low (Below $100)</option>
                  <option value="medium">Medium ($100 - $500)</option>
                  <option value="high">High (Above $500)</option>
                </Select>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={handleSearch}
                className="bg-primary text-white dark:bg-secondary dark:text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark dark:hover:bg-secondary-light transition duration-200"
              >
                Update Search
              </button>
            </div>
          </div>

          {/* Results Header */}
          {!loading && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalResults} Result{totalResults !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          )}
          
          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(businesses) && businesses.map((business) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
                  >
                    <Link href={`/businesses/${business.id}`}>
                      <div className="p-4">
                        {/* Business Logo */}
                        <div className="flex items-center justify-center mb-3">
                          <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            {business.logo ? (
                              <img 
                                src={business.logo.startsWith('data:') ? business.logo : `data:image/jpeg;base64,${business.logo}`} 
                                alt={business.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xl font-bold">
                                {business.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center line-clamp-1">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-center">
                          {business.description}
                        </p>
                        
                        {/* Phone number */}
                        {business.phone && (
                          <div className="flex items-center justify-center mb-2 text-sm text-gray-600 dark:text-gray-300">
                            <FaPhone className="mr-1.5 text-primary dark:text-secondary text-xs" />
                            <span className="truncate">{business.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-primary dark:text-secondary font-medium truncate">
                            {business.category?.name || 'Uncategorized'}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 truncate ml-2">
                            {business.region?.name || 'Unknown location'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              {businesses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl text-gray-600 dark:text-gray-300">
                    No businesses found matching your criteria
                  </h3>
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && businesses.length > 0 && (
                <div className="col-span-full mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition ${
                            currentPage === page
                              ? 'bg-primary text-white dark:bg-secondary dark:text-gray-900'
                              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
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
