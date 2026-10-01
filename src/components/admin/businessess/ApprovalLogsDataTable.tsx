'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FiCheckCircle, FiSearch } from 'react-icons/fi';
import DataTable, { type Column } from '@/components/tables/DataTable';

type ApprovalLog = {
  id: string;
  approvedAt: string;
  business: {
    id: string;
    name: string;
    owner: { name: string; email: string | null; phone: string | null };
  };
  approvedBy: {
    id: string;
    name: string;
    email: string | null;
    role: string;
  } | null;
};

const PAGE_SIZE = 10;

export default function ApprovalLogsDataTable({ logs }: { logs: ApprovalLog[] }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return logs;

    return logs.filter((log) =>
      [
        log.business.name,
        log.business.owner.name,
        log.business.owner.email,
        log.business.owner.phone,
        log.approvedBy?.name,
        log.approvedBy?.email,
        log.approvedBy?.role,
      ].some((value) => value?.toLowerCase().includes(term)),
    );
  }, [logs, search]);

  const columns: Column<ApprovalLog>[] = [
    {
      key: 'serialNumber',
      header: 'S/N',
      cell: (_, index) => (
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {(currentPage - 1) * PAGE_SIZE + index + 1}
        </span>
      ),
    },
    {
      key: 'business',
      header: 'Business',
      sortable: true,
      sortFn: (a, b) => a.business.name.localeCompare(b.business.name),
      cell: (log) => (
        <Link
          href={`/businesses/${log.business.id}`}
          className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          {log.business.name}
        </Link>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      sortable: true,
      sortFn: (a, b) => a.business.owner.name.localeCompare(b.business.owner.name),
      cell: (log) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white/90">{log.business.owner.name}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {log.business.owner.email || log.business.owner.phone || 'No contact'}
          </p>
        </div>
      ),
    },
    {
      key: 'approvedBy',
      header: 'Approved by',
      sortable: true,
      sortFn: (a, b) => (a.approvedBy?.name || '').localeCompare(b.approvedBy?.name || ''),
      cell: (log) =>
        log.approvedBy ? (
          <div>
            <p className="font-medium text-gray-800 dark:text-white/90">{log.approvedBy.name}</p>
            <p className="mt-0.5 text-xs text-gray-500">{log.approvedBy.email || log.approvedBy.role}</p>
          </div>
        ) : (
          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Legacy approval
          </span>
        ),
    },
    {
      key: 'approvedAt',
      header: 'Approved at',
      sortable: true,
      sortFn: (a, b) => new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime(),
      cell: (log) => (
        <div className="whitespace-nowrap">
          <p className="font-medium text-gray-800 dark:text-white/90">
            {new Date(log.approvedAt).toLocaleDateString('en-TZ', {
              dateStyle: 'medium',
              timeZone: 'Africa/Dar_es_Salaam',
            })}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {new Date(log.approvedAt).toLocaleTimeString('en-TZ', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Africa/Dar_es_Salaam',
            })}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-white/75">Business administration</p>
            <h1 className="mt-1 text-2xl font-bold">Business Approval Logs</h1>
            <p className="mt-2 text-sm text-white/80">
              A permanent audit trail showing when each business was approved and by whom.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <FiCheckCircle className="h-7 w-7" />
            <div>
              <p className="text-xs text-white/75">Total approvals</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative max-w-md">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search business, owner or approver..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:text-white/90"
          />
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredLogs.length} of {logs.length} approval records
        </p>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={(log) => log.id}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        showPagination
      />
    </div>
  );
}
