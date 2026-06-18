'use client';

import React, { useEffect, useState } from 'react';
import {
  formatFullPhone,
  phoneLocalPart,
  TZ_PHONE_PREFIX,
} from '@/lib/phoneNumber';

interface TanzaniaPhoneInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function TanzaniaPhoneInput({
  id,
  name = 'phone',
  value,
  defaultValue,
  onChange,
  error = false,
  hint,
  disabled = false,
  required = false,
  placeholder = '712 345 678',
  className = '',
}: TanzaniaPhoneInputProps) {
  const [local, setLocal] = useState(() => phoneLocalPart(value ?? defaultValue ?? ''));

  useEffect(() => {
    if (value !== undefined) {
      setLocal(phoneLocalPart(value));
    }
  }, [value]);

  const emitChange = (digits: string) => {
    onChange?.({
      target: { name, value: formatFullPhone(digits) },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setLocal(digits);
    emitChange(digits);
  };

  let inputClasses =
    'h-11 flex-1 min-w-0 rounded-r-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

  if (disabled) {
    inputClasses +=
      ' text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  } else if (error) {
    inputClasses +=
      ' text-error-800 border-error-500 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500';
  } else {
    inputClasses +=
      ' bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800';
  }

  return (
    <div className={className}>
      <div className="flex">
        <span
          className={`inline-flex h-11 shrink-0 items-center rounded-l-lg border border-r-0 px-3 text-sm font-semibold ${
            error
              ? 'border-error-500 bg-error-50 text-error-800 dark:bg-error-500/10 dark:text-error-400'
              : 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
          aria-hidden
        >
          {TZ_PHONE_PREFIX}
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          name={`${name}Local`}
          value={local}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-label="Phone number without country code"
        />
      </div>
      {hint && (
        <p className={`mt-1 text-sm ${error ? 'text-error-500' : 'text-gray-500'}`}>{hint}</p>
      )}
    </div>
  );
}
