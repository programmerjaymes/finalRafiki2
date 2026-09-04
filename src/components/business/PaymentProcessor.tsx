"use client";

import React from 'react';
import Button from '@/components/ui/button/Button';
import { FiInfo, FiMail } from 'react-icons/fi';
import { brandColors } from '@/lib/brandColors';
import { useLocale } from '@/lib/useLocale';

interface PaymentProcessorProps {
  amount: number;
  bundleName?: string;
  onComplete: (transactionId: string) => void;
}

const SUPPORT_EMAIL = 'programmerjames12@gmail.com';

export default function PaymentProcessor({ amount, bundleName, onComplete }: PaymentProcessorProps) {
  const sw = useLocale() === 'sw';
  const handleContinue = () => {
    onComplete(`MANUAL-PENDING-${Date.now()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30 p-5 sm:p-6">
        <div className="flex gap-3">
          <FiInfo
            className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5"
            aria-hidden
          />
          <div className="min-w-0 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {sw ? 'Malipo ya moja kwa moja kwa sasa' : 'Manual payment for now'}
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {sw ? 'Malipo ya mtandaoni bado hayajaunganishwa. Baada ya kukamilisha usajili, lipa ' : 'Online payment is not connected yet. After you finish registration, please pay '}
              <strong>Rafiki</strong>{sw ? ' moja kwa moja kwa kiasi kilicho hapa chini. Timu yetu itathibitisha malipo na kuwezesha orodha yako.' : ' directly using the amount below. Our team will confirm your payment and activate your listing.'}
            </p>
            {bundleName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {sw ? 'Kifurushi kilichochaguliwa:' : 'Selected plan:'} <strong className="text-gray-900 dark:text-white">{bundleName}</strong>
              </p>
            )}
            <p
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: brandColors.accent }}
            >
              TZS {Number(amount).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sw ? 'Unaweza kukamilisha fomu ya biashara sasa na kupanga malipo na kampuni baadaye. Bonyeza ' : 'You can complete the business form now and arrange payment with the company afterwards. Press '}
              <strong>{sw ? 'Endelea' : 'Continue'}</strong>{sw ? ' kwenda hatua inayofuata.' : ' to move to the next step.'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          {sw ? 'Unahitaji msaada kuhusu malipo?' : 'Need help with payment?'}
        </h4>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
          style={{ color: brandColors.accent }}
        >
          <FiMail className="h-4 w-4" aria-hidden />
          {SUPPORT_EMAIL}
        </a>
      </div>

      <Button variant="primary" onClick={handleContinue} className="w-full sm:w-auto sm:min-w-[200px]">
        {sw ? 'Endelea' : 'Continue'}
      </Button>
    </div>
  );
}
