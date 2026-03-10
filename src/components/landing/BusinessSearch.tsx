'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Select from '@/components/form/select/Select';
import { Category, Region } from '@prisma/client';

export default function BusinessSearch() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setIsLoaded(true);
      });

    // Fetch regions
    fetch('/api/regions')
      .then(res => res.json())
      .then(data => setRegions(data))
      .catch(err => console.error('Error fetching regions:', err));
  }, []);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (selectedCategory) searchParams.append('category', selectedCategory);
    if (selectedRegion) searchParams.append('region', selectedRegion);
    if (priceRange) searchParams.append('priceRange', priceRange);
    
    window.location.href = `/search?${searchParams.toString()}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section id="search" className="py-20 bg-gray-50 dark:bg-gray-900 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl opacity-30"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-secondary/10 dark:bg-secondary/5 blur-3xl opacity-30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 dark:border-gray-700"
        >
          <motion.div 
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-medium text-sm mb-4">
              Quick Search
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Perfect <span className="text-primary dark:text-secondary">Business Solutions</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Search through thousands of businesses to find the service that best fits your needs
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="relative">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-3 pl-4 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary dark:focus:border-secondary focus:ring focus:ring-primary/20 dark:focus:ring-secondary/20 transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <Select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full py-3 pl-4 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary dark:focus:border-secondary focus:ring focus:ring-primary/20 dark:focus:ring-secondary/20 transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Locations</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </Select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <div className="relative">
                <Select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full py-3 pl-4 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary dark:focus:border-secondary focus:ring focus:ring-primary/20 dark:focus:ring-secondary/20 transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Any Price</option>
                  <option value="low">Budget (Below $100)</option>
                  <option value="medium">Standard ($100 - $500)</option>
                  <option value="high">Premium (Above $500)</option>
                </Select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              onClick={handleSearch}
              className="bg-primary text-white dark:bg-secondary dark:text-gray-900 px-10 py-4 rounded-lg font-medium hover:bg-primary-dark dark:hover:bg-secondary-light transition duration-200 transform hover:scale-105 hover:shadow-lg inline-flex items-center gap-2"
            >
              <span>Search Businesses</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
          
          {/* Popular search tags */}
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Restaurants', 'Hotels', 'Plumbers', 'Electricians', 'Beauticians'].map((tag) => (
                <span key={tag} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-secondary/20 hover:text-primary dark:hover:text-secondary rounded-full text-sm cursor-pointer transition">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
