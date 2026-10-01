import Link from 'next/link';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function BusinessApprovalLogsPage() {
  const logs = await prisma.businessApprovalLog.findMany({
    orderBy: { approvedAt: 'desc' },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          owner: { select: { name: true, email: true, phone: true } },
        },
      },
      approvedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  return (
    <div>
      <PageBreadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Businesses', path: '/businesses' },
          { label: 'Approval Logs' },
        ]}
      />

      <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Approval Logs</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            A permanent record of when each business was approved and who approved it.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            No business approvals have been recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Business</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Owner</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Approved by</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Approved at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    <td className="px-5 py-4">
                      <Link
                        href={`/businesses/${log.business.id}`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {log.business.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="font-medium">{log.business.owner.name}</div>
                      <div className="text-xs text-gray-500">
                        {log.business.owner.email || log.business.owner.phone || 'No contact'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {log.approvedBy ? (
                        <>
                          <div className="font-medium">{log.approvedBy.name}</div>
                          <div className="text-xs text-gray-500">{log.approvedBy.email || log.approvedBy.role}</div>
                        </>
                      ) : (
                        <span className="text-gray-500">Legacy approval</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {log.approvedAt.toLocaleString('en-TZ', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Africa/Dar_es_Salaam',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
