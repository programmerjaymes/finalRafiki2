'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from './Pagination';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  pageSize?: number;
  className?: string;
  showPagination?: boolean;
  onRowClick?: (item: T) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

// Generic table component to handle data rendering with sorting and pagination
function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 10,
  className = '',
  showPagination = true,
  onRowClick,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange
}: DataTableProps<T>) {
  // State for sorting
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for pagination
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  
  // Use external or internal page state
  const currentPage = externalCurrentPage !== undefined ? externalCurrentPage : internalCurrentPage;
  
  // Reset to page 1 when data changes
  useEffect(() => {
    if (externalCurrentPage === undefined) {
      setInternalCurrentPage(1);
    }
  }, [data, externalCurrentPage]);

  // Handle sort click
  const handleSortClick = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Sort the data based on current sort state
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    
    const column = columns.find(col => col.key === sortColumn);
    if (!column?.sortable) return data;
    
    return [...data].sort((a, b) => {
      const sortFn = column.sortFn || defaultSortFn;
      const result = sortFn(a, b);
      return sortDirection === 'asc' ? result : -result;
    });
  }, [data, sortColumn, sortDirection, columns]);

  // Handle default sort function if none provided
  const defaultSortFn = (a: T, b: T) => {
    const aValue = (a as any)[sortColumn!];
    const bValue = (b as any)[sortColumn!];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue);
    }
    
    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  };

  // Paginate the data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / pageSize);
  
  // Change page handler
  const handlePageChange = (page: number) => {
    if (externalOnPageChange) {
      externalOnPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] ${className}`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  isHeader
                  className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${
                    column.sortable ? 'cursor-pointer select-none' : ''
                  }`}
                  onClick={column.sortable ? () => handleSortClick(column.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? 
                        <FiChevronUp className="h-4 w-4" /> : 
                        <FiChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow 
                  key={keyExtractor(item)}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={`${keyExtractor(item)}-${column.key}`}
                      className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                    >
                      {column.cell(item, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center p-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;