import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { Category } from './types';

interface BusinessSearchFilterProps {
  search: string;
  selectedCategory: string;
  categories: Category[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const BusinessSearchFilter: React.FC<BusinessSearchFilterProps> = ({
  search,
  selectedCategory,
  categories,
  onSearchChange,
  onSearchSubmit,
  onCategoryChange,
}) => {
  return (
    <div className="bg-white dark:bg-boxdark p-4 rounded-lg border border-stroke dark:border-strokedark mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={onSearchSubmit} className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Search businesses..."
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              value={search}
              onChange={onSearchChange}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <FiSearch className="h-5 w-5" />
            </button>
          </div>
        </form>
        
        <div className="w-full md:w-48">
          <select
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            value={selectedCategory}
            onChange={onCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default BusinessSearchFilter;
