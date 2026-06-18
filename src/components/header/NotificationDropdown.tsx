"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Modal } from "../ui/modal";
import toast from "@/utils/toast";

interface Business {
  id: string;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  street?: string | null;
  createdAt: string;
  owner?: {
    name: string;
    email: string;
    image: string | null;
  };
  category?: {
    name: string;
    icon: string | null;
  };
  region?: {
    name: string;
  };
  district?: {
    name: string;
  };
  ward?: {
    name: string;
  };
}

export default function NotificationDropdown() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [unapprovedBusinesses, setUnapprovedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [approving, setApproving] = useState(false);

  // Fetch unapproved or unverified businesses (admin only)
  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;

    const fetchUnapprovedBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/businesses?isApproved=false&isVerified=false&limit=20');
        if (response.ok) {
          const data = await response.json();
          const businesses = data.businesses || [];
          setUnapprovedBusinesses(businesses);
          setNotifying(businesses.length > 0);
        }
      } catch (error) {
        console.error('Error fetching unapproved businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnapprovedBusinesses();
  }, [status, isAdmin]);

  if (!isAdmin) return null;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Handle notification click - show modal immediately, then fetch full business details
  const handleBusinessClick = async (businessId: string) => {
    // Open modal immediately with loading state
    setIsModalOpen(true);
    setSelectedBusiness(null);
    closeDropdown();
    
    try {
      const response = await fetch(`/api/businesses/${businessId}`);
      if (response.ok) {
        const business = await response.json();
        setSelectedBusiness(business);
      } else {
        toast.error('Failed to load business details');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error fetching business details:', error);
      toast.error('Failed to load business details');
      setIsModalOpen(false);
    }
  };

  // Approve business
  const handleApproveBusiness = async () => {
    if (!selectedBusiness) return;

    try {
      setApproving(true);
      const response = await fetch(`/api/businesses/${selectedBusiness.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true, isVerified: true }),
      });

      if (response.ok) {
        toast.success('Business approved successfully');
        setIsModalOpen(false);
        setSelectedBusiness(null);
        // Refresh the list
        const updatedList = unapprovedBusinesses.filter(b => b.id !== selectedBusiness.id);
        setUnapprovedBusinesses(updatedList);
        setNotifying(updatedList.length > 0);
      } else {
        toast.error('Failed to approve business');
      }
    } catch (error) {
      console.error('Error approving business:', error);
      toast.error('Failed to approve business');
    } finally {
      setApproving(false);
    }
  };
  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {unapprovedBusinesses.length > 0 && (
          <>
            <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
              <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
            </span>
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-500 rounded-full border-2 border-white dark:border-gray-900">
              {unapprovedBusinesses.length > 99 ? '99+' : unapprovedBusinesses.length}
            </span>
          </>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notification
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <li className="flex items-center justify-center p-8">
              <div className="h-8 w-8 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
            </li>
          ) : unapprovedBusinesses.length === 0 ? (
            <li className="flex flex-col items-center justify-center p-8 text-center">
              <svg className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No pending approvals</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All businesses are approved</p>
            </li>
          ) : (
            unapprovedBusinesses.map((business) => (
              <li key={business.id}>
                <button
                  type="button"
                  onClick={() => handleBusinessClick(business.id)}
                  className="w-full flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 text-left transition-colors"
                >
                  <span className="relative block w-full h-10 rounded-full z-1 max-w-10">
                    {business.owner?.image ? (
                      <Image
                        width={40}
                        height={40}
                        src={business.owner.image}
                        alt={business.owner.name}
                        className="w-full overflow-hidden rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold">
                        {business.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-orange-400 dark:border-gray-900"></span>
                  </span>

                  <span className="block flex-1 min-w-0">
                    <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {business.owner?.name || 'Unknown User'}
                      </span>
                      <span> requests approval for </span>
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {business.name}
                      </span>
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>{business.category?.icon} {business.category?.name || 'Business'}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{formatTimeAgo(business.createdAt)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <Link
          href="/admin/businesses"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Businesses
        </Link>
      </Dropdown>

      {/* Business Details Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl p-6">
          {!selectedBusiness ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="h-12 w-12 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading business details...</p>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              {selectedBusiness.logo ? (
                <Image
                  src={selectedBusiness.logo}
                  alt={selectedBusiness.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                    {selectedBusiness.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedBusiness.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>{selectedBusiness.category?.icon}</span>
                  <span>{selectedBusiness.category?.name}</span>
                </p>
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Business Owner</h4>
              <div className="flex items-center gap-3">
                {selectedBusiness.owner?.image ? (
                  <Image
                    src={selectedBusiness.owner.image}
                    alt={selectedBusiness.owner.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <span className="text-lg font-semibold text-brand-600 dark:text-brand-400">
                      {selectedBusiness.owner?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedBusiness.owner?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBusiness.owner?.email}</p>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedBusiness.description && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBusiness.description}</p>
                </div>
              )}
              
              {selectedBusiness.phone && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBusiness.phone}</p>
                </div>
              )}
              
              {selectedBusiness.email && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBusiness.email}</p>
                </div>
              )}
              
              {selectedBusiness.website && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Website</h4>
                  <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
                    {selectedBusiness.website}
                  </a>
                </div>
              )}
              
              {(selectedBusiness.region || selectedBusiness.district || selectedBusiness.ward || selectedBusiness.street) && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {[selectedBusiness.street, selectedBusiness.ward?.name, selectedBusiness.district?.name, selectedBusiness.region?.name].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveBusiness}
                disabled={approving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {approving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve Business
                  </>
                )}
              </button>
            </div>
          </div>
          )}
        </Modal>
      )}
    </div>
  );
}
