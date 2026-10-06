'use client';

import { useEffect, useState } from 'react';
import { BellAlertIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import toast from '@/utils/toast';

type NotificationSettings = { enabled: boolean; administrators: Array<{ id: string; name: string; phone: string | null }> };

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commission, setCommission] = useState('0');

  useEffect(() => {
    fetch('/api/settings/approval-notifications', { cache: 'no-store' })
      .then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); return result; })
      .then(setSettings)
      .catch((error) => toast.error(error.message || 'Unable to load settings'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch('/api/settings/agent-commission').then(r => r.json()).then(r => setCommission(String(r.amount ?? 0))).catch(() => undefined); }, []);

  const saveCommission = async () => {
    setSaving(true);
    try { const response = await fetch('/api/settings/agent-commission', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(commission) }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setCommission(String(result.amount)); toast.success('Agent commission updated'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save commission'); }
    finally { setSaving(false); }
  };

  const setEnabled = async (enabled: boolean) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/approval-notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save setting');
      setSettings((current) => current ? { ...current, enabled: result.enabled } : current);
      toast.success(`Approval SMS notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save setting'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-w-0">
      <PageBreadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings' }]} />
      <section className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 px-6 py-8 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Administration</p>
        <h1 className="mt-2 text-3xl font-bold">System Settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">Control automated notifications and platform-wide administrative behavior.</p>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"><BellAlertIcon className="h-6 w-6" /></div>
            <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">New business approval SMS</h2><p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Send an SMS to all selected administrators whenever a business owner submits a new business requiring approval.</p></div>
          </div>
          <button type="button" role="switch" aria-checked={settings?.enabled || false} disabled={loading || saving} onClick={() => settings && setEnabled(!settings.enabled)} className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${settings?.enabled ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-700'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${settings?.enabled ? 'left-6' : 'left-1'}`} /></button>
        </div>
        <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/40">
          {loading ? <p className="text-sm text-gray-500">Loading configuration…</p> : settings?.administrators.length ? <div className="flex items-start gap-3"><CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /><div><p className="text-sm font-medium text-gray-800 dark:text-gray-200">Recipients ({settings.administrators.length})</p><div className="mt-2 flex flex-wrap gap-2">{settings.administrators.map((administrator) => <span key={administrator.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"><span className="font-semibold">{administrator.name}</span><span className="ml-1 text-gray-400">· {administrator.phone || 'No phone number'}</span></span>)}</div></div></div> : <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300"><ExclamationTriangleIcon className="h-5 w-5" /><p className="text-sm">No notification administrators selected. Select one or more using the bell action on the Users page.</p></div>}
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent commission per business</h2>
        <p className="mt-1 text-sm text-gray-500">This TZS amount is recorded when a valid agent referral creates a business. Existing earnings are not changed.</p>
        <div className="mt-4 flex max-w-md gap-3"><input type="number" min="0" step="1" value={commission} onChange={e => setCommission(e.target.value)} className="h-11 flex-1 rounded-lg border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-950 dark:text-white" /><button disabled={saving} onClick={saveCommission} className="rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white disabled:opacity-50">Save</button></div>
      </section>
    </div>
  );
}
