'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ReceiptPercentIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import toast from '@/utils/toast';

type Category = 'DEPLOYMENT' | 'DATABASE' | 'HOSTING' | 'DOMAIN' | 'SMS' | 'SOFTWARE' | 'MAINTENANCE' | 'MARKETING' | 'OTHER';
type Status = 'PAID' | 'PENDING' | 'OVERDUE';

type Expense = {
  id: string;
  title: string;
  category: Category;
  vendor: string | null;
  reference: string | null;
  amount: number;
  currency: string;
  status: Status;
  paidAt: string | null;
  applicableFrom: string;
  applicableTo: string;
  notes: string | null;
  evidenceUrl: string | null;
  evidenceName: string | null;
  evidenceMimeType: string | null;
  createdAt: string;
  createdBy: { name: string };
};

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: 'DEPLOYMENT', label: 'Deployment fees' },
  { value: 'DATABASE', label: 'Database deployment fees' },
  { value: 'HOSTING', label: 'Hosting and infrastructure' },
  { value: 'DOMAIN', label: 'Domain and SSL fees' },
  { value: 'SMS', label: 'SMS communication fees' },
  { value: 'SOFTWARE', label: 'Software subscriptions' },
  { value: 'MAINTENANCE', label: 'Maintenance and support' },
  { value: 'MARKETING', label: 'Marketing fees' },
  { value: 'OTHER', label: 'Other operational fees' },
];

const categoryLabel = (value: Category) => CATEGORIES.find((item) => item.value === value)?.label || value;
const dateText = (value: string) => new Date(value).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' });
const money = (amount: number, currency = 'TZS') => `${currency} ${amount.toLocaleString('en-TZ', { maximumFractionDigits: 2 })}`;
const groupedMoney = (items: Expense[]) => {
  const totals = items.reduce((result, item) => {
    result[item.currency] = (result[item.currency] || 0) + item.amount;
    return result;
  }, {} as Record<string, number>);
  return Object.entries(totals).map(([currency, amount]) => money(amount, currency)).join(' · ') || 'TZS 0';
};

const emptyForm = {
  title: '',
  category: 'DEPLOYMENT' as Category,
  vendor: '',
  reference: '',
  amount: '',
  currency: 'TZS',
  status: 'PAID' as Status,
  paidAt: '',
  applicableFrom: '',
  applicableTo: '',
  notes: '',
};

