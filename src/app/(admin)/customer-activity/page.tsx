import Link from 'next/link';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const formatDate = (value: Date) =>
  value.toLocaleString('en-TZ', {
    timeZone: 'Africa/Dar_es_Salaam',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const actionLabels: Record<string, string> = {
  PHONE: 'Phone call',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  WEBSITE: 'Website',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  TWITTER: 'Twitter',
  BOOKING: 'Booking',
  CONTACT: 'Contact',
};

export default async function CustomerActivityPage() {
  type ActivityRow = { id: string; eventType: string; action: string | null; createdAt: Date; userId: string | null; userName: string | null; userEmail: string | null; userPhone: string | null; businessId: string; businessName: string };
  type CountRow = { count: bigint };
  const [events, views, clicks, customers] = await Promise.all([
    prisma.$queryRaw<ActivityRow[]>`
      SELECT e.id, e."eventType", e.action, e."createdAt", e."userId",
             u.name AS "userName", u.email AS "userEmail", u.phone AS "userPhone",
             b.id AS "businessId", b.name AS "businessName"
      FROM "business_events" e
      JOIN "businesses" b ON b.id = e."businessId"
      LEFT JOIN "users" u ON u.id = e."userId"
      ORDER BY e."createdAt" DESC LIMIT 500
    `,
    prisma.$queryRaw<CountRow[]>`SELECT COUNT(*)::bigint AS count FROM "business_events" WHERE "eventType" = 'VIEW'`,
    prisma.$queryRaw<CountRow[]>`SELECT COUNT(*)::bigint AS count FROM "business_events" WHERE "eventType" = 'CLICK'`,
    prisma.$queryRaw<CountRow[]>`SELECT COUNT(DISTINCT "userId")::bigint AS count FROM "business_events" WHERE "userId" IS NOT NULL`,
  ]);
  const totalViews = Number(views[0]?.count || 0);
  const totalClicks = Number(clicks[0]?.count || 0);
  const signedInCustomers = Number(customers[0]?.count || 0);

  return (
    <div className="min-w-0">
      <PageBreadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Customer Activity' }]} />

      <section className="rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-7 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Business engagement</p>
        <h1 className="mt-2 text-3xl font-bold">Customer Visits & Clicks</h1>
        <p className="mt-2 text-sm text-white/80">See who viewed a business page and who clicked its contact actions.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/15 px-4 py-3"><p className="text-xs text-white/70">Page visits</p><p className="text-2xl font-bold">{totalViews.toLocaleString()}</p></div>
          <div className="rounded-xl bg-white/15 px-4 py-3"><p className="text-xs text-white/70">Business clicks</p><p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p></div>
          <div className="rounded-xl bg-white/15 px-4 py-3"><p className="text-xs text-white/70">Signed-in customers</p><p className="text-2xl font-bold">{signedInCustomers.toLocaleString()}</p></div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent activity</h2>
          <p className="text-sm text-gray-500">Showing the latest 500 visits and clicks. Customers who were not signed in appear as Anonymous visitor.</p>
        </div>
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-800">
              <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Business</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(event.createdAt)}</td>
                  <td className="px-4 py-3"><p className="font-semibold text-gray-900 dark:text-white">{event.userName || 'Anonymous visitor'}</p>{event.userId && <Link href={`/users/${event.userId}`} className="text-xs text-brand-500 hover:underline">View customer</Link>}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{event.userEmail || event.userPhone || 'Not available'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${event.eventType === 'CLICK' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'}`}>{event.eventType === 'CLICK' ? `Clicked: ${actionLabels[event.action || 'CONTACT'] || event.action}` : 'Viewed page'}</span></td>
                  <td className="px-4 py-3"><Link href={`/businesses/${event.businessId}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">{event.businessName}</Link></td>
                </tr>
              ))}
              {!events.length && <tr><td colSpan={5} className="px-5 py-14 text-center text-gray-500">No customer activity has been recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
