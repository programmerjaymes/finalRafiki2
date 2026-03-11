import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Button from '@/components/ui/button/Button';
import { PaginationMeta } from './types';

interface PaginationProps {
  paginationMeta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ paginationMeta, onPageChange }) => {
  if (!paginationMeta || paginationMeta.totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <nav className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(paginationMeta.page - 1)}
          className={paginationMeta.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <FiChevronLeft className="h-4 w-4" />
        </Button>
        
        {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1)
          .filter(page => 
            page === 1 || 
            page === paginationMeta.totalPages || 
            (page >= paginationMeta.page - 1 && page <= paginationMeta.page + 1)
          )
          .map((page, index, array) => (
            <React.Fragment key={page}>
              {index > 0 && array[index - 1] !== page - 1 && (
                <span className="text-gray-500 dark:text-gray-400">...</span>
              )}
              <Button 
                variant={page === paginationMeta.page ? 'primary' : 'outline'} 
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            </React.Fragment>
          ))
        }
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(paginationMeta.page + 1)}
          className={paginationMeta.page === paginationMeta.totalPages ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <FiChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
};

export default Pagination;
