'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageBreadcrumbProps {
  items?: BreadcrumbItem[];
  homeLabel?: string;
  className?: string;
}

export default function PageBreadcrumb({
  items = [],
  homeLabel = 'Dashboard',
  className = '',
}: PageBreadcrumbProps) {
  const pathname = usePathname();
  
  // If no items are provided, generate them from the pathname
  const breadcrumbItems = items.length > 0 
    ? items 
    : generateBreadcrumbItems(pathname, homeLabel);

  return (
    <nav className={`flex mb-5 ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <HomeIcon className="h-4 w-4 mr-2" />
            {homeLabel}
          </Link>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            {item.path && index < breadcrumbItems.length - 1 ? (
              <Link
                href={item.path}
                className="ml-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:ml-2"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-1 text-sm font-medium text-gray-800 dark:text-gray-200 md:ml-2">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Helper function to generate breadcrumb items from the pathname
function generateBreadcrumbItems(pathname: string, homeLabel: string): BreadcrumbItem[] {
  if (pathname === '/') {
    return [];
  }
  
  // Split the pathname and remove empty segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Create breadcrumb items from segments
  let currentPath = '';
  return segments.map((segment, index) => {
    currentPath += `/${segment}`;
    
    // Format the label (capitalize, replace hyphens, etc.)
    const label = segment
      .replace(/^[a-z]/, char => char.toUpperCase())
      .replace(/-([a-z])/g, (_, char) => ` ${char.toUpperCase()}`);
    
    // For the last segment, don't include a path (it's the current page)
    return {
      label,
      path: index < segments.length - 1 ? currentPath : undefined,
    };
  });
} 