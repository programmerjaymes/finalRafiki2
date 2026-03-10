import React from 'react';
import BarChart from '@/components/charts/BarChart';

const BarChartPage = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Bar Chart
          </h4>
        </div>
      </div>

      <div className="h-[355px]">
        <BarChart />
      </div>
    </div>
  );
};

export default BarChartPage;
