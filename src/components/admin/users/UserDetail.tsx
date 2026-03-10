'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from '@/utils/toast';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'BUSINESS_OWNER' | 'BUSINESS_REGISTRAR' | 'ACCOUNTANT';
  emailVerified?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  businesses?: {
    id: string;
    name: string;
  }[];
  registeredBusinesses?: {
    id: string;
    name: string;
  }[];
  payments?: {
    id: string;
    amount: number;
    paymentStatus: string;
  }[];
}

interface UserDetailProps {
  userId: string;
  onBack?: () => void;
}

export default function UserDetail({ userId, onBack }: UserDetailProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user details: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user details');
      toast.error('Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
      case 'BUSINESS_OWNER':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Business Owner</Badge>;
      case 'BUSINESS_REGISTRAR':
        return <Badge className="bg-green-500 hover:bg-green-600">Business Registrar</Badge>;
      case 'ACCOUNTANT':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Accountant</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-60">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchUserDetails}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-60">
        <p className="text-gray-500 mb-4">User not found</p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="mb-8">
        <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 mr-3 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label="Go back"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              )}
              <div>
                <CardTitle className="text-xl">User Details</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ID: {user.id}
                </p>
              </div>
            </div>
            <Link
              href={`/users/${user.id}/edit`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit User
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">User Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-4 mb-4">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-16 w-16 rounded-full"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xl">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-medium">{user.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <EnvelopeIcon className="h-4 w-4" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Role:</span>
                    <span>{renderRoleBadge(user.role)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email verification:</span>
                    <span>
                      {user.emailVerified ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                      ) : (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last updated:</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(user.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div>
              {user.businesses && user.businesses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Owned Businesses</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {user.businesses.map(business => (
                        <li key={business.id} className="py-3 first:pt-0 last:pb-0">
                          <Link
                            href={`/businesses/${business.id}`}
                            className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                            <span>{business.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {user.registeredBusinesses && user.registeredBusinesses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Registered Businesses</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {user.registeredBusinesses.map(business => (
                        <li key={business.id} className="py-3 first:pt-0 last:pb-0">
                          <Link
                            href={`/businesses/${business.id}`}
                            className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                            <span>{business.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {user.payments && user.payments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Recent Payments</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {user.payments.map(payment => (
                        <li key={payment.id} className="py-3 first:pt-0 last:pb-0">
                          <Link
                            href={`/payments/${payment.id}`}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="flex items-center gap-2">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                              <span>Payment {payment.id.substring(0, 8)}</span>
                            </span>
                            <Badge 
                              className={
                                payment.paymentStatus === 'COMPLETED' 
                                  ? 'bg-green-500' 
                                  : payment.paymentStatus === 'PENDING'
                                  ? 'bg-yellow-500'
                                  : payment.paymentStatus === 'FAILED'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                              }
                            >
                              {payment.paymentStatus}
                            </Badge>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-4 flex justify-end">
          <div className="flex gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Go Back
              </button>
            )}
            
            <Link
              href="/users"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              All Users
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 