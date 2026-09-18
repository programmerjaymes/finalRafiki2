"use client";

import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ChevronLeftIcon } from "@/icons";
import { useLocale } from "@/lib/useLocale";

const privacySections = [
  {
    title: ["Information we collect", "Taarifa tunazokusanya"],
    body: [
      "We may collect your name, phone number, email address, account details, business information, location details, and information you submit while using Rafiki.",
      "Tunaweza kukusanya jina lako, namba ya simu, barua pepe, taarifa za akaunti, taarifa za biashara, eneo na taarifa unazowasilisha unapotumia Rafiki.",
    ],
  },
  {
    title: ["How we use information", "Jinsi tunavyotumia taarifa"],
    body: [
      "We use your information to create and manage accounts, publish business listings, process and verify payments, provide support, improve our services, and protect the platform from misuse.",
      "Tunatumia taarifa zako kufungua na kusimamia akaunti, kuchapisha orodha za biashara, kushughulikia na kuthibitisha malipo, kutoa msaada, kuboresha huduma na kulinda jukwaa dhidi ya matumizi mabaya.",
    ],
  },
  {
    title: ["Public business information", "Taarifa za biashara zinazoonekana kwa umma"],
    body: [
      "Information included in an approved business listing—such as the business name, description, location, contact details, images, and services—may be visible to the public.",
      "Taarifa zilizomo kwenye orodha ya biashara iliyoidhinishwa—kama jina la biashara, maelezo, eneo, mawasiliano, picha na huduma—zinaweza kuonekana kwa umma.",
    ],
  },
  {
    title: ["Sharing your information", "Kushirikisha taarifa zako"],
    body: [
      "We do not sell your personal information. We may share limited information with trusted service providers when necessary to operate Rafiki, comply with the law, or protect users and the platform.",
      "Hatuuzi taarifa zako binafsi. Tunaweza kushirikisha taarifa chache na watoa huduma tunaowaamini inapohitajika kuendesha Rafiki, kutii sheria au kulinda watumiaji na jukwaa.",
    ],
  },
  {
    title: ["Data security and retention", "Usalama na uhifadhi wa taarifa"],
    body: [
      "We use reasonable safeguards to protect your information. We keep it only for as long as needed to provide our services, meet legal obligations, resolve disputes, and prevent fraud.",
      "Tunatumia hatua zinazofaa kulinda taarifa zako. Tunazihifadhi kwa muda unaohitajika kutoa huduma, kutimiza wajibu wa kisheria, kutatua migogoro na kuzuia udanganyifu.",
    ],
  },
  {
    title: ["Your choices", "Chaguo zako"],
    body: [
      "You may request access to, correction of, or deletion of your personal information, subject to legal and operational requirements. You may also update your account and business details through Rafiki.",
      "Unaweza kuomba kuona, kusahihisha au kufuta taarifa zako binafsi kwa kuzingatia masharti ya kisheria na kiutendaji. Unaweza pia kusasisha taarifa za akaunti na biashara yako kupitia Rafiki.",
    ],
  },
] as const;

export default function PrivacyPage() {
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
                {sw ? "Sera ya Faragha" : "Privacy Policy"}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                {sw
                  ? "Tunakuheshimu na tumejitolea kulinda taarifa zako binafsi."
                  : "We respect you and are committed to protecting your personal information."}
              </p>
            </div>
          </header>

          <nav className="mt-6 grid gap-3 sm:grid-cols-2" aria-label={sw ? "Kurasa za kisheria" : "Legal pages"}>
            <Link href="/terms" className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{sw ? "Soma pia" : "Also read"}</p>
              <p className="mt-1 flex items-center justify-between font-bold text-gray-900 dark:text-white">
                {sw ? "Masharti na Vigezo" : "Terms and Conditions"}<span className="text-brand-600 transition group-hover:translate-x-1">→</span>
              </p>
            </Link>
            <div className="rounded-2xl border-2 border-brand-600 bg-white p-4 shadow-sm dark:bg-gray-900">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">{sw ? "Uko hapa" : "You are here"}</p>
              <p className="mt-1 font-bold text-gray-900 dark:text-white">{sw ? "Sera ya Faragha" : "Privacy Policy"}</p>
            </div>
          </nav>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {privacySections.map((section, index) => (
              <section key={section.title[0]} className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-sm font-extrabold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                  {section.title[languageIndex]}
                </h2>
                <p className="mt-2 leading-7 text-gray-600 dark:text-gray-300">
                  {section.body[languageIndex]}
                </p>
              </section>
            ))}
          </div>

          <footer className="mt-6 flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100 sm:p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdd00d] font-bold text-gray-900">✓</span>
            <p>{sw
                ? "Kwa kutumia Rafiki, unakubali matumizi ya taarifa zako kama ilivyoelezwa katika sera hii."
                : "By using Rafiki, you agree to the handling of your information as described in this policy."}</p>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  );
}
