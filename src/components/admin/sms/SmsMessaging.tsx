'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import toast from '@/utils/toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

type SmsUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
};

type SendResult = {
  success: boolean;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  creditsRemaining?: number;
  results: Array<{ userId: string; name: string; phone: string; success: boolean; error?: string }>;
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  BUSINESS_OWNER: 'Business Owner',
  BUSINESS_REGISTRAR: 'Business Registrar',
  ACCOUNTANT: 'Accountant',
};

function smsSegments(message: string) {
  if (!message) return 0;
  const unicode = /[^\u0000-\u007f]/.test(message);
  const singleLimit = unicode ? 70 : 160;
  const multipartLimit = unicode ? 67 : 153;
  return message.length <= singleLimit ? 1 : Math.ceil(message.length / multipartLimit);
}

export default function SmsMessaging() {
  const [users, setUsers] = useState<SmsUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastResult, setLastResult] = useState<SendResult | null>(null);

  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users?page=1&limit=500', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load users');
        const data = await response.json();
        if (active) setUsers((data.users || []).filter((user: SmsUser) => Boolean(user.phone?.trim())));
      } catch (error) {
        console.error(error);
        toast.error('Failed to load SMS recipients');
      } finally {
        if (active) setLoadingUsers(false);
      }
    };
    loadUsers();
    return () => { active = false; };
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, user.phone, roleLabels[user.role] || user.role]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [search, users]);

  const segments = smsSegments(message);
  const estimatedCredits = segments * selectedIds.size;
  const confirmMessage = `You are about to send this message to ${selectedIds.size} recipient${selectedIds.size === 1 ? '' : 's'}. Estimated usage is ${estimatedCredits} SMS credit${estimatedCredits === 1 ? '' : 's'}. This action cannot be recalled after dispatch.`;
  const allVisibleSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selectedIds.has(user.id));

  const toggleUser = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredUsers.forEach((user) => {
        if (allVisibleSelected) next.delete(user.id);
        else next.add(user.id);
      });
      return next;
    });
  };

  const dispatch = async () => {
    if (selectedIds.size === 0 || !message.trim()) return;
    setShowConfirm(false);

    setSending(true);
    setLastResult(null);
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: [...selectedIds], message: message.trim() }),
      });
      const data = await response.json();
      if (!response.ok && !data.results) throw new Error(data.error || 'Failed to send SMS');

      setLastResult(data);
      if (data.sentCount > 0) {
        toast.success(`${data.sentCount} SMS message${data.sentCount === 1 ? '' : 's'} sent`);
      }
      if (data.failedCount > 0) toast.error(`${data.failedCount} message${data.failedCount === 1 ? '' : 's'} failed`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-blue-500 px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Communications</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">SMS Messaging</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
              Send branded transactional messages to one user or a selected group.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
            <PaperAirplaneIcon className="h-7 w-7" />
            <div><p className="text-xs text-white/70">Sender ID</p><p className="font-bold">RAFIKIAPP</p></div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-5 dark:border-gray-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Choose recipients</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedIds.size} of {users.length} users selected</p>
              </div>
              <UserGroupIcon className="h-7 w-7 text-brand-500" />
            </div>
            <div className="relative mt-4">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or phone..."
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent pl-11 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/50">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible} className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
              Select all visible
            </label>
            <span className="text-xs text-gray-500">Only users with phone numbers</span>
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            {loadingUsers ? (
              <div className="flex h-48 items-center justify-center text-sm text-gray-500">Loading recipients...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-gray-500">No eligible users found.</div>
            ) : filteredUsers.map((user) => (
              <label key={user.id} className="flex cursor-pointer items-center gap-4 border-b border-gray-100 px-5 py-4 transition hover:bg-brand-50/40 dark:border-gray-800 dark:hover:bg-brand-500/5">
                <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => toggleUser(user.id)} className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"><PhoneIcon className="h-4 w-4" />{user.phone}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{roleLabels[user.role] || user.role}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 xl:sticky xl:top-24">
          <h2 className="font-bold text-gray-900 dark:text-white">Compose message</h2>
          <p className="mt-1 text-sm text-gray-500">Your message is sent separately to every selected user.</p>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 1000))}
            rows={8}
            placeholder="Type your SMS message..."
            className="mt-5 w-full resize-none rounded-xl border border-gray-300 bg-transparent p-4 text-sm leading-6 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:text-white"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{message.length}/1000 characters</span>
            <span>{segments} segment{segments === 1 ? '' : 's'} per recipient</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-xs text-gray-500">Recipients</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{selectedIds.size}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-xs text-gray-500">Estimated credits</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{estimatedCredits}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={sending || selectedIds.size === 0 || !message.trim()}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            {sending ? 'Dispatching messages...' : selectedIds.size === 1 ? 'Send SMS' : 'Send Group SMS'}
          </button>

          {lastResult && (
            <div className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {lastResult.failedCount === 0 ? <CheckCircleIcon className="h-6 w-6 text-emerald-500" /> : <XCircleIcon className="h-6 w-6 text-amber-500" />}
                <p className="font-semibold text-gray-900 dark:text-white">Dispatch complete</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-500">Sent <span className="float-right font-semibold text-emerald-600">{lastResult.sentCount}</span></p>
                <p className="text-gray-500">Failed <span className="float-right font-semibold text-red-600">{lastResult.failedCount}</span></p>
                <p className="text-gray-500">Skipped <span className="float-right font-semibold text-gray-700 dark:text-gray-300">{lastResult.skippedCount}</span></p>
                <p className="text-gray-500">Credits left <span className="float-right font-semibold text-gray-700 dark:text-gray-300">{lastResult.creditsRemaining ?? '—'}</span></p>
              </div>
              {lastResult.results.some((result) => !result.success) && (
                <div className="mt-3 max-h-28 overflow-y-auto border-t border-gray-100 pt-3 text-xs text-red-600 dark:border-gray-800">
                  {lastResult.results.filter((result) => !result.success).map((result) => <p key={result.userId}>{result.name}: {result.error || 'Failed'}</p>)}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirm SMS dispatch"
        message={confirmMessage}
        confirmText={selectedIds.size === 1 ? "Send SMS" : "Send Group SMS"}
        cancelText="Review Message"
        variant="info"
        onClose={() => setShowConfirm(false)}
        onConfirm={dispatch}
      />
    </div>
  );
}
