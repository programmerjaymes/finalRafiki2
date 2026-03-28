'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Select from '@/components/form/select/Select';
import { Category, Region } from '@prisma/client';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';

export default function BusinessSearch() {
  const locale = useLocale();
  const messages = t(locale);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const safeArray = <T,>(value: unknown, fallback: T[] = []): T[] => {
      if (Array.isArray(value)) return value as T[];
      if (value && typeof value === 'object') {
        const maybeArray = (value as Record<string, unknown>).data ?? (value as Record<string, unknown>).regions;
        if (Array.isArray(maybeArray)) return maybeArray as T[];
      }
      return fallback;
    };

    const load = async () => {
      try {
        const [categoriesRes, regionsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/regions'),
        ]);

        const [categoriesJson, regionsJson] = await Promise.all([
          categoriesRes.json().catch(() => null),
          regionsRes.json().catch(() => null),
        ]);

        if (!cancelled) {
          setCategories(categoriesRes.ok ? safeArray<Category>(categoriesJson) : []);
          setRegions(regionsRes.ok ? safeArray<Region>(regionsJson) : []);
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Error fetching search filters:', err);
        if (!cancelled) {
          setCategories([]);
          setRegions([]);
          setIsLoaded(true);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (selectedCategory) searchParams.append('category', selectedCategory);
    if (selectedRegion) searchParams.append('region', selectedRegion);
    if (priceRange) searchParams.append('priceRange', priceRange);

    window.location.href = `/search?${searchParams.toString()}`;
  };

  const selectClass =
    'w-full py-2 pl-3 pr-9 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary dark:focus:border-secondary focus:ring-2 focus:ring-primary/15 dark:focus:ring-secondary/15 transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 8 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-3 lg:items-end">
        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {messages.search.category}
          </label>
          <div className="relative">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={selectClass}
            >
              <option value="">{messages.search.allCategories}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {messages.search.location}
          </label>
          <div className="relative">
            <Select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className={selectClass}
            >
              <option value="">{messages.search.allLocations}</option>
              {regions.map((region) => (
                <option key={String(region.id)} value={String(region.id)}>
                  {region.name}
                </option>
              ))}
            </Select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {messages.search.priceRange}
          </label>
          <div className="relative">
            <Select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className={selectClass}
            >
              <option value="">{messages.search.anyPrice}</option>
              <option value="low">{messages.search.budget}</option>
              <option value="medium">{messages.search.standard}</option>
              <option value="high">{messages.search.premium}</option>
            </Select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-3 flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full bg-primary text-white dark:bg-secondary dark:text-gray-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark dark:hover:bg-secondary-light transition duration-200 inline-flex items-center justify-center gap-2 shadow-sm hover:shadow"
          >
            <span>{messages.search.submitSearch}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {messages.search.popularSearches}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {messages.home.popularSearchTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent hover:border-primary/20 dark:hover:border-secondary/30 transition"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
