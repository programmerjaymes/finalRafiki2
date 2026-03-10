import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Card from "@/components/ui/card/Card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Owner Instructions | Rafiki",
  description: "Instructions on how to use Rafiki as a business owner",
};

export default function InstructionsPage() {
  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/business-dashboard",
    },
    {
      label: "Instructions",
      path: "/business-instructions",
    },
  ];

  return (
    <div>
      <PageBreadcrumb items={breadcrumbItems} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Rafiki Business Owner Instructions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Learn how to make the most of your Rafiki business listing
        </p>
      </div>
      
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                1. Create Your Business
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Navigate to the "Create Business" section and fill out the business information form.
                Provide accurate and complete information to make your business easy to find.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                2. Select a Subscription Bundle
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a subscription bundle that best suits your business needs. Different bundles
                offer different features and visibility options.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                3. Make Payment
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Complete your payment using one of our supported payment methods. Once your payment
                is confirmed, your business will be reviewed by our team.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                4. Get Verified and Approved
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Our team will review your business listing and verify the information provided.
                Once approved, your business will be visible to potential customers on Rafiki.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Managing Your Business</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Updating Business Information
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You can update your business information at any time. Keep your information 
                current to ensure customers can find and contact you easily.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Managing Reviews
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Monitor customer reviews and respond to them professionally. Positive interactions
                with customers can improve your business's reputation.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Renewing Your Subscription
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Make sure to renew your subscription before it expires to keep your business
                visible on Rafiki. You'll receive notifications when your subscription is about to expire.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bundle Information</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Free
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Standard
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Listing Duration
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    30 days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    90 days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    365 days
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Images
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    1
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    5
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    10
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Video Support
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ❌
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ❌
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ✅
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Analytics
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ❌
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    Basic
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    Advanced
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Featured Listing
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ❌
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ❌
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ✅
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            If you have any questions or need assistance, our support team is here to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Email Support
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                support@rafiki.com
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Phone Support
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                +255 123 456 789
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 