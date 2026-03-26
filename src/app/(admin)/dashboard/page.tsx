import React from 'react';
import Card from '@/components/ui/card/Card';
import { 
  MonthlyRegistrationsChartClient, 
  BusinessCategoriesChartClient, 
  MostSelectedBundlesChartClient 
} from '@/components/dashboard/ChartComponents';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { t } from '@/lib/i18n';

async function getMessages() {
  const locale = (await cookies()).get('rafiki_locale')?.value === 'sw' ? 'sw' : 'en';
  return t(locale);
}

// Define interfaces for our custom types
interface CategoryWithSearchCount {
  id: string;
  categoryId: string;
  searchCount: number;
  lastSearched: Date;
  category: {
    name: string;
  };
}

interface LocationWithSearchCount {
  id: string;
  regionId: string;
  searchCount: number;
  lastSearched: Date;
  region: {
    name: string;
  };
}

// Helper to fetch dashboard data
async function getDashboardData() {
  // Get user count
  const userCount = await prisma.user.count();
  
  // Get user growth (users registered in the last 30 days)
  const lastMonthDate = new Date();
  lastMonthDate.setDate(lastMonthDate.getDate() - 30);
  
  const previousMonthDate = new Date(lastMonthDate);
  previousMonthDate.setDate(previousMonthDate.getDate() - 30);
  
  const lastMonthUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: lastMonthDate
      }
    }
  });

  const previousMonthUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: previousMonthDate,
        lt: lastMonthDate
      }
    }
  });

  const userGrowthPercent = previousMonthUsers > 0 
    ? ((lastMonthUsers - previousMonthUsers) / previousMonthUsers) * 100 
    : 0;

  // Get business count
  const businessCount = await prisma.business.count();
  
  // Get business growth
  const lastMonthBusinesses = await prisma.business.count({
    where: {
      createdAt: {
        gte: lastMonthDate
      }
    }
  });

  const previousMonthBusinesses = await prisma.business.count({
    where: {
      createdAt: {
        gte: previousMonthDate,
        lt: lastMonthDate
      }
    }
  });

  const businessGrowthPercent = previousMonthBusinesses > 0 
    ? ((lastMonthBusinesses - previousMonthBusinesses) / previousMonthBusinesses) * 100 
    : 0;

  // Get total payments
  const payments = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      paymentStatus: 'COMPLETED'
    }
  });
  
  const totalPayments = payments._sum.amount || 0;
  
  // Get payment growth
  const lastMonthPayments = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      paymentStatus: 'COMPLETED',
      createdAt: {
        gte: lastMonthDate
      }
    }
  });

  const previousMonthPayments = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      paymentStatus: 'COMPLETED',
      createdAt: {
        gte: previousMonthDate,
        lt: lastMonthDate
      }
    }
  });

  const lastMonthPaymentsTotal = lastMonthPayments._sum.amount || 0;
  const previousMonthPaymentsTotal = previousMonthPayments._sum.amount || 0;

  const paymentGrowthPercent = previousMonthPaymentsTotal > 0 
    ? ((lastMonthPaymentsTotal - previousMonthPaymentsTotal) / previousMonthPaymentsTotal) * 100 
    : 0;

  // Get active bundles
  const activeBundlesCount = await prisma.business.count({
    where: {
      bundleExpiresAt: {
        gte: new Date()
      }
    }
  });
  
  // Get bundle growth
  const lastMonthBundles = await prisma.business.count({
    where: {
      createdAt: {
        gte: lastMonthDate
      },
      bundleExpiresAt: {
        gte: new Date()
      }
    }
  });

  const previousMonthBundles = await prisma.business.count({
    where: {
      createdAt: {
        gte: previousMonthDate,
        lt: lastMonthDate
      },
      bundleExpiresAt: {
        gte: previousMonthDate
      }
    }
  });

  const bundleGrowthPercent = previousMonthBundles > 0 
    ? ((lastMonthBundles - previousMonthBundles) / previousMonthBundles) * 100 
    : 0;

  let topCategories: CategoryWithSearchCount[] = [];
  try {
    // Get most searched categories
    const categoryResults = await prisma.$queryRaw`
      SELECT cs.id, cs.categoryId, cs.searchCount, cs.lastSearched, c.name as categoryName
      FROM category_searches cs
      JOIN categories c ON cs.categoryId = c.id
      ORDER BY cs.searchCount DESC
      LIMIT 5
    ` as Array<{
      id: string;
      categoryId: string;
      searchCount: number;
      lastSearched: Date;
      categoryName: string;
    }>;
    
    // Transform the result to match the expected format
    topCategories = categoryResults.map(item => ({
      id: item.id,
      categoryId: item.categoryId,
      searchCount: item.searchCount,
      lastSearched: item.lastSearched,
      category: {
        name: item.categoryName
      }
    }));
  } catch (e) {
    console.error("Error fetching top categories:", e);
  }

  // Get most searched businesses 
  const topBusinesses = await prisma.business.findMany({
    take: 5,
    orderBy: {
      viewCount: 'desc'
    },
    include: {
      category: {
        select: {
          name: true
        }
      }
    }
  });

  let topLocations: LocationWithSearchCount[] = [];
  try {
    // Get popular locations
    const locationResults = await prisma.$queryRaw`
      SELECT ls.id, ls.regionId, ls.searchCount, ls.lastSearched, r.RegionName as regionName
      FROM location_searches ls
      JOIN regions r ON ls.regionId = r.id
      ORDER BY ls.searchCount DESC
      LIMIT 5
    ` as Array<{
      id: string;
      regionId: bigint;
      searchCount: number;
      lastSearched: Date;
      regionName: string | null;
    }>;
    
    // Transform the result to match the expected format
    topLocations = locationResults.map(item => ({
      id: item.id,
      regionId: item.regionId.toString(),
      searchCount: item.searchCount,
      lastSearched: item.lastSearched,
      region: {
        name: item.regionName || 'Unknown'
      }
    }));
  } catch (e) {
    console.error("Error fetching top locations:", e);
  }

  // Get most selected bundles
  const bundleStats = await prisma.$queryRaw`
    SELECT b.bundleId, COUNT(*) as count, bd.name as bundleName
    FROM businesses b
    JOIN bundles bd ON b.bundleId = bd.id
    GROUP BY b.bundleId, bd.name
    ORDER BY count DESC
    LIMIT 5
  ` as Array<{
    bundleId: string;
    count: number | bigint;
    bundleName: string;
  }>;

  // Transform the bundle stats
  const bundleData = bundleStats.map(item => ({
    name: item.bundleName || 'Unknown',
    count: Number(item.count)
  }));

  // Get monthly registrations for the past 12 months
  const today = new Date();
  const monthlyRegistrations = [];
  
  for (let i = 11; i >= 0; i--) {
    const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
    
    const userCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    const businessCount = await prisma.business.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    monthlyRegistrations.push({
      month: startDate.toLocaleString('default', { month: 'short' }),
      users: userCount,
      businesses: businessCount
    });
  }

  return {
    userCount,
    userGrowthPercent,
    businessCount,
    businessGrowthPercent,
    totalPayments,
    paymentGrowthPercent,
    activeBundlesCount,
    bundleGrowthPercent,
    topCategories,
    topBusinesses,
    topLocations,
    bundleData,
    monthlyRegistrations
  };
}

