'use client';

import React from 'react';
import toast from '@/utils/toast';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

const ConfirmDemo = () => {
  const handleConfirmTest = async () => {
    const result = await toast.confirm(
      'Confirm Action',
      'Are you sure you want to proceed with this action?',
      'question'
    );
    
    if (result.isConfirmed) {
      toast.success('Action confirmed!');
    } else {
      toast.info('Action canceled');
    }
  };
  
  const handleWarningTest = async () => {
    const result = await toast.confirm(
      'Warning',
      'This action cannot be undone. Are you sure?',
      'warning'
    );
    
    if (result.isConfirmed) {
      toast.success('Warning action confirmed!');
    } else {
      toast.info('Warning action canceled');
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Confirmation Dialog Demo" />
      
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-8 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-10">
        <h2 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Confirmation Dialog Examples
        </h2>
        
        <div className="flex flex-wrap gap-5">
          <button
            onClick={handleConfirmTest}
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Standard Confirmation
          </button>
          
          <button
            onClick={handleWarningTest}
            className="inline-flex items-center justify-center rounded-md bg-warning py-2 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            Warning Confirmation
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmDemo; 