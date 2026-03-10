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
      .then(res => res.json())
      .then((data: BusinessResponse) => {
        setBusinesses(data.businesses || []);
        setTotalPages(data.pagination?.pages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching businesses:', err);
        setLoading(false);
      });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <motion.div
                key={business.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
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
                        {business.category.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 truncate ml-2">
                        {business.region && business.region.name ? business.region.name : 'Unknown location'}
                      </span>
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
