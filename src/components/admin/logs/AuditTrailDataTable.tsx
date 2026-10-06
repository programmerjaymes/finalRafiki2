'use client';

import { useMemo, useState } from 'react';
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DataTable, { type Column } from '@/components/tables/DataTable';

type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { name: string; email: string | null } | null;
  source: string;
};

const PAGE_SIZE = 10;

function formatLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AuditTrailDataTable({ audits }: { audits: AuditRow[] }) {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('ALL');
  const [entity, setEntity] = useState('ALL');
  const [actor, setActor] = useState('ALL');
  const [source, setSource] = useState('ALL');
  const [page, setPage] = useState(1);

  const actions = useMemo(() => [...new Set(audits.map((item) => item.action))].sort(), [audits]);
  const entities = useMemo(() => [...new Set(audits.map((item) => item.entityType))].sort(), [audits]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return audits.filter((item) => {
      const matchesSearch = !term || [item.actor?.name, item.actor?.email, item.action, item.entityType, item.entityId, item.description, item.ipAddress]
        .some((value) => value?.toLowerCase().includes(term));
      const matchesAction = action === 'ALL' || item.action === action;
      const matchesEntity = entity === 'ALL' || item.entityType === entity;
      const matchesActor = actor === 'ALL' || (actor === 'SYSTEM' ? !item.actor : Boolean(item.actor));
      const matchesSource = source === 'ALL' || item.source === source;
      return matchesSearch && matchesAction && matchesEntity && matchesActor && matchesSource;
    });
  }, [audits, search, action, entity, actor, source]);

  const resetFilters = () => { setSearch(''); setAction('ALL'); setEntity('ALL'); setActor('ALL'); setSource('ALL'); setPage(1); };
  const hasFilters = Boolean(search || action !== 'ALL' || entity !== 'ALL' || actor !== 'ALL' || source !== 'ALL');

  const columns: Column<AuditRow>[] = [
    { key: 'serial', header: 'S/N', cell: (_, index) => <span className="font-semibold text-gray-700 dark:text-gray-300">{(page - 1) * PAGE_SIZE + index + 1}</span> },
    { key: 'createdAt', header: 'Time', sortable: true, sortFn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(), cell: (item) => <span className="whitespace-nowrap">{new Date(item.createdAt).toLocaleString('en-TZ', { timeZone: 'Africa/Dar_es_Salaam', dateStyle: 'medium', timeStyle: 'short' })}</span> },
    { key: 'actor', header: 'Actor', sortable: true, sortFn: (a, b) => (a.actor?.name || 'System').localeCompare(b.actor?.name || 'System'), cell: (item) => <div><p className="font-medium text-gray-800 dark:text-gray-200">{item.actor?.name || 'System'}</p><p className="text-xs text-gray-500">{item.actor?.email || (item.actor ? 'No email' : 'Automated action')}</p></div> },
    { key: 'source', header: 'Source', sortable: true, cell: (item) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.source === 'APP' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>{item.source}</span> },
    { key: 'action', header: 'Action', sortable: true, sortFn: (a, b) => a.action.localeCompare(b.action), cell: (item) => <span className="inline-flex whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">{formatLabel(item.action)}</span> },
    { key: 'entityType', header: 'Entity', sortable: true, sortFn: (a, b) => a.entityType.localeCompare(b.entityType), cell: (item) => <div><p className="font-medium text-gray-700 dark:text-gray-300">{item.entityType}</p>{item.entityId && <p className="max-w-44 truncate font-mono text-xs text-gray-400" title={item.entityId}>{item.entityId}</p>}</div> },
    { key: 'description', header: 'Description', sortable: true, sortFn: (a, b) => (a.description || '').localeCompare(b.description || ''), cell: (item) => <p className="max-w-md text-gray-600 dark:text-gray-300">{item.description || '—'}</p> },
    { key: 'ipAddress', header: 'IP Address', sortable: true, sortFn: (a, b) => (a.ipAddress || '').localeCompare(b.ipAddress || ''), cell: (item) => <span className="whitespace-nowrap font-mono text-xs">{item.ipAddress || '—'}</span> },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800"><h2 className="font-bold text-gray-900 dark:text-white">Audit Trail</h2><p className="text-sm text-gray-500">Search and filter user, administrator, and system activity.</p></div>
      <div className="border-b border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_190px_170px_140px_120px_auto]">
          <label className="relative"><MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search actor, action, description, IP..." className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></label>
          <select value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><option value="ALL">All actions</option>{actions.map((value) => <option key={value} value={value}>{formatLabel(value)}</option>)}</select>
          <select value={entity} onChange={(event) => { setEntity(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><option value="ALL">All entity types</option>{entities.map((value) => <option key={value} value={value}>{value}</option>)}</select>
          <select value={actor} onChange={(event) => { setActor(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><option value="ALL">All actors</option><option value="USER">Users</option><option value="SYSTEM">System</option></select>
          <select value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><option value="ALL">All sources</option><option value="APP">App</option><option value="WEB">Web</option></select>
          <button type="button" onClick={resetFilters} disabled={!hasFilters} className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"><XMarkIcon className="h-4 w-4" />Clear</button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500"><FunnelIcon className="h-4 w-4" />Showing {filtered.length} of {audits.length} audit entries</div>
      </div>
      <div className="max-h-[65vh] overflow-auto"><DataTable data={filtered} columns={columns} keyExtractor={(item) => item.id} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} showPagination className="rounded-none border-0 shadow-none" /></div>
    </section>
  );
}
