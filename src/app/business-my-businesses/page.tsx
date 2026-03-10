"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

// Define a Business interface to match our schema
interface Business {
  id: string;
  name: string;
  isVerified: boolean;
  isApproved: boolean;
  category: {
    name: string;
  };
  bundleExpiresAt: string;
  avgRating: number;
  viewCount: number;
}

export default function MyBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbItems = [
    {
      label: "Dashboard",
      path: "/business-dashboard",
    },
    {
      label: "My Businesses",
      path: "/business-my-businesses",
    },
  ];

  useEffect(() => {
    // In a real application, we would fetch the businesses from the API
    // For now, we'll use some mock data
    const mockBusinesses: Business[] = [
      {
        id: "1",
        name: "The Good Restaurant",
        isVerified: true,
        isApproved: true,
        category: {
          name: "Restaurant"
        },
        bundleExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        avgRating: 4.5,
        viewCount: 123
      },
      {
        id: "2",
        name: "Tech Solutions Ltd",
        isVerified: true,
        isApproved: false,
        category: {
          name: "Technology"
        },
        bundleExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        avgRating: 4.0,
        viewCount: 45
      }
    ];

    // Simulate API fetch delay
    setTimeout(() => {
      setBusinesses(mockBusinesses);
      setIsLoading(false);
    }, 500);

    // In a real app, you would fetch from an API like this:
    // const fetchBusinesses = async () => {
    //   try {
    //     const response = await fetch('/api/business-owner/businesses');
    //     const data = await response.json();
    //     setBusinesses(data);
    //   } catch (error) {
    //     console.error('Error fetching businesses:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchBusinesses();
  }, []);

  // Format date to show days remaining
  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge color based on verification and approval status
  const getStatusBadge = (isVerified: boolean, isApproved: boolean) => {
    if (isVerified && isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Active
        </span>
      );
    } else if (isVerified && !isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          Pending Approval
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          Pending Verification
        </span>
      );
    }
  };

  return (
    <div>
      <PageBreadcrumb items={breadcrumbItems} />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Businesses
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your business listings
          </p>
        </div>
        <Link href="/business-create">
          <Button>
            Add New Business
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </Card>
      ) : businesses.length === 0 ? (
        <Card className="p-10 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No businesses found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You haven't created any business listings yet.
          </p>
          <Link href="/business-create">
            <Button>
              Create Your First Business
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {business.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {business.category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(business.isVerified, business.isApproved)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getDaysRemaining(business.bundleExpiresAt)} days left
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {business.avgRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {business.viewCount} views
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-brand-500 hover:text-brand-600"
                          title="View Business"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="text-blue-500 hover:text-blue-600"
                          title="Edit Business"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-600"
                          title="Delete Business"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
} 