export default function AppExpenseRegister() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [evidence, setEvidence] = useState<File | null>(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      const response = await fetch(`/api/app-expenses?${params}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load expenses');
      setExpenses(data.expenses || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load expenses');
    } finally {
      setLoading(false);
    }
  }, [category, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadExpenses(), 250);
    return () => window.clearTimeout(timer);
  }, [loadExpenses]);

  const totals = useMemo(() => {
    const paid = groupedMoney(expenses.filter((item) => item.status === 'PAID'));
    const outstanding = groupedMoney(expenses.filter((item) => item.status !== 'PAID'));
    const now = Date.now();
    const active = expenses.filter((item) => new Date(item.applicableFrom).getTime() <= now && new Date(item.applicableTo).getTime() >= now).length;
    return { paid, outstanding, active, evidence: expenses.filter((item) => item.evidenceUrl).length };
  }, [expenses]);

  const resetForm = () => {
    setForm(emptyForm);
    setEvidence(null);
  };

  const submitExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!evidence) {
      toast.error('Attach an invoice, receipt, or payment evidence');
      return;
    }
    setSaving(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append('evidence', evidence);
      const response = await fetch('/api/app-expenses', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save expense');
      toast.success('Expense and evidence saved');
      setShowForm(false);
      resetForm();
      await loadExpenses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save expense');
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (expense: Expense) => {
    const accepted = window.confirm(`Delete "${expense.title}" and its evidence? This cannot be undone.`);
    if (!accepted) return;
    const response = await fetch(`/api/app-expenses/${expense.id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error || 'Unable to delete expense');
      return;
    }
    toast.success('Expense deleted');
    await loadExpenses();
  };

  const generatePdf = () => {
    if (expenses.length === 0) {
      toast.error('There are no expenses in the current report');
      return;
    }
    const document = new jsPDF({ orientation: 'landscape' });
    document.setFillColor(31, 41, 55);
    document.rect(0, 0, 297, 30, 'F');
    document.setTextColor(255, 255, 255);
    document.setFontSize(20);
    document.text('Rafiki Application Expense Report', 14, 14);
    document.setFontSize(9);
    document.text(`Generated ${new Date().toLocaleString('en-TZ')} · ${expenses.length} record(s)`, 14, 22);
    document.setTextColor(31, 41, 55);
    document.setFontSize(11);
    document.text(`Paid total: ${totals.paid}    Outstanding: ${totals.outstanding}`, 14, 39);
    autoTable(document, {
      startY: 46,
      head: [['Expense', 'Category', 'Vendor', 'Amount', 'Status', 'Applicable period', 'Paid date', 'Evidence']],
      body: expenses.map((item) => [
        item.title,
        categoryLabel(item.category),
        item.vendor || '—',
        money(item.amount, item.currency),
        item.status,
        `${dateText(item.applicableFrom)} - ${dateText(item.applicableTo)}`,
        item.paidAt ? dateText(item.paidAt) : '—',
        item.evidenceName || '—',
      ]),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [70, 95, 255] },
      alternateRowStyles: { fillColor: [246, 248, 252] },
      columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 42 }, 5: { cellWidth: 43 } },
    });
    const pages = document.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      document.setPage(page);
      document.setFontSize(8);
      document.setTextColor(107, 114, 128);
      document.text(`Rafiki confidential expense register · Page ${page} of ${pages}`, 14, 202);
    }
    document.save(`rafiki-expense-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-brand-700 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-200">Financial governance</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">App expenses & invoices</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">Keep deployment, database, infrastructure, communications, and operating costs together with their supporting evidence and coverage periods.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={generatePdf} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur hover:bg-white/20"><ArrowDownTrayIcon className="h-5 w-5" />Download PDF report</button>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 shadow-lg hover:bg-indigo-50"><PlusIcon className="h-5 w-5" />Add invoice or payment</button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Paid expenses', value: totals.paid, icon: BanknotesIcon, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' },
          { label: 'Pending / overdue', value: totals.outstanding, icon: ReceiptPercentIcon, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' },
          { label: 'Currently applicable', value: String(totals.active), icon: CalendarDaysIcon, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' },
          { label: 'Evidence files', value: String(totals.evidence), icon: DocumentTextIcon, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.tone}`}><metric.icon className="h-6 w-6" /></div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">{metric.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="grid gap-3 border-b border-gray-100 p-5 dark:border-gray-800 md:grid-cols-[1fr_220px_180px]">
          <label className="relative"><MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expense, vendor, reference…" className="h-11 w-full rounded-xl border border-gray-300 bg-transparent pl-11 pr-4 text-sm dark:border-gray-700 dark:text-white" /></label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-xl border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">All categories</option>{CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">All statuses</option><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="OVERDUE">Overdue</option></select>
        </div>

        {loading ? <div className="py-20 text-center text-sm text-gray-500">Loading financial records…</div> : expenses.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center"><DocumentArrowUpIcon className="h-12 w-12 text-gray-300" /><h3 className="mt-4 font-semibold text-gray-900 dark:text-white">No expense records found</h3><p className="mt-1 text-sm text-gray-500">Upload your first invoice or payment evidence.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800/60"><tr><th className="px-5 py-3">Expense</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Applicable period</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Evidence</th><th className="px-5 py-3 text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
                    <td className="px-5 py-4"><p className="font-semibold text-gray-900 dark:text-white">{item.title}</p><p className="mt-1 text-xs text-gray-500">{categoryLabel(item.category)}{item.vendor ? ` · ${item.vendor}` : ''}</p>{item.reference && <p className="mt-1 text-xs text-gray-400">Ref: {item.reference}</p>}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200">{money(item.amount, item.currency)}{item.paidAt && <p className="mt-1 text-xs font-normal text-gray-500">Paid {dateText(item.paidAt)}</p>}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{dateText(item.applicableFrom)}<span className="mx-1 text-gray-400">→</span>{dateText(item.applicableTo)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : item.status === 'OVERDUE' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>{item.status}</span></td>
                    <td className="px-5 py-4">{item.evidenceUrl ? <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[180px] items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"><DocumentTextIcon className="h-5 w-5 shrink-0" /><span className="truncate">{item.evidenceName || 'View evidence'}</span></a> : <span className="text-sm text-gray-400">None</span>}</td>
                    <td className="px-5 py-4 text-right"><button onClick={() => void removeExpense(item)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete expense"><TrashIcon className="h-5 w-5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal isOpen={showForm} onClose={() => !saving && setShowForm(false)} className="max-h-[92vh] max-w-[820px] overflow-y-auto p-6 sm:p-8">
        <h2 className="pr-12 text-2xl font-bold text-gray-900 dark:text-white">Add invoice or app payment</h2>
        <p className="mt-1 text-sm text-gray-500">Record what the payment covers and attach the original evidence.</p>
        <form onSubmit={submitExpense} className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expense title *</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Production deployment renewal" className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" /></label>
          <label><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Category })} className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">{CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendor / provider</span><input value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })} placeholder="e.g. Vercel, Neon, Beem" className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" /></label>
          <label><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount *</span><div className="mt-1 flex"><select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className="w-24 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"><option>TZS</option><option>USD</option></select><input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="h-11 min-w-0 flex-1 rounded-r-xl border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" /></div></label>
          <label><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment status *</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Status })} className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="OVERDUE">Overdue</option></select></label>
          <label><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Applicable from *</span><input required type="date" value={form.applicableFrom} onChange={(event) => setForm({ ...form, applicableFrom: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" /></label>
          <label><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Applicable to *</span><input required type="date" min={form.applicableFrom} value={form.applicableTo} onChange={(event) => setForm({ ...form, applicableTo: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" /></label>
          <label><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment date</span><input type="date" value={form.paidAt} onChange={(event) => setForm({ ...form, paidAt: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" /></label>
          <label><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice / transaction reference</span><input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:text-white" /></label>
          <label className="sm:col-span-2"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</span><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 w-full rounded-xl border border-gray-300 bg-transparent p-4 text-sm dark:border-gray-700 dark:text-white" /></label>
          <label className="sm:col-span-2"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice or payment evidence *</span><span className="mt-1 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center hover:border-brand-400 dark:border-gray-700 dark:bg-gray-800/50"><DocumentArrowUpIcon className="h-9 w-9 text-brand-500" /><span className="mt-2 text-sm font-semibold text-gray-800 dark:text-white">{evidence?.name || 'Choose a PDF or image'}</span><span className="mt-1 text-xs text-gray-500">PDF, JPG, PNG or WebP · maximum 10 MB</span><input required type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => setEvidence(event.target.files?.[0] || null)} className="sr-only" /></span></label>
          <div className="flex justify-end gap-3 sm:col-span-2"><Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button><Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save expense'}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
