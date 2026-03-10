'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from '@/utils/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Pagination from '@/components/Pagination';
import Loader from '@/components/common/Loader';
import { Badge } from '@/components/ui/badge';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useRouter } from 'next/navigation';

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
  };
  bundle?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedPayments {
  payments: Payment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

export default function PaymentList() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build URL with query parameters
      const url = new URL('/api/payments', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }
      
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }
      
      if (methodFilter) {
        url.searchParams.append('method', methodFilter);
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.statusText}`);
      }
      
      const data: PaginatedPayments = await response.json();
      setPayments(data.payments);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      toast.error('Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, limit, searchQuery, statusFilter, methodFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleRefreshStatus = async (paymentId: string) => {
    setRefreshingId(paymentId);
    
    try {
      const response = await fetch(`/api/payments/${paymentId}/refresh`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to refresh payment status: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update the payment in the local state
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId ? { ...payment, ...data.payment } : payment
        )
      );
      
      toast.success('Payment status updated successfully');
    } catch (error) {
      console.error('Error refreshing payment status:', error);
      toast.error('Failed to refresh payment status');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleViewDetails = (paymentId: string) => {
    router.push(`/payments/${paymentId}`);
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

  return (
    <div className="w-full">
      <Card className="mb-8">
        <CardHeader className="bg-gray-50 dark:bg-gray-700">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-xl">Payments</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search payments..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
              
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={methodFilter || 'all'}
                onValueChange={(value) => setMethodFilter(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="PAYPAL">PayPal</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Loader />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40 text-red-500">
              {error}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40 text-gray-500">
              <p>No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleViewDetails(payment.id)}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <span className="truncate max-w-[150px] block" title={payment.id}>
                          {payment.id.substring(0, 8)}...
                        </span>
                        {payment.paymentReference && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1" title={payment.paymentReference}>
                            Ref: {payment.paymentReference.substring(0, 10)}...
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {renderStatusBadge(payment.paymentStatus)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {renderPaymentMethodBadge(payment.paymentMethod)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/businesses/${payment.business.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {payment.business.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/users/${payment.user.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {payment.user.name || payment.user.email}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshStatus(payment.id);
                          }}
                          disabled={refreshingId === payment.id || payment.paymentStatus !== 'PENDING'}
                          className={`p-2 rounded ${
                            payment.paymentStatus === 'PENDING'
                              ? 'bg-blue-50 text-blue-500 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                          }`}
                          title={
                            payment.paymentStatus === 'PENDING'
                              ? 'Refresh payment status'
                              : 'Only pending payments can be refreshed'
                          }
                        >
                          {refreshingId === payment.id ? (
                            <span className="animate-spin">
                              <ArrowPathIcon className="h-5 w-5" />
                            </span>
                          ) : (
                            <ArrowPathIcon className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!isLoading && payments.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium">{payments.length}</span> of{' '}
            <span className="font-medium">{total}</span> payments
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
} 