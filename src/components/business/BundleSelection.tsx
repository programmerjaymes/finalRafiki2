"use client";
import React from 'react';
import { Bundle } from '@prisma/client';
import Card from '@/components/ui/card/Card';
import Button from '@/components/ui/button/Button';
import { FiCheck } from 'react-icons/fi';

interface BundleSelectionProps {
  bundles: Bundle[];
  selectedBundle: Bundle | null;
  onSelect: (bundle: Bundle) => void;
}

export default function BundleSelection({ bundles, selectedBundle, onSelect }: BundleSelectionProps) {
  if (!bundles || bundles.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold text-gray-700">No subscription bundles available</h3>
        <p className="text-gray-500 mt-2">Please try again later or contact support for assistance.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {bundles.map((bundle) => {
        const isSelected = selectedBundle?.id === bundle.id;
        const features = JSON.parse(bundle.allowedFields);

        return (
          <Card
            key={bundle.id}
            className={`relative p-6 cursor-pointer transition-all ${
              isSelected
                ? 'border-2 border-primary-500 shadow-lg'
                : 'border border-gray-200 hover:border-primary-300'
            }`}
            onClick={() => onSelect(bundle)}
          >
            {isSelected && (
              <div className="absolute -top-3 -right-3 bg-primary-500 rounded-full p-1">
                <FiCheck className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{bundle.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold">KES {bundle.price}</span>
                <span className="text-gray-500">/{bundle.duration} days</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="space-y-2">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                  {bundle.allowsVideo && (
                    <li className="flex items-center text-gray-600">
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                      Video uploads
                    </li>
                  )}
                  {bundle.allowsAnalytics && (
                    <li className="flex items-center text-gray-600">
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                      {bundle.advancedAnalytics ? 'Advanced analytics' : 'Basic analytics'}
                    </li>
                  )}
                  <li className="flex items-center text-gray-600">
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    Up to {bundle.maxImages} images
                  </li>
                </ul>
              </div>
            </div>

            <Button
              variant={isSelected ? "primary" : "outline"}
              className="w-full mt-6"
              onClick={() => onSelect(bundle)}
            >
              {isSelected ? 'Selected' : 'Choose Plan'}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
