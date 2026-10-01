import PageBreadcrumb from '@/components/PageBreadcrumb';
import { prisma } from '@/lib/prisma';
import ClearLogsButton from '@/components/admin/logs/ClearLogsButton';

export const dynamic = 'force-dynamic';

function date(value: Date) {
  return value.toLocaleString('en-TZ', { timeZone: 'Africa/Dar_es_Salaam', dateStyle: 'medium', timeStyle: 'short' });
}

export default async function SystemLogsPage() {
  const [logs, audits] = await Promise.all([
    prisma.applicationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.auditTrail.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { actor: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="min-w-0">
      <PageBreadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'System Logs' }]} />
      <section className="mt-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-7 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Observability</p>
        <h1 className="mt-2 text-3xl font-bold">Application & Audit Logs</h1>
        <p className="mt-2 text-sm text-white/75">Review server errors, HTTP 500 failures, and administrative activity.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-red-500/20 px-3 py-2 text-sm">{logs.length} recent application logs</span>
          <span className="rounded-lg bg-blue-500/20 px-3 py-2 text-sm">{audits.length} recent audit entries</span>
          <div className="sm:ml-auto"><ClearLogsButton /></div>
        </div>
      </section>

      <div className="mt-6 space-y-6">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800"><h2 className="font-bold text-gray-900 dark:text-white">Application Errors</h2><p className="text-sm text-gray-500">Unhandled errors and failed server requests</p></div>
          <div className="max-h-[55vh] overflow-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-800"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Message</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.length ? logs.map((log) => <tr key={log.id} className="align-top"><td className="whitespace-nowrap px-4 py-3 text-gray-500">{date(log.createdAt)}</td><td className="px-4 py-3"><span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 dark:bg-red-500/10">{log.level}</span></td><td className="px-4 py-3">{log.statusCode || '—'}</td><td className="px-4 py-3 font-mono text-xs">{log.method} {log.route}</td><td className="max-w-xl px-4 py-3"><p className="font-medium text-gray-800 dark:text-gray-200">{log.message}</p>{log.stack && <details className="mt-1"><summary className="cursor-pointer text-xs text-brand-500">Stack trace</summary><pre className="mt-2 whitespace-pre-wrap rounded bg-gray-950 p-3 text-xs text-gray-200">{log.stack}</pre></details>}</td></tr>) : <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">No application errors recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800"><h2 className="font-bold text-gray-900 dark:text-white">Audit Trail</h2><p className="text-sm text-gray-500">Who performed each administrative action and when</p></div>
          <div className="max-h-[55vh] overflow-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-800"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">IP</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {audits.length ? audits.map((audit) => <tr key={audit.id}><td className="whitespace-nowrap px-4 py-3 text-gray-500">{date(audit.createdAt)}</td><td className="px-4 py-3"><p className="font-medium text-gray-800 dark:text-gray-200">{audit.actor?.name || 'System'}</p><p className="text-xs text-gray-500">{audit.actor?.email}</p></td><td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10">{audit.action}</span></td><td className="px-4 py-3">{audit.entityType}{audit.entityId && <p className="font-mono text-xs text-gray-400">{audit.entityId}</p>}</td><td className="max-w-md px-4 py-3 text-gray-600 dark:text-gray-300">{audit.description || '—'}</td><td className="px-4 py-3 text-xs text-gray-500">{audit.ipAddress || '—'}</td></tr>) : <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No audit activity recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
