import React from 'react';
import PaymentList from '@/components/admin/payments/PaymentList';
import PageBreadcrumb from '@/components/PageBreadcrumb';

const PaymentsPage = () => {
  return (
    <>
      <PageBreadcrumb 
        items={[
          { label: 'Payments' }
        ]}
      />
      
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6 justify-between gap-4 sm:flex">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Payments
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage payment transactions
            </p>
          </div>
        </div>

        <PaymentList />
      </div>
    </>
  );
};

export default PaymentsPage;
