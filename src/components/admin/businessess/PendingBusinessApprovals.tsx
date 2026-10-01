"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FiCheck,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiUser,
  FiX,
} from "react-icons/fi";
import toast from "@/utils/toast";
import { toImageSrc } from "@/lib/imageSrc";
import {
  buildBusinessDecisionMessage,
  type BusinessDecisionLanguage,
} from "@/lib/businessDecisionMessage";

interface BusinessImage {
  id: string;
  imageData: string;
  sortOrder: number;
}

interface PendingBusiness {
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
  latitude: number | null;
  longitude: number | null;
  street: string | null;
  createdAt: string;
  images?: BusinessImage[];
  category?: { name: string; icon: string | null };
  owner?: { name: string; email: string; image: string | null };
  region?: { name: string };
  district?: { name: string };
  ward?: { name: string };
  bundle?: { name: string; price: number; duration: number };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DetailField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </h5>
      <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  );
}

function PhotoGrid({
  title,
  images,
  altPrefix,
}: {
  title: string;
  images: string[];
  altPrefix: string;
}) {
  if (images.length === 0) return null;

  return (
    <div>
      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h5>
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <div
            key={`${altPrefix}-${i}`}
            className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0"
          >
            <img
              src={src}
              alt={`${altPrefix} ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingBusinessCard({
  business,
  onApproved,
}: {
  business: PendingBusiness;
  onApproved: (id: string) => void;
}) {
  const [approving, setApproving] = useState(false);
  const [disapproving, setDisapproving] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<'APPROVED' | 'DISAPPROVED' | null>(null);
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [disapprovalReason, setDisapprovalReason] = useState("");
  const [messageLanguage, setMessageLanguage] = useState<BusinessDecisionLanguage>("sw");
  const ownerPhoto = toImageSrc(business.owner?.image);
  const logoSrc = toImageSrc(business.logo);
  const coverSrc = toImageSrc(business.coverImage);
  const productPhotos =
    business.images
      ?.map((img) => toImageSrc(img.imageData))
      .filter((src): src is string => Boolean(src)) ?? [];

  const location = [
    business.street,
    business.ward?.name,
    business.district?.name,
    business.region?.name,
  ]
    .filter(Boolean)
    .join(", ");


  const openDecision = (decision: 'APPROVED' | 'DISAPPROVED') => {
    setNotifyOwner(true);
    setDisapprovalReason("");
    setMessageLanguage("sw");
    setPendingDecision(decision);
  };

  const decisionMessage = buildBusinessDecisionMessage({
    decision: pendingDecision || 'DISAPPROVED',
    language: messageLanguage,
    ownerName: business.owner?.name || (messageLanguage === 'sw' ? 'mteja' : 'customer'),
    businessName: business.name,
    bundleName: business.bundle?.name || (messageLanguage === 'sw' ? 'ulichochagua' : 'selected'),
    bundleDuration: business.bundle?.duration || 0,
    disapprovalReason:
      disapprovalReason.trim() ||
      (messageLanguage === 'sw'
        ? '[andika sababu ya kutokuidhinisha]'
        : '[enter the reason for disapproval]'),
  });

  const submitDecision = async () => {
    if (!pendingDecision) return;
    const approved = pendingDecision === 'APPROVED';
    if (!approved && !disapprovalReason.trim()) { toast.error('Enter a reason for disapproval'); return; }
    try {
      if (approved) setApproving(true);
      else setDisapproving(true);
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approved
          ? { isApproved: true, isVerified: true, approvalDecision: 'APPROVED', notifyOwner, notificationLanguage: messageLanguage }
          : { isApproved: false, isVerified: false, approvalDecision: 'DISAPPROVED', deactivationReason: disapprovalReason.trim(), notifyOwner, notificationLanguage: messageLanguage }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Failed to ${approved ? 'approve' : 'disapprove'} business`);
      toast.success(`${business.name} ${approved ? 'approved' : 'disapproved'}`);
      setPendingDecision(null);
      onApproved(business.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${approved ? 'approve' : 'disapprove'} business`);
    } finally {
      setApproving(false);
      setDisapproving(false);
    }
  };

  return (
    <>
    <article className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-hidden">
      {coverSrc && (
        <div className="relative h-28 w-full bg-gray-100 dark:bg-gray-800">
          <img
            src={coverSrc}
            alt={`${business.name} cover`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-4 p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={business.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {business.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {business.name}
                </h3>
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-medium px-2 py-0.5 rounded-full">
                  Pending approval
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {business.category?.icon} {business.category?.name || "Uncategorized"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Submitted {formatDate(business.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => openDecision('DISAPPROVED')} disabled={approving || disapproving} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/40 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-500/10">
              {disapproving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />Disapproving...</> : <><FiX className="h-4 w-4" />Disapprove</>}
            </button>
            <button type="button" onClick={() => openDecision('APPROVED')} disabled={approving || disapproving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
              {approving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Approving...</> : <><FiCheck className="h-4 w-4" />Approve</>}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <FiUser className="h-4 w-4" />
            Person requesting approval
          </h4>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-brand-200 dark:border-brand-800 flex-shrink-0 bg-brand-50 dark:bg-brand-900/20">
              {ownerPhoto ? (
                <img
                  src={ownerPhoto}
                  alt={business.owner?.name || "Owner"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                    {business.owner?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {business.owner?.name || "Unknown"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {business.owner?.email}
              </p>
            </div>
          </div>
        </div>

        {business.description && (
          <DetailField label="Description">
            <p className="whitespace-pre-wrap">{business.description}</p>
          </DetailField>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Bundle">
            {business.bundle?.name || "N/A"}
            {business.bundle && (
              <span className="block text-xs text-gray-500 mt-0.5">
                TZS {business.bundle.price.toLocaleString()} ·{" "}
                {business.bundle.duration} days
              </span>
            )}
          </DetailField>
          <DetailField label="Contact">
            <div className="space-y-1">
              {business.phone && (
                <p className="flex items-center gap-2">
                  <FiPhone className="h-3.5 w-3.5 text-gray-400" />
                  {business.phone}
                </p>
              )}
              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  WhatsApp: {business.whatsapp}
                </a>
              )}
              {business.email && (
                <p className="flex items-center gap-2">
                  <FiMail className="h-3.5 w-3.5 text-gray-400" />
                  {business.email}
                </p>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-600 hover:underline dark:text-brand-400 break-all"
                >
                  <FiGlobe className="h-3.5 w-3.5 flex-shrink-0" />
                  {business.website}
                </a>
              )}
              {!business.phone &&
                !business.whatsapp &&
                !business.email &&
                !business.website && (
                  <span className="text-gray-400">No contact info</span>
                )}
            </div>
          </DetailField>
          <DetailField label="Location">
            <p className="flex items-start gap-2">
              <FiMapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>{location || "N/A"}</span>
            </p>
            {business.latitude != null && business.longitude != null && (
              <p className="text-xs text-gray-400 mt-1 ml-5">
                GPS: {business.latitude}, {business.longitude}
              </p>
            )}
          </DetailField>
        </div>

        {(business.facebook || business.instagram || business.twitter) && (
          <DetailField label="Social media">
            <div className="flex flex-wrap gap-3 text-sm">
              {business.facebook && (
                <a
                  href={business.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline dark:text-brand-400"
                >
                  Facebook
                </a>
              )}
              {business.instagram && (
                <a
                  href={business.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline dark:text-brand-400"
                >
                  Instagram
                </a>
              )}
              {business.twitter && (
                <a
                  href={business.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline dark:text-brand-400"
                >
                  Twitter / X
                </a>
              )}
            </div>
          </DetailField>
        )}

        {(business.allowsOnlineBooking || business.allowsDelivery) && (
          <DetailField label="Features">
            <div className="flex flex-wrap gap-2">
              {business.allowsOnlineBooking && (
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-md">
                  Online booking
                </span>
              )}
              {business.allowsDelivery && (
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-md">
                  Delivery
                </span>
              )}
            </div>
          </DetailField>
        )}

        <PhotoGrid
          title="Product photos"
          images={productPhotos}
          altPrefix={business.name}
        />
      </div>
    </article>
      {pendingDecision && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby={`decision-title-${business.id}`} className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start gap-4 border-b border-gray-100 p-6 dark:border-gray-800">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${pendingDecision === 'APPROVED' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                {pendingDecision === 'APPROVED' ? <FiCheck className="h-6 w-6" /> : <FiX className="h-6 w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 id={`decision-title-${business.id}`} className="text-lg font-semibold text-gray-900 dark:text-white">{pendingDecision === 'APPROVED' ? 'Approve business?' : 'Disapprove business?'}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Confirm your decision for <span className="font-semibold text-gray-700 dark:text-gray-200">{business.name}</span>.</p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <fieldset>
                <legend className="text-sm font-medium text-gray-900 dark:text-white">
                  SMS language
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([
                    ['sw', 'Kiswahili'],
                    ['en', 'English'],
                  ] as const).map(([value, label]) => (
                    <label
                      key={value}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition ${
                        messageLanguage === value
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`message-language-${business.id}`}
                        value={value}
                        checked={messageLanguage === value}
                        onChange={() => setMessageLanguage(value)}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {pendingDecision === 'DISAPPROVED' && (
                <label className="block">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Reason for disapproval <span className="text-red-500">*</span>
                  </span>
                  <textarea
                    value={disapprovalReason}
                    onChange={(event) => setDisapprovalReason(event.target.value.slice(0, 300))}
                    rows={3}
                    required
                    placeholder="Explain why this business was not approved..."
                    className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-transparent p-3 text-sm text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 dark:border-gray-700 dark:text-white"
                  />
                  <span className="mt-1 block text-right text-xs text-gray-400">
                    {disapprovalReason.length}/300
                  </span>
                </label>
              )}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  SMS message preview
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {decisionMessage}
                </p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <input type="checkbox" checked={notifyOwner} onChange={(event) => setNotifyOwner(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                <span>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">Notify the business owner by SMS</span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{pendingDecision === 'APPROVED' ? 'Send the approval, bundle name, and bundle duration.' : 'Send the disapproval notice and Rafiki contact numbers.'}</span>
                </span>
              </label>
              {!notifyOwner && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">The decision will be saved without sending an SMS.</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
              <button type="button" onClick={() => setPendingDecision(null)} disabled={approving || disapproving} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">Cancel</button>
              <button type="button" onClick={() => void submitDecision()} disabled={approving || disapproving || (pendingDecision === 'DISAPPROVED' && !disapprovalReason.trim())} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${pendingDecision === 'APPROVED' ? 'bg-brand-500 hover:bg-brand-600' : 'bg-red-600 hover:bg-red-700'}`}>{approving || disapproving ? 'Saving…' : pendingDecision === 'APPROVED' ? 'Approve' : 'Disapprove'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PendingBusinessApprovals() {
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPending = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(
        "/api/businesses?isApproved=false&approvalQueue=pending&limit=50&_=" + Date.now(),
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Failed to load pending businesses");
      }

      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Error fetching pending businesses:", error);
      toast.error("Failed to load pending businesses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApproved = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-10 w-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading pending approvals...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {businesses.length === 0
            ? "No businesses waiting for approval."
            : `${businesses.length} business${businesses.length === 1 ? "" : "es"} waiting for approval.`}
        </p>
        <button
          type="button"
          onClick={() => fetchPending(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {businesses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            All caught up — no pending business registrations.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {businesses.map((business) => (
            <PendingBusinessCard
              key={business.id}
              business={business}
              onApproved={handleApproved}
            />
          ))}
        </div>
      )}
    </div>
  );
}
