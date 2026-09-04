"use client";

import React from 'react';
import { Bundle } from '@prisma/client';
import { FiCheck } from 'react-icons/fi';
import { brandColors } from '@/lib/brandColors';
import { useLocale } from '@/lib/useLocale';

interface BundleSelectionProps {
  bundles: Bundle[];
  selectedBundle: Bundle | null;
  onSelect: (bundle: Bundle) => void;
}

const FEATURE_LABELS: Record<string, string> = {
  name: 'Business name',
  description: 'Description',
  phone: 'Phone number',
  whatsapp: 'WhatsApp number',
  email: 'Email address',
  website: 'Website',
  regionId: 'Region',
  districtId: 'District',
  wardId: 'Ward',
  street: 'Street address',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter',
  allowsOnlineBooking: 'Online booking',
  allowsDelivery: 'Delivery option',
  logo: 'Company logo',
  coverImage: 'Cover image',
  latitude: 'GPS latitude',
  longitude: 'GPS longitude',
  social_media: 'Social media links',
  coordinates: 'GPS coordinates',
};

function formatFeature(feature: string): string {
  return (
    FEATURE_LABELS[feature] ??
    feature
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim()
  );
}

function bundleFeatures(bundle: Bundle): string[] {
  let raw: string[] = [];
  try {
    raw = JSON.parse(bundle.allowedFields);
  } catch {
    raw = [];
  }

  const display = raw
    .filter((f) => !['name', 'description', 'phone', 'whatsapp', 'email', 'regionId', 'districtId', 'wardId', 'street'].includes(f))
    .map(formatFeature);

  if (bundle.allowsVideo) display.push('Video uploads');
  if (bundle.allowsAnalytics) {
    display.push(bundle.advancedAnalytics ? 'Advanced analytics' : 'Basic analytics');
  }
  display.push(`Up to ${bundle.maxImages} product photo${bundle.maxImages === 1 ? '' : 's'}`);

  return display.length > 0 ? display : ['Core business listing'];
}

export default function BundleSelection({ bundles, selectedBundle, onSelect }: BundleSelectionProps) {
  const sw = useLocale() === 'sw';
  if (!bundles || bundles.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          {sw ? 'Hakuna vifurushi vya usajili vilivyopo' : 'No subscription bundles available'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {sw ? 'Tafadhali jaribu tena baadaye au wasiliana na huduma kwa msaada.' : 'Please try again later or contact support for assistance.'}
        </p>
      </div>
    );
  }

  const columnClass =
    bundles.length === 1
      ? 'grid-cols-1 max-w-xl mx-auto'
      : bundles.length === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div className={`w-full min-w-0 grid gap-4 sm:gap-5 lg:gap-6 ${columnClass}`}>
      {bundles.map((bundle) => {
        const isSelected = selectedBundle?.id === bundle.id;
        const features = bundleFeatures(bundle);

        return (
          <button
            key={bundle.id}
            type="button"
            onClick={() => onSelect(bundle)}
            className={`relative flex w-full min-w-0 flex-col rounded-2xl border-2 p-5 sm:p-6 text-left transition-all ${
              isSelected
                ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/[0.03] dark:bg-primary/10'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-primary/40 hover:shadow-md'
            }`}
          >
            {isSelected && (
              <div
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md"
                style={{ backgroundColor: brandColors.accent }}
              >
                <FiCheck className="h-5 w-5" aria-hidden />
              </div>
            )}

            {bundle.featured && (
              <span
                className="mb-3 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: brandColors.accent }}
              >
                {sw ? 'Maarufu' : 'Popular'}
              </span>
            )}

            <div className="pr-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                {bundle.name}
              </h3>
              {bundle.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {bundle.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-baseline gap-x-1 gap-y-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  TZS {Number(bundle.price).toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  / {bundle.duration} {sw ? 'siku' : 'days'}
                </span>
              </div>
            </div>

            <ul className="mt-5 flex-1 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-4">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
                >
                  <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-500" aria-hidden />
                  <span className="break-words">{feature}</span>
                </li>
              ))}
            </ul>

            <span
              className={`mt-5 block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                isSelected
                  ? 'text-white'
                  : 'border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100'
              }`}
              style={isSelected ? { backgroundColor: brandColors.accent } : undefined}
            >
              {isSelected ? (sw ? 'Kimechaguliwa' : 'Selected') : (sw ? 'Chagua kifurushi' : 'Choose plan')}
            </span>
          </button>
        );
      })}
    </div>
  );
}
