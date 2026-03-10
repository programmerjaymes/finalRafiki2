'use client';

import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/card/Card';

// Dynamic imports for chart components
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

// Interface for monthly registrations data
interface MonthlyRegistrationsData {
  month: string;
  users: number;
  businesses: number;
}

// Interface for category data
interface CategoryData {
  name: string;
  count: number;
}

// Interface for bundle data
interface BundleData {
  name: string;
  count: number;
}

// Monthly Registrations Chart Component
export const MonthlyRegistrationsChartClient = ({ data = [] }: { data?: MonthlyRegistrationsData[] }) => {
  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', users: 45, businesses: 31 },
    { month: 'Feb', users: 52, businesses: 40 },
    { month: 'Mar', users: 38, businesses: 28 },
    { month: 'Apr', users: 24, businesses: 18 },
    { month: 'May', users: 33, businesses: 26 },
    { month: 'Jun', users: 56, businesses: 32 },
    { month: 'Jul', users: 42, businesses: 37 },
    { month: 'Aug', users: 60, businesses: 28 },
    { month: 'Sep', users: 51, businesses: 36 },
    { month: 'Oct', users: 68, businesses: 42 },
    { month: 'Nov', users: 79, businesses: 53 },
    { month: 'Dec', users: 91, businesses: 58 }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'Outfit, sans-serif',
      toolbar: {
        show: false,
      },
      height: 280,
    },
    colors: ['#b71131', '#fdd00d'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      row: {
        colors: ['transparent'],
      },
      xaxis: {
        lines: {
          show: false
        }
      },
    },
    xaxis: {
      categories: chartData.map(item => item.month),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm'
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
  };

  const series = [
    {
      name: 'User Registrations',
      data: chartData.map(item => item.users)
    },
    {
      name: 'Business Registrations',
      data: chartData.map(item => item.businesses)
    }
  ];

  return (
    <div className="mt-2">
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={280}
      />
    </div>
  );
};

// Business Categories Chart Component
export const BusinessCategoriesChartClient = ({ data = [] }: { data?: CategoryData[] }) => {
  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { name: 'Restaurants', count: 35 },
    { name: 'Hotels', count: 25 },
    { name: 'Retail', count: 15 },
    { name: 'Professional Services', count: 18 },
    { name: 'Other', count: 7 }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Outfit, sans-serif',
    },
    colors: ['#b71131', '#fdd00d', '#0ba5ec', '#12b76a', '#f79009'],
    labels: chartData.map(item => item.name),
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total Categories',
              fontSize: '16px',
              fontWeight: 600,
              color: '#101828',
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 600,
              color: '#101828',
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const series = chartData.map(item => item.count);

  return (
    <div className="mt-2">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={320}
      />
    </div>
  );
};

// Most Selected Bundles Chart Component
export const MostSelectedBundlesChartClient = ({ data = [] }: { data?: BundleData[] }) => {
  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { name: 'Standard', count: 430 },
    { name: 'Premium', count: 345 },
    { name: 'Basic', count: 268 },
    { name: 'Free Trial', count: 198 },
    { name: 'Enterprise', count: 87 }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Outfit, sans-serif',
      toolbar: {
        show: false,
      },
    },
    colors: ['#b71131'],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        dataLabels: {
          position: 'top',
        },
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + " subscriptions";
      },
      offsetX: 20,
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    xaxis: {
      categories: chartData.map(item => item.name),
    },
    yaxis: {
      labels: {
        show: true
      }
    },
    grid: {
      show: false
    },
  };

  const series = [{
    name: 'Subscriptions',
    data: chartData.map(item => item.count)
  }];

  return (
    <div className="mt-2">
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={300}
      />
    </div>
  );
}; 