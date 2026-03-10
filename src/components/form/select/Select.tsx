'use client';

import React, { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  fullWidth?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, fullWidth = true, disabled, children, ...props }, ref) => {
    return (
      <div className={clsx('relative', fullWidth && 'w-full')}>
        <select
          className={clsx(
            'block px-4 py-2 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-gray-300',
            fullWidth && 'w-full',
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
