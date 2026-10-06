'use client';
import { useEffect, useState } from 'react';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import toast from '@/utils/toast';

type Business = { id: string; name: string; createdAt: string; isApproved: boolean; commission: number | null; paid: boolean };
type Agent = { id: string; name: string; email: string | null; phone: string | null; referralCode: string | null; roles: string[]; businessCount: number; totalEarned: number; totalPaid: number; amountOwed: number; businesses: Business[] };
const money = (n: number) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n || 0);

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => fetch('/api/admin/agents', { cache: 'no-store' }).then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error); setAgents(j.agents); }).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);
  const togglePaid = async (business: Business) => {
    const response = await fetch('/api/admin/agents', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: business.id, paid: !business.paid }) });
    const result = await response.json();
    if (!response.ok) return toast.error(result.error || 'Unable to update commission');
    toast.success(business.paid ? 'Commission marked unpaid' : 'Commission marked paid'); void load();
  };
  const owed = agents.reduce((s, a) => s + a.amountOwed, 0);
  return <div><PageBreadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Agents' }]} />
    <section className="mt-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 p-6 text-white shadow-lg"><p className="text-sm text-white/70">Agent commissions</p><h1 className="mt-1 text-3xl font-bold">Agents & referrals</h1><div className="mt-5 flex gap-3"><span className="rounded-lg bg-white/15 px-4 py-2">{agents.length} agents</span><span className="rounded-lg bg-white/15 px-4 py-2">Total owed: {money(owed)}</span></div></section>
    {loading ? <p className="p-10 text-center">Loading agents…</p> : <div className="mt-6 space-y-5">{agents.map(agent => <section key={agent.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"><div className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto_auto]"><div><h2 className="text-lg font-bold dark:text-white">{agent.name}</h2><p className="text-sm text-gray-500">{agent.email || agent.phone || 'No contact'} · Code: {agent.referralCode || '—'}</p><div className="mt-2 flex gap-1">{agent.roles.map(r => <span key={r} className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">{r.replaceAll('_', ' ')}</span>)}</div></div><Stat label="Businesses" value={String(agent.businessCount)} /><Stat label="Paid" value={money(agent.totalPaid)} /><Stat label="Amount owed" value={money(agent.amountOwed)} danger={agent.amountOwed > 0} /></div>
      <div className="overflow-x-auto border-t dark:border-gray-800"><table className="w-full min-w-[700px] text-sm"><thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-800"><tr><th className="p-3">Invited business</th><th className="p-3">Registered</th><th className="p-3">Approval</th><th className="p-3">Commission</th><th className="p-3">Payment</th></tr></thead><tbody>{agent.businesses.map(b => <tr key={b.id} className="border-t dark:border-gray-800"><td className="p-3 font-medium dark:text-white">{b.name}</td><td className="p-3">{new Date(b.createdAt).toLocaleDateString('en-TZ')}</td><td className="p-3">{b.isApproved ? 'Approved' : 'Pending'}</td><td className="p-3 font-semibold">{money(b.commission || 0)}</td><td className="p-3"><button onClick={() => void togglePaid(b)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${b.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>{b.paid ? 'Paid · reopen' : 'Mark paid'}</button></td></tr>)}</tbody></table>{!agent.businesses.length && <p className="p-6 text-center text-gray-500">No invited businesses.</p>}</div></section>)}</div>}
  </div>;
}
function Stat({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) { return <div><p className="text-xs text-gray-500">{label}</p><p className={`mt-1 text-lg font-bold ${danger ? 'text-amber-600' : 'dark:text-white'}`}>{value}</p></div>; }
