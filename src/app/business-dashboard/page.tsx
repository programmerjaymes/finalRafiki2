import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Card from "@/components/ui/card/Card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Owner Dashboard | Rafiki",
  description: "Manage your business listings on Rafiki",
};

export default function BusinessOwnerDashboard() {
  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/business-dashboard",
    },
  ];

  return (
    <div>
      <PageBreadcrumb items={breadcrumbItems} />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Welcome to Rafiki</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your business listings and connect with potential customers
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Your Businesses</h3>
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-gray-400">Active Listings</p>
            <span className="text-2xl font-bold text-brand-500">0</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Get Started</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first business listing
          </p>
          <a
            href="/business-create"
            className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            Create Business
          </a>
        </Card>
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 text-brand-500">
              1
            </div>
            <div>
              <h3 className="font-medium">Create your business profile</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Add your business details, contact information, and location
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 text-brand-500">
              2
            </div>
            <div>
              <h3 className="font-medium">Choose a subscription bundle</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Select a bundle that suits your business needs
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 text-brand-500">
              3
            </div>
            <div>
              <h3 className="font-medium">Complete your payment</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Pay for your subscription through mobile money, credit card, or bank transfer
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 text-brand-500">
              4
            </div>
            <div>
              <h3 className="font-medium">Publish your business</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Once approved, your business will be visible to potential customers
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 