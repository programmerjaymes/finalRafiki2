import React from 'react';
import BasicTable from '@/components/tables/BasicTable';

const BasicTablesPage = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Basic Tables
          </h4>
        </div>
      </div>

      <BasicTable />
    </div>
  );
};

export default BasicTablesPage;
