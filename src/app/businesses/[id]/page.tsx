'use client';

import { useState, useEffect, use, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaStar,
  FaMapMarkerAlt,
  FaArrowLeft,
} from 'react-icons/fa';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BusinessProductCarousel from '@/components/landing/BusinessProductCarousel';
import { brandColors } from '@/lib/brandColors';
import { resolveBusinessImageSrc } from '@/lib/businessImage';
import { whatsappChatUrl } from '@/lib/phoneNumber';
import { useLocale } from '@/lib/useLocale';

interface BusinessImage {
  id: string;
  imageData: string;
  sortOrder: number;
}

interface Business {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  coverImage: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  allowsOnlineBooking: boolean;
  allowsDelivery: boolean;
  isVerified: boolean;
  isApproved: boolean;
  street: string | null;
  avgRating: number;
  numReviews: number;
  viewCount: number;
  clickCount: number;
  inquiryCount: number;
  images?: BusinessImage[];
  category: { id: string; name: string; icon: string | null };
  owner: { id: string; name: string; email: string; image: string | null };
  region?: { id: string; name: string } | null;
  district?: { id: string; name: string } | null;
  ward?: { id: string; name: string } | null;
}

function imageSrc(data: string | null) {
  return resolveBusinessImageSrc(data);
}

export default function BusinessDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const locale = useLocale();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const labels =
    locale === 'sw'
      ? {
          back: 'Rudi kwenye utafutaji',
          about: 'Kuhusu',
          gallery: 'Picha za bidhaa',
          contact: 'Mawasiliano',
          location: 'Eneo',
          features: 'Huduma',
          stats: 'Takwimu',
          views: 'Mitazamo',
          clicks: 'Mibofyo',
          inquiries: 'Maswali',
          phone: 'Simu',
          whatsapp: 'WhatsApp',
          email: 'Barua pepe',
          website: 'Tovuti',
          social: 'Mitandao',
          verified: 'Imethibitishwa',
          book: 'Hifadhi sasa',
          mapPlaceholder: 'Ramani itaonekana hapa',
          onlineBooking: 'Uhifadhi mtandaoni',
          delivery: 'Uwasilishaji',
          services: 'Huduma za',
          notFound: 'Biashara haijapatikana',
          notFoundDesc: 'Biashara unayotafuta haipo au imeondolewa.',
          goBack: 'Rudi nyuma',
          call: 'Piga simu',
          chatWhatsapp: 'Wasiliana WhatsApp',
        }
      : {
          back: 'Back to search',
          about: 'About',
          gallery: 'Product photos',
          contact: 'Contact',
          location: 'Location',
          features: 'Features',
          stats: 'Statistics',
          views: 'Views',
          clicks: 'Clicks',
          inquiries: 'Inquiries',
          phone: 'Phone',
          whatsapp: 'WhatsApp',
          email: 'Email',
          website: 'Website',
          social: 'Social',
          verified: 'Verified',
          book: 'Book now',
          mapPlaceholder: 'Map view would appear here',
          onlineBooking: 'Online booking',
          delivery: 'Delivery available',
          services: 'Services',
          notFound: 'Business not found',
          notFoundDesc: 'The business you are looking for could not be found or is no longer available.',
          goBack: 'Go back',
          call: 'Call now',
          chatWhatsapp: 'Chat on WhatsApp',
        };

  useEffect(() => {
    async function fetchBusinessData() {
      try {
        const response = await fetch(`/api/businesses/${id}`);
        if (!response.ok) {
          setError(response.status === 404 ? labels.notFound : 'Failed to load');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setBusiness(data);
        try {
          await fetch(`/api/businesses/${id}/view`, { method: 'POST' });
        } catch {
          /* non-blocking */
        }
      } catch {
        setError('Failed to load business');
      } finally {
        setLoading(false);
      }
    }
    fetchBusinessData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const shell = (content: ReactNode) => (
    <div className="min-h-screen flex flex-col bg-[#f7f5f3] dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow w-full pt-[4.25rem] sm:pt-[4.75rem] pb-10">{content}</main>
      <Footer />
    </div>
  );

  if (loading) {
    return shell(
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6 animate-pulse">
        <div className="h-48 sm:h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 mb-6" />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-24 bg-gray-100 dark:bg-gray-900 rounded-2xl" />
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-2xl" />
        </div>
      </div>,
    );
  }

  if (error || !business) {
    return shell(
      <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6 py-12 text-center">
        <div className="max-w-md mx-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 shadow-lg">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{error || labels.notFound}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{labels.notFoundDesc}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full px-6 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: brandColors.accent }}
          >
            {labels.goBack}
          </button>
        </div>
      </div>,
    );
  }

  const logo = imageSrc(business.logo);
  const hasProductPhotos =
    Boolean(business.coverImage) ||
    Boolean(business.images && business.images.length > 0) ||
    Boolean(business.logo);
  const locationParts = [
    business.street,
    business.ward?.name,
    business.district?.name,
    business.region?.name,
  ].filter(Boolean);

  return shell(
    <div className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition"
      >
        <FaArrowLeft className="h-3.5 w-3.5" />
        {labels.back}
      </Link>

      <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl mb-6">
        <div className="relative h-44 sm:h-56 md:h-72 overflow-hidden" style={{ background: brandColors.cardHeader }}>
          <BusinessProductCarousel
            business={business}
            className="absolute inset-0 h-full w-full"
            emptyLabel={
              locale === 'sw'
                ? 'Hakuna picha za bidhaa bado'
                : 'No product photos yet'
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex items-end gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl border-2 border-white bg-white dark:bg-gray-800 shadow-xl overflow-hidden flex items-center justify-center">
              {logo ? (
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: brandColors.accent }}>
                  {business.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 text-white pb-0.5">
              <h1 className="text-xl sm:text-3xl font-bold truncate drop-shadow-md">{business.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-2.5 py-1 text-xs font-medium border border-white/30">
                  <span aria-hidden>{business.category.icon || '•'}</span>
                  {business.category.name}
                </span>
                {business.isVerified && (
                  <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold">
                    {labels.verified}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-sm text-white/90">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(business.avgRating) ? 'text-amber-300' : 'text-white/30'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs">({business.numReviews})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center border-b border-gray-100 dark:border-gray-800">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex justify-center items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition"
              style={{ backgroundColor: brandColors.accent }}
            >
              <FaPhone />
              {labels.call}: {business.phone}
            </a>
          )}
          {whatsappChatUrl(business.whatsapp) && (
            <a
              href={whatsappChatUrl(business.whatsapp)!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition bg-[#25D366]"
            >
              <FaWhatsapp className="h-5 w-5" />
              {labels.chatWhatsapp}
            </a>
          )}
          {business.allowsOnlineBooking && (
            <button
              type="button"
              className="inline-flex justify-center items-center rounded-xl border-2 px-6 py-3 text-sm font-bold transition hover:opacity-90"
              style={{ borderColor: brandColors.accent, color: brandColors.accent }}
            >
              {labels.book}
            </button>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{labels.about}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {business.description ||
              (locale === 'sw' ? 'Hakuna maelezo yaliyowekwa.' : 'No description provided.')}
          </p>
        </div>

        {hasProductPhotos && business.images && business.images.length > 0 && (
          <div className="px-4 sm:px-6 pb-6 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{labels.gallery}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {business.images.map((img, i) => (
                <div
                  key={img.id || i}
                  className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
                >
                  <img
                    src={imageSrc(img.imageData) || ''}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">{labels.contact}</h2>
          <ul className="space-y-4">
            {business.phone && (
              <li className="flex gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: brandColors.accentSoft }}
                >
                  <FaPhone style={{ color: brandColors.accent }} />
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{labels.phone}</p>
                  <a href={`tel:${business.phone}`} className="font-semibold text-gray-900 dark:text-white">
                    {business.phone}
                  </a>
                </div>
              </li>
            )}
            {whatsappChatUrl(business.whatsapp) && (
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                  <FaWhatsapp className="text-[#25D366] h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{labels.whatsapp}</p>
                  <a
                    href={whatsappChatUrl(business.whatsapp)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {business.whatsapp}
                  </a>
                </div>
              </li>
            )}
            {business.email && (
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <FaEnvelope className="text-gray-600 dark:text-gray-300" />
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{labels.email}</p>
                  <a href={`mailto:${business.email}`} className="font-semibold text-gray-900 dark:text-white break-all">
                    {business.email}
                  </a>
                </div>
              </li>
            )}
            {business.website && (
              <li className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <FaGlobe className="text-gray-600 dark:text-gray-300" />
                </span>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{labels.website}</p>
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 dark:text-white break-all hover:underline"
                  >
                    {business.website.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                </div>
              </li>
            )}
          </ul>
          {(business.facebook || business.instagram || business.twitter) && (
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{labels.social}</p>
              <div className="flex gap-3">
                {business.facebook && (
                  <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                    <FaFacebook className="h-6 w-6" />
                  </a>
                )}
                {business.instagram && (
                  <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600">
                    <FaInstagram className="h-6 w-6" />
                  </a>
                )}
                {business.twitter && (
                  <a href={business.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-sky-500">
                    <FaTwitter className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">{labels.location}</h2>
          {locationParts.length > 0 ? (
            <p className="text-gray-700 dark:text-gray-300 flex gap-2">
              <FaMapMarkerAlt className="shrink-0 mt-1" style={{ color: brandColors.accent }} />
              <span>{locationParts.join(', ')}</span>
            </p>
          ) : (
            <p className="text-gray-500 text-sm">{locale === 'sw' ? 'Eneo halijulikani' : 'Location not specified'}</p>
          )}
          <div className="mt-4 rounded-xl bg-gray-100 dark:bg-gray-800 h-40 flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{labels.mapPlaceholder}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">{labels.features}</h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {business.allowsOnlineBooking && (
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> {labels.onlineBooking}
              </li>
            )}
            {business.allowsDelivery && (
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> {labels.delivery}
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> {labels.services} {business.category.name}
            </li>
          </ul>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-6 mb-3">{labels.stats}</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: labels.views, value: business.viewCount },
              { label: labels.clicks, value: business.clickCount },
              { label: labels.inquiries, value: business.inquiryCount },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center border border-gray-100 dark:border-gray-700"
              >
                <p className="text-[10px] uppercase tracking-wide text-gray-500">{s.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
  );
}
