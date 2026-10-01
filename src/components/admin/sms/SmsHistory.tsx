'use client';

import { useEffect, useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon, MagnifyingGlassIcon, PencilSquareIcon, WalletIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Pagination from '@/components/Pagination';

type Message = {
  id: string;
  recipientName: string;
  phone: string;
  message: string;
  status: 'SENT' | 'FAILED';
  errorMessage: string | null;
  gatewaySenderId: string | null;
  createdAt: string;
  sentBy: { id: string; name: string; email: string | null } | null;
};

type Tab = 'SENT' | 'FAILED';

export default function SmsHistory({ refreshKey, onCompose }: { refreshKey: number; onCompose: () => void }) {
  const [tab, setTab] = useState<Tab>('SENT');
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ sent: 0, failed: 0 });
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualRefresh, setManualRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ status: tab, page: String(page), limit: '20' });
        if (search.trim()) params.set('search', search.trim());
        const response = await fetch(`/api/sms/history?${params}`, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Failed to load SMS history');
        const data = await response.json();
        setMessages(data.messages || []);
        setTotalPages(data.meta?.totalPages || 1);
        setCounts({ sent: data.meta?.sentTotal || 0, failed: data.meta?.failedTotal || 0 });
        setBalance(typeof data.meta?.creditsRemaining === 'number' ? data.meta.creditsRemaining : null);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) console.error(error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [tab, page, search, refreshKey, manualRefresh]);

  const changeTab = (next: Tab) => { setTab(next); setPage(1); };

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">SMS Delivery History</h2>
          <p className="mt-1 text-sm text-gray-500">Track successful and failed messages, recipients, and senders.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"><WalletIcon className="h-4 w-4" /><span>SMS Balance:</span><span className="text-base">{balance === null ? '—' : balance.toLocaleString()}</span></div>
          <button type="button" onClick={onCompose} className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"><PencilSquareIcon className="h-4 w-4" />Write New SMS</button>
          <button onClick={() => changeTab('SENT')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'SENT' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
            <CheckCircleIcon className="h-4 w-4" /> Inbox <span className="rounded-full bg-white/20 px-1.5 text-xs">{counts.sent}</span>
          </button>
          <button onClick={() => changeTab('FAILED')} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'FAILED' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
            <XCircleIcon className="h-4 w-4" /> Outbox <span className="rounded-full bg-white/20 px-1.5 text-xs">{counts.failed}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search recipient, phone, message or sender..." className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </div>
        <button onClick={() => setManualRefresh((value) => value + 1)} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="max-h-[55vh] overflow-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Message</th><th className="px-4 py-3">Sent by</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">Loading SMS history...</td></tr> : messages.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">No {tab === 'SENT' ? 'successful' : 'failed'} messages recorded yet.</td></tr> : messages.map((item) => (
              <tr key={item.id} className="align-top hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                <td className="whitespace-nowrap px-4 py-4 text-gray-500">{new Date(item.createdAt).toLocaleString('en-TZ', { timeZone: 'Africa/Dar_es_Salaam', dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td className="px-4 py-4"><p className="font-semibold text-gray-900 dark:text-white">{item.recipientName}</p><p className="mt-1 text-xs text-gray-500">{item.phone}</p></td>
                <td className="max-w-md px-4 py-4"><p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{item.message}</p>{item.errorMessage && <p className="mt-2 text-xs font-medium text-red-600">{item.errorMessage}</p>}</td>
                <td className="px-4 py-4"><p className="font-medium text-gray-800 dark:text-gray-200">{item.sentBy?.name || 'System'}</p><p className="mt-1 text-xs text-gray-500">{item.sentBy?.email}</p></td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'SENT' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>{item.status === 'SENT' ? 'Delivered' : 'Failed'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <div className="flex justify-center overflow-x-auto border-t border-gray-100 p-4 dark:border-gray-800"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
    </section>
  );
}
