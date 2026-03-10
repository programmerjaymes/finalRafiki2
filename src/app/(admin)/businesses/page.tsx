import React from 'react';
import BusinessList from '@/components/admin/businessess/BusinessList';

const BusinessesPage = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Businesses
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage business accounts
          </p>
        </div>
      </div>

      <BusinessList />
    </div>
  );
};

export default BusinessesPage;
