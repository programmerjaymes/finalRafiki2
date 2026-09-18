"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/button/Button';
import { FiPhone } from 'react-icons/fi';
import { brandColors } from '@/lib/brandColors';
import { useLocale } from '@/lib/useLocale';

interface PaymentProcessorProps {
  amount: number;
  bundleName?: string;
  bundleDuration: number;
  onComplete: (transactionId: string) => void;
}

const SUPPORT_PHONE = '+255617807050';
type PaymentOption = 'airtel' | 'tigo' | 'all-networks';

export default function PaymentProcessor({ amount, bundleName, bundleDuration, onComplete }: PaymentProcessorProps) {
  const sw = useLocale() === 'sw';
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null);

  const handleContinue = () => {
    if (!selectedPaymentOption) return;
    onComplete(`MANUAL-${selectedPaymentOption.toUpperCase()}-PENDING-${Date.now()}`);
  };

  const paymentOptions: Array<{ id: PaymentOption; label: string }> = [
    { id: 'airtel', label: sw ? 'Lipa kwa Airtel Money' : 'Pay with Airtel Money' },
    { id: 'tigo', label: sw ? 'Lipa kwa Tigo' : 'Pay with Tigo' },
    { id: 'all-networks', label: sw ? 'Lipa mitandao yote' : 'Pay from any network' },
  ];

  const selectedImage = selectedPaymentOption === 'airtel'
    ? { src: '/images/airtel.jpeg', width: 702, height: 1280, alt: 'Airtel Money payment QR code for DDS Group Limited' }
    : selectedPaymentOption
      ? { src: '/images/tigo.jpeg', width: 672, height: 1080, alt: 'Tigo and all networks payment QR code for DDS Group Limited' }
      : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-800/50 dark:bg-amber-950/30 sm:p-6">
        <p className="text-lg font-semibold leading-relaxed text-gray-800 dark:text-gray-100 sm:text-xl">
          {sw ? 'Lipa ' : 'Pay '}
          <strong style={{ color: brandColors.accent }}>TZS {Number(amount).toLocaleString()}</strong>
          {bundleName && <>{sw ? ` kwa kifurushi cha ${bundleName}` : ` for the ${bundleName} bundle`}</>}
          {sw ? ` cha siku ${bundleDuration}` : ` for ${bundleDuration} days`}
          {sw ? ' kwenye Lipa Namba utakayochagua hapo chini.' : ' using the payment number you select below.'}
        </p>
      </div>

      <section aria-labelledby="payment-options-heading" className="space-y-3">
        <div>
          <h4 id="payment-options-heading" className="text-lg font-bold text-gray-900 dark:text-white">
            {sw ? 'Chagua njia ya malipo' : 'Choose a payment option'}
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {sw ? 'Chagua njia moja ili kuona QR code ya malipo.' : 'Select one option to view its payment QR code.'}
          </p>
        </div>

        <div className="relative">
          <select
            id="payment-option"
            value={selectedPaymentOption ?? ''}
            onChange={(event) => setSelectedPaymentOption(event.target.value as PaymentOption || null)}
            className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 pr-11 text-sm font-semibold text-gray-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="" disabled>
              {sw ? 'Chagua njia ya malipo' : 'Select a payment method'}
            </option>
            {paymentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
          >
            <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </div>

        {selectedImage && (
          <div className="mx-auto mt-5 max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={selectedImage.width}
              height={selectedImage.height}
              className="h-auto w-full"
              sizes="(min-width: 640px) 384px, 100vw"
              priority
            />
          </div>
        )}
      </section>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          {sw ? 'Unahitaji msaada kuhusu malipo?' : 'Need help with payment?'}
        </h4>
        <a
          href={`tel:${SUPPORT_PHONE}`}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
          style={{ color: brandColors.accent }}
        >
          <FiPhone className="h-4 w-4" aria-hidden />
          {SUPPORT_PHONE}
        </a>
      </div>

      <Button
        variant="primary"
        onClick={handleContinue}
        disabled={!selectedPaymentOption}
        className="w-full sm:w-auto sm:min-w-[200px]"
      >
        {sw ? 'Endelea' : 'Continue'}
      </Button>
    </div>
  );
}
