import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Loader({ size = 'medium', className = '' }: LoaderProps) {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-t-primary animate-spin border-gray-300 dark:border-gray-600`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
} 