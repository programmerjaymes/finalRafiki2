import React from 'react';
import BundleList from '@/components/admin/bundles/BundleList';

const BundlesPage = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Bundles
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your bundles
          </p>
        </div>
      </div>

      <BundleList />
    </div>
  );
};

export default BundlesPage;