// Metrics Component
const DashboardMetrics = async () => {
  const data = await getDashboardData();
  const messages = await getMessages();
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Registered Users Metric */}
      <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">{messages.admin.registeredUsers}</span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{data.userCount.toLocaleString()}</h4>
          <div className="flex items-center mt-2">
            <span className={`px-1.5 py-0.5 text-xs ${data.userGrowthPercent >= 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'} rounded`}>
              {data.userGrowthPercent >= 0 ? '+' : ''}{data.userGrowthPercent.toFixed(1)}%
            </span>
            <span className="ml-2 text-xs text-gray-500">{messages.admin.vsLastMonth}</span>
          </div>
        </div>
      </Card>

      {/* Registered Businesses Metric */}
      <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">{messages.admin.registeredBusinesses}</span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{data.businessCount.toLocaleString()}</h4>
          <div className="flex items-center mt-2">
            <span className={`px-1.5 py-0.5 text-xs ${data.businessGrowthPercent >= 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'} rounded`}>
              {data.businessGrowthPercent >= 0 ? '+' : ''}{data.businessGrowthPercent.toFixed(1)}%
            </span>
            <span className="ml-2 text-xs text-gray-500">{messages.admin.vsLastMonth}</span>
          </div>
        </div>
      </Card>

      {/* Total Revenue Metric */}
      <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">{messages.admin.totalMoneyPaid}</span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">${data.totalPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          <div className="flex items-center mt-2">
            <span className={`px-1.5 py-0.5 text-xs ${data.paymentGrowthPercent >= 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'} rounded`}>
              {data.paymentGrowthPercent >= 0 ? '+' : ''}{data.paymentGrowthPercent.toFixed(1)}%
            </span>
            <span className="ml-2 text-xs text-gray-500">{messages.admin.vsLastMonth}</span>
          </div>
        </div>
      </Card>

      {/* Active Bundles Metric */}
      <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div className="mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">{messages.admin.activeBundles}</span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">{data.activeBundlesCount.toLocaleString()}</h4>
          <div className="flex items-center mt-2">
            <span className={`px-1.5 py-0.5 text-xs ${data.bundleGrowthPercent >= 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'} rounded`}>
              {data.bundleGrowthPercent >= 0 ? '+' : ''}{data.bundleGrowthPercent.toFixed(1)}%
            </span>
            <span className="ml-2 text-xs text-gray-500">{messages.admin.vsLastMonth}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Monthly Registrations Chart
const MonthlyRegistrationsChart = async () => {
  const data = await getDashboardData();
  const messages = await getMessages();
  
  return (
    <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{messages.admin.monthlyRegistrations}</h3>
      </div>
      <MonthlyRegistrationsChartClient 
        data={data.monthlyRegistrations} 
      />
    </Card>
  );
};

// Business Categories Chart
const BusinessCategoriesChart = async () => {
  const data = await getDashboardData();
  const messages = await getMessages();
  
  return (
    <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{messages.admin.mostPopularBusinessCategories}</h3>
      </div>
      <BusinessCategoriesChartClient 
        data={data.topCategories.map((item) => ({
          name: item.category.name,
          count: item.searchCount
        }))}
      />
    </Card>
  );
};

// Most Searched Businesses Table
const MostSearchedBusinesses = async () => {
  const data = await getDashboardData();
  const messages = await getMessages();
  
  return (
    <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{messages.admin.mostSearchedBusinesses}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                {messages.admin.businessName}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                {messages.admin.category}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                {messages.admin.views}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                {messages.admin.rating}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-transparent dark:divide-gray-700">
            {data.topBusinesses.map((business) => (
              <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {business.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {business.category?.name || messages.admin.uncategorized}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {business.viewCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300">
                    {business.avgRating?.toFixed(1) || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
            
            {data.topBusinesses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {messages.admin.noBusinessData}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Popular Locations Map
const PopularLocationsMap = async () => {
  const data = await getDashboardData();
  const messages = await getMessages();
  
  // Calculate percentages
  const totalSearches = data.topLocations.reduce((sum: number, location) => sum + location.searchCount, 0);
  const locationsWithPercentage = data.topLocations.map((location) => ({
    region: location.region.name,
    usagePercentage: totalSearches > 0 ? (location.searchCount / totalSearches) * 100 : 0
  }));
  
  return (
    <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{messages.admin.popularLocations}</h3>
      </div>
      <div className="mt-4">
        {locationsWithPercentage.map((location, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{location.region}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{location.usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${location.usagePercentage}%` }}></div>
            </div>
          </div>
        ))}
        
        {locationsWithPercentage.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            {messages.admin.noLocationData}
          </div>
        )}
      </div>
    </Card>
  );
};

// Most Selected Bundles Chart
const MostSelectedBundlesChart = async () => {
  const data = await getDashboardData();
  const messages = await getMessages();
  
  return (
    <Card className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{messages.admin.mostSelectedBundles}</h3>
      </div>
      <MostSelectedBundlesChartClient 
        data={data.bundleData}
      />
    </Card>
  );
};

const DashboardPage = async () => {
  const messages = await getMessages();
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">{messages.admin.adminDashboardTitle}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{messages.admin.adminDashboardSubtitle}</p>
      </div>

      {/* Dashboard Metrics */}
      <DashboardMetrics />

      {/* Monthly Registrations and Categories */}
      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <MonthlyRegistrationsChart />
        <BusinessCategoriesChart />
      </div>

      {/* Most Searched Businesses */}
      <div className="mt-8">
        <MostSearchedBusinesses />
      </div>

      {/* Bundle and Locations */}
      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
        <MostSelectedBundlesChart />
        <PopularLocationsMap />
      </div>
    </>
  );
};

export default DashboardPage;
