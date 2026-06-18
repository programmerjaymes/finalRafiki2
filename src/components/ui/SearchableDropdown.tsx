'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import Label from '@/components/form/Label';

export type SearchableDropdownOption = {
  value: string;
  label: string;
};

type SearchableDropdownProps = {
  id?: string;
  label: string;
  placeholder?: string;
  searchPlaceholder?: string;
  value: string;
  options: SearchableDropdownOption[];
  search: string;
  onSearchChange: (value: string) => void;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
};

export default function SearchableDropdown({
  id,
  label,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  value,
  options,
  search,
  onSearchChange,
  onValueChange,
  disabled = false,
  required = false,
  emptyMessage = 'No results found',
}: SearchableDropdownProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        onSearchChange('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onSearchChange]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={rootRef} className="w-full">
      <Label htmlFor={id}>{label}{required ? ' *' : ''}</Label>
      <div className="relative mt-1">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((o) => !o);
          }}
          className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-primary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:disabled:bg-gray-800"
        >
          <span className={`truncate text-left ${selected ? '' : 'text-gray-400'}`}>
            {selected?.label ?? placeholder}
          </span>
          <FiChevronDown
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && !disabled && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-2 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
                <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <ul className="max-h-52 overflow-y-auto p-1" role="listbox">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-gray-400">{emptyMessage}</li>
              ) : (
                filtered.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={value === option.value}
                      onClick={() => {
                        onValueChange(option.value);
                        setOpen(false);
                        onSearchChange('');
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        value === option.value ? 'bg-primary/10 font-medium text-primary' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
