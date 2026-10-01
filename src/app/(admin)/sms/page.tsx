import PageBreadcrumb from '@/components/PageBreadcrumb';
import SmsMessaging from '@/components/admin/sms/SmsMessaging';

export default function SmsPage() {
  return (
    <div>
      <PageBreadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'SMS Messaging' },
        ]}
      />
      <div className="mt-4">
        <SmsMessaging />
      </div>
    </div>
  );
}
