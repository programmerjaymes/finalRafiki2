"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { ArrowPathIcon, BanknotesIcon, BuildingStorefrontIcon, CheckBadgeIcon, ClipboardDocumentIcon, ClockIcon, ShareIcon, SparklesIcon } from "@heroicons/react/24/outline";
import toast from "@/utils/toast";
import { useLocale } from "@/lib/useLocale";

type Business = { id: string; name: string; createdAt: string; isApproved: boolean; agentCommissionAmount: number | null; agentCommissionPaid: boolean; agentCommissionPaidAt: string | null };
type DashboardData = { agent: { id: string; name: string; referralCode: string | null }; businesses: Business[]; totals: { totalEarned: number; totalPaid: number; amountClaimable: number } };

const money = (value: number) => new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 }).format(value);

export default function AgentDashboardClient() {
  const { data: session } = useSession();
  const sw = useLocale() === "sw";
  const text = useCallback((en: string, swText: string) => sw ? swText : en, [sw]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/agents/dashboard", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Unable to load agent dashboard");
      setData(json);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load agent dashboard");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const copyCode = async () => {
    if (!data?.agent.referralCode) return;
    await navigator.clipboard.writeText(data.agent.referralCode);
    toast.success(text("Referral code copied", "Msimbo wa rufaa umenakiliwa"));
  };

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <div className="flex min-h-[60vh] items-center justify-center"><div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm dark:border-red-500/20 dark:bg-gray-900"><p className="font-semibold text-gray-900 dark:text-white">{text("We couldn't load your dashboard", "Hatukuweza kufungua dashibodi yako")}</p><p className="mt-2 text-sm text-gray-500">{error}</p><button onClick={load} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"><ArrowPathIcon className="h-4 w-4" />{text("Try again", "Jaribu tena")}</button></div></div>;

  const approved = data.businesses.filter((business) => business.isApproved).length;
  const pending = data.businesses.length - approved;
  const firstName = (session?.user?.name || data.agent.name || "Agent").split(" ")[0];

  return <div className="mx-auto max-w-[1500px] space-y-6">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-brand-900 px-6 py-7 text-white shadow-xl sm:px-8 sm:py-9">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" /><div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100"><SparklesIcon className="h-4 w-4" />{text("Agent workspace", "Kituo cha wakala")}</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{text(`Welcome back, ${firstName}`, `Karibu tena, ${firstName}`)}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">{text("Track every business you refer, follow approvals, and see exactly what you have earned.", "Fuatilia kila biashara uliyoleta, idhini zake, na mapato yako yote kwa urahisi.")}</p></div>
        <div className="min-w-[260px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><p className="text-xs font-bold uppercase tracking-widest text-indigo-200">{text("Your referral code", "Msimbo wako wa rufaa")}</p><div className="mt-2 flex items-center gap-3"><code className="min-w-0 flex-1 truncate text-2xl font-black tracking-[0.12em]">{data.agent.referralCode || "—"}</code><button onClick={copyCode} disabled={!data.agent.referralCode} className="rounded-xl bg-white p-2.5 text-indigo-800 transition hover:scale-105 disabled:opacity-50" aria-label={text("Copy referral code", "Nakili msimbo wa rufaa")}><ClipboardDocumentIcon className="h-5 w-5" /></button></div><p className="mt-2 text-xs text-indigo-200">{text("Share this code when registering a new business.", "Shiriki msimbo huu unaposajili biashara mpya.")}</p></div>
      </div>
    </section>

    <section id="earnings" className="scroll-mt-24 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={text("Total referrals", "Rufaa zote")} value={String(data.businesses.length)} detail={text(`${approved} approved`, `${approved} zimeidhinishwa`)} icon={<BuildingStorefrontIcon />} color="brand" />
      <StatCard label={text("Total earned", "Jumla uliyopata")} value={money(data.totals.totalEarned)} detail={text("Lifetime commission", "Kamisheni ya jumla")} icon={<BanknotesIcon />} color="indigo" />
      <StatCard label={text("Paid to you", "Uliyolipwa")} value={money(data.totals.totalPaid)} detail={text("Completed payments", "Malipo yaliyokamilika")} icon={<CheckBadgeIcon />} color="emerald" />
      <StatCard label={text("Amount due", "Kiasi unachodai")} value={money(data.totals.amountClaimable)} detail={pending ? text(`${pending} awaiting approval`, `${pending} zinasubiri idhini`) : text("All caught up", "Kila kitu kiko sawa")} icon={<ClockIcon />} color="amber" />
    </section>

    <section id="referrals" className="scroll-mt-24 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-lg font-bold text-gray-900 dark:text-white">{text("My referred businesses", "Biashara nilizoleta")}</h2><p className="mt-1 text-sm text-gray-500">{text("Approval and commission status for your referrals.", "Hali ya idhini na kamisheni kwa rufaa zako.")}</p></div><button type="button" onClick={copyCode} disabled={!data.agent.referralCode} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50"><ShareIcon className="h-4 w-4" />{text("Copy referral code", "Nakili msimbo wa rufaa")}</button></div>
      {data.businesses.length === 0 ? <div className="px-6 py-14 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10"><ShareIcon className="h-7 w-7" /></span><h3 className="mt-4 font-bold text-gray-900 dark:text-white">{text("No referrals yet", "Bado hakuna rufaa")}</h3><p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{text("Share your referral code or register a business to begin earning commission.", "Shiriki msimbo wako au sajili biashara ili kuanza kupata kamisheni.")}</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/70"><tr><th className="px-6 py-3.5">{text("Business", "Biashara")}</th><th className="px-5 py-3.5">{text("Registered", "Ilisajiliwa")}</th><th className="px-5 py-3.5">{text("Approval", "Idhini")}</th><th className="px-5 py-3.5">{text("Commission", "Kamisheni")}</th><th className="px-6 py-3.5">{text("Payment", "Malipo")}</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{data.businesses.map((business) => <tr key={business.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30"><td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{business.name}</td><td className="px-5 py-4 text-gray-500">{new Date(business.createdAt).toLocaleDateString(sw ? "sw-TZ" : "en-TZ", { dateStyle: "medium" })}</td><td className="px-5 py-4"><Badge ok={business.isApproved} yes={text("Approved", "Imeidhinishwa")} no={text("Pending", "Inasubiri")} /></td><td className="px-5 py-4 font-bold text-gray-800 dark:text-gray-200">{money(business.agentCommissionAmount || 0)}</td><td className="px-6 py-4"><Badge ok={business.agentCommissionPaid} yes={text("Paid", "Imelipwa")} no={text("Unpaid", "Haijalipwa")} /></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}

function Badge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>{ok ? yes : no}</span>; }

function StatCard({ label, value, detail, icon, color }: { label: string; value: string; detail: string; icon: ReactNode; color: "brand" | "indigo" | "emerald" | "amber" }) {
  const colors = { brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10", indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10", emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10", amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10" };
  return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-gray-500">{label}</p><p className="mt-2 text-2xl font-black tracking-tight text-gray-900 dark:text-white">{value}</p><p className="mt-1 text-xs text-gray-400">{detail}</p></div><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[color]} [&>svg]:h-6 [&>svg]:w-6`}>{icon}</span></div></div>;
}

function DashboardSkeleton() { return <div className="animate-pulse space-y-6"><div className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />)}</div><div className="h-80 rounded-3xl bg-gray-200 dark:bg-gray-800" /></div>; }
