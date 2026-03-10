'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from '@/utils/toast';
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserIcon,
  CubeIcon,
  CreditCardIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/common/Loader';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentReference?: string | null;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'MOBILE_MONEY' | 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  business: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  bundle?: {
    id: string;
    name: string;
    price: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentDetailProps {
  paymentId: string;
  onBack?: () => void;
}

export default function PaymentDetail({ paymentId, onBack }: PaymentDetailProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPaymentDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payment details: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPayment(data.payment);
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment details');
      toast.error('Failed to fetch payment details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const handleRefreshStatus = async () => {
    if (!payment || payment.paymentStatus !== 'PENDING' || isRefreshing) {
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      const response = await fetch(`/api/payments/${paymentId}/refresh`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to refresh payment status: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPayment(prev => prev ? { ...prev, ...data.payment } : null);
      
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error refreshing payment status:', error);
      toast.error('Failed to refresh payment status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
  };

  const renderPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'MOBILE_MONEY':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Mobile Money</Badge>;
      case 'CREDIT_CARD':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Credit Card</Badge>;
      case 'PAYPAL':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">PayPal</Badge>;
      case 'BANK_TRANSFER':
        return <Badge className="bg-green-500 hover:bg-green-600">Bank Transfer</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{method}</Badge>;
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
          onClick={fetchPaymentDetails}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col justify-center items-center h-60">
        <p className="text-gray-500 mb-4">Payment not found</p>
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
                <CardTitle className="text-xl">Payment Details</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ID: {payment.id}
                </p>
              </div>
            </div>
            {payment.paymentStatus === 'PENDING' && (
              <button
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                {isRefreshing ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Refresh Status
                  </>
                )}
              </button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium">{formatCurrency(payment.amount, payment.currency)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span>{renderStatusBadge(payment.paymentStatus)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Method:</span>
                    <span>{renderPaymentMethodBadge(payment.paymentMethod)}</span>
                  </div>
                  
                  {payment.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                      <span className="font-mono text-sm">{payment.paymentReference}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created At:</span>
                    <span>{formatDate(payment.createdAt)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Updated At:</span>
                    <span>{formatDate(payment.updatedAt)}</span>
                  </div>
                </div>
              </div>
              
              {payment.bundle && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Bundle Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CubeIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{payment.bundle.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price:</span>
                      <span>{formatCurrency(payment.bundle.price, payment.currency)}</span>
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <Link
                        href={`/bundles/${payment.bundle.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                      >
                        View Bundle
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Business Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{payment.business.name}</span>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <Link
                      href={`/businesses/${payment.business.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      View Business
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">User Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{payment.user.name || payment.user.email}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span>{payment.user.email}</span>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <Link
                      href={`/users/${payment.user.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      View User
                    </Link>
                  </div>
                </div>
              </div>
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
              href="/payments"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              All Payments
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 