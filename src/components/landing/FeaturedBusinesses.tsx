'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaPhone } from 'react-icons/fa';
import type { Business } from '@prisma/client';

interface BusinessWithCategory extends Business {
  category: {
    name: string;
    icon?: string;
  };
  region?: {
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

export default function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  useEffect(() => {
    fetch(`/api/businesses?limit=${limit}&page=${currentPage}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch businesses: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: BusinessResponse) => {
        if (data && typeof data === 'object') {
          setBusinesses(Array.isArray(data.businesses) ? data.businesses : []);
          setTotalPages(data.pagination?.pages || 1);
        } else {
          setBusinesses([]);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching businesses:', err);
        alert('Unable to load businesses. Please check your internet connection and try again.');
        setBusinesses([]);
        setLoading(false);
      });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse">
                <div className="h-20 w-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-2xl mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(businesses)) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-900 dark:text-gray-200">No businesses available at the moment.</p>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Featured <span className="text-primary dark:text-secondary">Businesses</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {businesses.map((business) => (
              <motion.div
                key={business.id}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group"
              >
                <Link href={`/businesses/${business.id}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 h-full">
                    {/* Business Logo */}
                    <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 p-4 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-2xl bg-white dark:bg-gray-700 shadow-md flex items-center justify-center overflow-hidden ring-2 ring-primary/10 dark:ring-secondary/20 group-hover:ring-4 transition-all duration-300">
                        {business.logo ? (
                          <img 
                            src={business.logo.startsWith('data:') ? business.logo : `data:image/jpeg;base64,${business.logo}`} 
                            alt={business.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-primary dark:text-secondary text-2xl font-bold">
                            {business.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {/* Category Badge */}
                      <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-primary dark:text-secondary shadow-sm">
                        {business.category.icon || '📍'}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary dark:group-hover:text-secondary transition-colors">
                        {business.name}
                      </h3>
                      
                      {business.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {business.description}
                        </p>
                      )}
                      
                      {/* Phone number */}
                      {business.phone && (
                        <div className="flex items-center gap-1 mb-2 text-xs text-gray-600 dark:text-gray-400">
                          <FaPhone className="text-primary dark:text-secondary flex-shrink-0" size={10} />
                          <span className="truncate">{business.phone}</span>
                        </div>
                      )}
                      
                      {/* Location */}
                      {business.region && business.region.name && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">{business.region.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                ))}
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
          <div className="mt-8 text-center">
            <Link
              href="/search"
              className="inline-block bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light text-white dark:text-gray-900 px-8 py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              View All Businesses
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
