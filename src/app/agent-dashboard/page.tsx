'use client';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

type Data = { agent: { name: string; referralCode: string }; totals: { totalEarned: number; totalPaid: number; amountClaimable: number }; businesses: Array<{ id: string; name: string; createdAt: string; isApproved: boolean; agentCommissionAmount: number | null; agentCommissionPaid: boolean }> };
const money = (value: number) => new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(value);

export default function AgentDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { fetch('/api/agents/dashboard', { cache: 'no-store' }).then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; }).then(setData).catch(e => setError(e.message)); }, []);
  if (error) return <main className="p-8 text-red-600">{error}</main>;
  if (!data) return <main className="p-8">Loading agent dashboard…</main>;
  return <main className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-8">
    <div className="mx-auto max-w-6xl">
      <header className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Agent dashboard</p><h1 className="text-3xl font-bold dark:text-white">Welcome, {data.agent.name}</h1></div><button onClick={() => signOut({ callbackUrl: '/signin' })} className="rounded-lg border px-4 py-2 dark:text-white">Sign out</button></header>
      <section className="mt-6 rounded-2xl bg-blue-600 p-6 text-white"><p className="text-sm text-blue-100">Your referral code</p><p className="mt-1 text-3xl font-black tracking-widest">{data.agent.referralCode}</p><p className="mt-2 text-sm text-blue-100">Share this code with businesses you invite.</p></section>
      <section className="mt-6 grid gap-4 sm:grid-cols-3">{[['Total earned', data.totals.totalEarned], ['Paid', data.totals.totalPaid], ['Amount claimable', data.totals.amountClaimable]].map(([label, value]) => <div key={label as string} className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold dark:text-white">{money(value as number)}</p></div>)}</section>
      <section className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-900"><div className="border-b p-5 dark:border-gray-800"><h2 className="text-lg font-bold dark:text-white">Businesses you invited</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500 dark:bg-gray-800"><tr><th className="p-4">Business</th><th className="p-4">Registered</th><th className="p-4">Status</th><th className="p-4">Commission</th></tr></thead><tbody>{data.businesses.map(b => <tr key={b.id} className="border-t dark:border-gray-800"><td className="p-4 font-medium dark:text-white">{b.name}</td><td className="p-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td><td className="p-4">{b.isApproved ? 'Approved' : 'Pending'}</td><td className="p-4 font-semibold dark:text-white">{money(b.agentCommissionAmount || 0)} · {b.agentCommissionPaid ? 'Paid' : 'Claimable'}</td></tr>)}</tbody></table>{!data.businesses.length && <p className="p-8 text-center text-gray-500">No referred businesses yet.</p>}</div></section>
    </div>
  </main>;
}
