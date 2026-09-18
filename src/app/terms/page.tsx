"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { useLocale } from "@/lib/useLocale";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const terms = [
  {
    title: ["Using Rafiki", "Kutumia Rafiki"],
    body: [
      "You must provide accurate information when creating an account or registering a business. You are responsible for keeping your account details and password secure.",
      "Lazima utoe taarifa sahihi unapofungua akaunti au kusajili biashara. Unawajibika kulinda taarifa za akaunti yako na nenosiri lako.",
    ],
  },
  {
    title: ["Business listings", "Orodha za biashara"],
    body: [
      "Business owners are responsible for ensuring that their listing details, prices, contacts, images, and services are accurate and lawful. Rafiki may review, reject, suspend, or remove misleading or inappropriate listings.",
      "Wamiliki wa biashara wanawajibika kuhakikisha taarifa, bei, mawasiliano, picha na huduma zao ni sahihi na halali. Rafiki inaweza kukagua, kukataa, kusimamisha au kuondoa orodha yenye taarifa za kupotosha au zisizofaa.",
    ],
  },
  {
    title: ["Payments and bundles", "Malipo na vifurushi"],
    body: [
      "Fees for paid bundles must be paid using the payment options shown by Rafiki. Bundle features and duration are displayed before payment. Payments are subject to verification before a listing is activated.",
      "Ada za vifurushi vya kulipia lazima zilipwe kwa njia za malipo zilizoonyeshwa na Rafiki. Vipengele na muda wa kifurushi huonyeshwa kabla ya malipo. Malipo yatathibitishwa kabla ya orodha kuanza kutumika.",
    ],
  },
  {
    title: ["Acceptable conduct", "Matumizi yanayokubalika"],
    body: [
      "You may not use Rafiki for fraud, unlawful activity, harassment, harmful content, or unauthorized access. You must respect the rights and privacy of other users.",
      "Huruhusiwi kutumia Rafiki kwa udanganyifu, shughuli haramu, unyanyasaji, maudhui yenye madhara au kuingia bila ruhusa. Lazima uheshimu haki na faragha ya watumiaji wengine.",
    ],
  },
  {
    title: ["Service availability", "Upatikanaji wa huduma"],
    body: [
      "We work to keep Rafiki available and accurate, but we cannot guarantee uninterrupted service or the accuracy of information supplied by third parties or business owners.",
      "Tunajitahidi kuhakikisha Rafiki inapatikana na ina taarifa sahihi, lakini hatuwezi kuhakikisha huduma haitakatika au taarifa zinazotolewa na wahusika wengine au wamiliki wa biashara ni sahihi wakati wote.",
    ],
  },
  {
    title: ["Changes and account suspension", "Mabadiliko na kusimamishwa kwa akaunti"],
    body: [
      "We may update these terms when needed. We may suspend or close accounts that break these terms, misuse the platform, or put other users at risk.",
      "Tunaweza kubadilisha masharti haya inapohitajika. Tunaweza kusimamisha au kufunga akaunti inayokiuka masharti haya, kutumia jukwaa vibaya au kuhatarisha watumiaji wengine.",
    ],
  },
] as const;

export default function TermsPage() {
  const sw = useLocale() === "sw";
  const languageIndex = sw ? 1 : 0;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f8f6f4] dark:bg-gray-950">
      <Navbar />
      <div className="pointer-events-none absolute left-[-8rem] top-40 h-80 w-80 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-900/20" aria-hidden />
      <div className="pointer-events-none absolute right-[-6rem] top-[32rem] h-72 w-72 rounded-full bg-amber-100/70 blur-3xl dark:bg-amber-900/10" aria-hidden />

      <main className="rafiki-nav-offset relative flex-grow px-4 pb-12 pt-6 sm:px-6 lg:pb-20 lg:pt-10">
      <article className="mx-auto max-w-4xl">
        <Link
          href="/signup"
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200 transition hover:-translate-x-0.5 hover:text-brand-600 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800 dark:hover:text-brand-400"
        >
          <ChevronLeftIcon />
          {sw ? "Rudi kwenye usajili" : "Back to registration"}
        </Link>

        <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#741024] via-[#98152f] to-[#52101c] px-6 py-10 text-white shadow-xl shadow-brand-900/15 sm:px-10 sm:py-14">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" aria-hidden />
          <div className="absolute -bottom-20 right-20 h-44 w-44 rounded-full bg-amber-300/10 blur-2xl" aria-hidden />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#fdd00d]" /> Rafiki Legal
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
              {sw ? "Masharti na Vigezo" : "Terms and Conditions"}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              {sw
                ? "Mwongozo rahisi wa kutumia Rafiki kwa usalama na kwa uwajibikaji."
                : "A simple guide to using Rafiki safely, fairly, and responsibly."}
            </p>
          </div>
        </header>

        <nav className="mt-6 grid gap-3 sm:grid-cols-2" aria-label={sw ? "Kurasa za kisheria" : "Legal pages"}>
          <div className="rounded-2xl border-2 border-brand-600 bg-white p-4 shadow-sm dark:bg-gray-900">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">{sw ? "Uko hapa" : "You are here"}</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">{sw ? "Masharti na Vigezo" : "Terms and Conditions"}</p>
          </div>
          <Link href="/privacy" className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{sw ? "Soma pia" : "Also read"}</p>
            <p className="mt-1 flex items-center justify-between font-bold text-gray-900 dark:text-white">
              {sw ? "Sera ya Faragha" : "Privacy Policy"}<span className="text-brand-600 transition group-hover:translate-x-1">→</span>
            </p>
          </Link>
        </nav>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {terms.map((term, index) => (
            <section key={term.title[0]} className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-sm font-extrabold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                {term.title[languageIndex]}
              </h2>
              <p className="mt-2 leading-7 text-gray-600 dark:text-gray-300">
                {term.body[languageIndex]}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-6 flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdd00d] font-bold text-gray-900">✓</span>
          <p>{sw
              ? "Kwa kuendelea kutumia Rafiki, unathibitisha kuwa umesoma na kukubali masharti haya."
              : "By continuing to use Rafiki, you confirm that you have read and accepted these terms."}</p>
        </footer>
      </article>
      </main>
      <Footer />
    </div>
  );
}
