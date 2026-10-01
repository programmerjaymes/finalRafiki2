import PageBreadcrumb from '@/components/PageBreadcrumb';
import ApprovalLogsDataTable from '@/components/admin/businessess/ApprovalLogsDataTable';
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

  const tableLogs = logs.map((log) => ({
    id: log.id,
    approvedAt: log.approvedAt.toISOString(),
    business: log.business,
    approvedBy: log.approvedBy,
  }));

  return (
    <div>
      <PageBreadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Businesses', path: '/businesses' },
          { label: 'Approval Logs' },
        ]}
      />
      <div className="mt-4">
        <ApprovalLogsDataTable logs={tableLogs} />
      </div>
    </div>
  );
}
