import React from 'react';
import PaymentDetail from '@/components/admin/payments/PaymentDetail';
import PageBreadcrumb from '@/components/PageBreadcrumb';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;
  
  return (
    <>
      <PageBreadcrumb 
        items={[
          { label: 'Payments', path: '/payments' },
          { label: 'Payment Details' }
        ]}
      />
      
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <PaymentDetail paymentId={id} />
      </div>
    </>
  );
} 