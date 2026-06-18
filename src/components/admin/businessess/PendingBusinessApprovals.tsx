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
} from "react-icons/fi";
import toast from "@/utils/toast";
import { toImageSrc } from "@/lib/imageSrc";

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
            className="h-28 w-28 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0"
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

  const handleApprove = async () => {
    try {
      setApproving(true);
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true, isVerified: true }),
      });

      if (!response.ok) {
        toast.error("Failed to approve business");
        return;
      }

      toast.success(`${business.name} approved`);
      onApproved(business.id);
    } catch (error) {
      console.error("Error approving business:", error);
      toast.error("Failed to approve business");
    } finally {
      setApproving(false);
    }
  };

  return (
    <article className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-hidden">
      {coverSrc && (
        <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
          <img
            src={coverSrc}
            alt={`${business.name} cover`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
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

          <button
            type="button"
            onClick={handleApprove}
            disabled={approving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {approving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <FiCheck className="h-4 w-4" />
                Approve
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <FiUser className="h-4 w-4" />
            Person requesting approval
          </h4>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-brand-200 dark:border-brand-800 flex-shrink-0 bg-brand-50 dark:bg-brand-900/20">
              {ownerPhoto ? (
                <img
                  src={ownerPhoto}
                  alt={business.owner?.name || "Owner"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        "/api/businesses?isApproved=false&limit=50&_=" + Date.now(),
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
