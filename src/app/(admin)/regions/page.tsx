import RegionList from '@/components/admin/locations/RegionList';
import { cookies } from 'next/headers';
import { t } from '@/lib/i18n';

export default async function RegionsPage() {
  const locale = (await cookies()).get('rafiki_locale')?.value === 'sw' ? 'sw' : 'en';
  const messages = t(locale);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">{messages.admin.regions}</h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {messages.admin.regionsSubtitle}
        </p>
      </div>
      <RegionList />
    </div>
  );
}
