import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Card from "@/components/ui/card/Card";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Business Owner Dashboard | Rafiki",
  description: "Manage your business listings on Rafiki",
};

export default async function BusinessOwnerDashboard() {
  const sw = (await cookies()).get('rafiki_locale')?.value === 'sw';
  const text = (en: string, swText: string) => sw ? swText : en;
  const breadcrumbItems = [
    {
      label: text("Dashboard", "Dashibodi"),
      path: "/business-dashboard",
    },
  ];

  return (
    <div>
      <PageBreadcrumb items={breadcrumbItems} />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">{text('Welcome to Rafiki', 'Karibu Rafiki')}</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {text('Manage your business listings and connect with potential customers', 'Simamia orodha za biashara zako na uungane na wateja watarajiwa')}
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">{text('Your Businesses', 'Biashara Zako')}</h3>
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-gray-400">{text('Active Listings', 'Orodha Zinazotumika')}</p>
            <span className="text-2xl font-bold text-brand-500">0</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">{text('Get Started', 'Anza Sasa')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {text('Create your first business listing', 'Sajili biashara yako ya kwanza')}
          </p>
          <a
            href="/business-create"
            className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            {text('Create Business', 'Sajili Biashara')}
          </a>
        </Card>
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{text('Next Steps', 'Hatua Zinazofuata')}</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 text-brand-500">
              1
            </div>
            <div>
              <h3 className="font-medium">{text('Create your business profile', 'Tengeneza wasifu wa biashara yako')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {text('Add your business details, contact information, and location', 'Ongeza maelezo ya biashara, mawasiliano na eneo lako')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 text-brand-500">
              2
            </div>
            <div>
              <h3 className="font-medium">{text('Choose a subscription bundle', 'Chagua kifurushi cha usajili')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {text('Select a bundle that suits your business needs', 'Chagua kifurushi kinachofaa mahitaji ya biashara yako')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 text-brand-500">
              3
            </div>
            <div>
              <h3 className="font-medium">{text('Complete your payment', 'Kamilisha malipo yako')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {text('Pay for your subscription through mobile money, credit card, or bank transfer', 'Lipia usajili kwa pesa ya simu, kadi au benki')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 text-brand-500">
              4
            </div>
            <div>
              <h3 className="font-medium">{text('Publish your business', 'Chapisha biashara yako')}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {text('Once approved, your business will be visible to potential customers', 'Baada ya kuidhinishwa, biashara yako itaonekana kwa wateja watarajiwa')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
