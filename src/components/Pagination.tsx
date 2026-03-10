import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  // Return null if there's only one page
  if (totalPages <= 1) return null;

  // Function to determine which page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include the first and last page
      if (currentPage <= 3) {
        // If we're near the beginning, show first 4 pages and last page
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // If we're near the end, show first page and last 4 pages
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // If we're in the middle, show first page, current-1, current, current+1, and last page
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <nav className={`flex items-center space-x-1 ${className}`} aria-label="Pagination">
      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      
      {/* Page numbers */}
      {getPageNumbers().map((pageNumber, index) => (
        pageNumber === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={`page-${pageNumber}`}
            onClick={() => onPageChange(pageNumber as number)}
            className={`px-3 py-1 rounded ${
              currentPage === pageNumber
                ? 'bg-primary text-white dark:bg-primary-600'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            aria-current={currentPage === pageNumber ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        )
      ))}
      
      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </nav>
  );
} 