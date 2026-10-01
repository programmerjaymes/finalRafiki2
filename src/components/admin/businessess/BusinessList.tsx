'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { FiEdit, FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiUpload, FiX, FiImage, FiMapPin, FiPhone, FiMail, FiGlobe, FiUser, FiRefreshCw, FiMoreVertical, FiCheckCircle, FiPower, FiClock } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TanzaniaPhoneInput from '@/components/form/input/TanzaniaPhoneInput';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';
import toast from '@/utils/toast';
import { t } from '@/lib/i18n';
import { useLocale } from '@/lib/useLocale';
import { useSession } from 'next-auth/react';
import { resolveBusinessImageSrc } from '@/lib/businessImage';
import PaymentProcessor from '@/components/business/PaymentProcessor';
import {
  buildBusinessDecisionMessage,
  type BusinessDecisionLanguage,
} from '@/lib/businessDecisionMessage';

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
  deactivationReason: string | null;
  bundleId: string;
  bundleExpiresAt: string;
  categoryId: string;
  categoryId2: string | null;
  latitude: number | null;
  longitude: number | null;
  regionId: string;
  districtId: string;
  wardId: string;
  street: string | null;
  avgRating: number;
  numReviews: number;
  ownerId: string;
  registrarId: string | null;
  createdAt: string;
  updatedAt: string;
  images?: BusinessImage[];
  
  // Included relations
  category?: {
    name: string;
    icon: string | null;
  };
  owner?: {
    name: string;
    email: string;
    image: string | null;
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
  bundle?: {
    name: string;
    price: number;
    duration: number;
    maxImages: number;
  };
  renewalRequests?: Array<{
    id: string;
    status: 'PENDING';
    requestedAt: string;
    newBundle: { id: string; name: string; price: number; duration: number };
  }>;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface Region {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  regionId: string;
}

interface Ward {
  id: string;
  name: string;
  districtId: string;
}

interface Bundle {
  id: string;
  name: string;
  price: number;
  duration: number;
  maxImages: number;
}

interface BundleHistoryItem {
  id: string;
  bundleName: string;
  bundlePrice: number;
  bundleDuration: number;
  startedAt: string;
  expiresAt: string;
  source: 'INITIAL' | 'RENEWAL';
}

interface User {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  role?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type BusinessListProps = {
  /** Owner portal: only the signed-in owner's businesses, no admin assign flow */
  variant?: 'admin' | 'owner';
  ownerIdFilter?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function getExpiryDisplay(expiresAt: string, locale: string) {
  const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / DAY_MS);
  const sw = locale === 'sw';

  if (daysLeft < 0) {
    const elapsed = Math.abs(daysLeft);
    return {
      label: sw
        ? `Iliisha siku ${elapsed} zilizopita`
        : `Expired ${elapsed} day${elapsed === 1 ? '' : 's'} ago`,
      className: 'bg-red-600 text-white',
    };
  }
  if (daysLeft === 0) {
    return {
      label: sw ? 'Inaisha leo' : 'Expires today',
      className: 'bg-red-600 text-white',
    };
  }
  if (daysLeft <= 30) {
    return {
      label: sw
        ? `Siku ${daysLeft} zimebaki`
        : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
      className: 'bg-amber-500 text-gray-950',
    };
  }
  return {
    label: sw
      ? `Siku ${daysLeft} zimebaki`
      : `${daysLeft} days left`,
    className: 'bg-emerald-600 text-white',
  };
}

// Helper: convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const BusinessList = ({ variant = 'admin', ownerIdFilter }: BusinessListProps) => {
  const locale = useLocale();
  const messages = t(locale);
  const isOwnerPortal = variant === 'owner';

  // Data states
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [users, setUsers] = useState<User[] | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterRegionId, setFilterRegionId] = useState('');
  const [filterDistrictId, setFilterDistrictId] = useState('');
  const [filterWardId, setFilterWardId] = useState('');
  const [expiryStatus, setExpiryStatus] = useState('');
  const [renewalBusiness, setRenewalBusiness] = useState<Business | null>(null);
  const [renewalBundleId, setRenewalBundleId] = useState('');
  const [renewalPaymentReference, setRenewalPaymentReference] = useState('');
  const [renewalSubmitting, setRenewalSubmitting] = useState(false);
  const [historyBusiness, setHistoryBusiness] = useState<Business | null>(null);
  const [bundleHistory, setBundleHistory] = useState<BundleHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<{
    business: Business;
    decision: 'APPROVED' | 'DISAPPROVED';
  } | null>(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [approvalLanguage, setApprovalLanguage] = useState<BusinessDecisionLanguage>('sw');
  const [approvalNotifyOwner, setApprovalNotifyOwner] = useState(true);
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });
  
  // Filtered districts and wards based on selected region/district
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [filteredWards, setFilteredWards] = useState<Ward[]>([]);
  
  // Modal states
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isViewModalOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  
  // Current business for edit/view (with full details including images)
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    logo: '',
    coverImage: '',
    facebook: '',
    instagram: '',
    twitter: '',
    allowsOnlineBooking: false,
    allowsDelivery: false,
    bundleId: '',
    categoryId: '',
    categoryId2: '',
    latitude: '',
    longitude: '',
    regionId: '',
    districtId: '',
    wardId: '',
    street: '',
    ownerId: '',
    isVerified: false,
    isApproved: false
  });

  // Logo & image upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<BusinessImage[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // User search state for owner assignment
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [assignUserFocused, setAssignUserFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Category multi-select (up to 2)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  // Fetch businesses with pagination and search
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: paginationMeta?.page?.toString() || '1',
        limit: paginationMeta?.limit?.toString() || '9'
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      if (selectedCategory) {
        queryParams.append('category', selectedCategory);
      }

      if (filterRegionId) {
        queryParams.append('region', filterRegionId);
      }
      if (filterDistrictId) {
        queryParams.append('district', filterDistrictId);
      }
      if (filterWardId) {
        queryParams.append('ward', filterWardId);
      }
      if (expiryStatus) {
        queryParams.append('expiryStatus', expiryStatus);
      }

      // Owner portal / business owners: only their businesses
      if ((userRole === 'BUSINESS_OWNER' || isOwnerPortal) && userId) {
        queryParams.append('ownerId', userId);
      } else if (ownerIdFilter) {
        queryParams.append('ownerId', ownerIdFilter);
      }
      if (!isOwnerPortal) {
        queryParams.append('adminView', 'true');
      }

      // Add cache-busting timestamp and use keep-alive for faster loading
      queryParams.append('_', Date.now().toString());
      
      // Use lean mode to exclude heavy image data from list view
      queryParams.append('lean', 'true');
      
      const response = await fetch(`/api/businesses?${queryParams.toString()}`, {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }
      
      const data = await response.json();
      
      setBusinesses(data.businesses || []);
      const raw = data.meta || data.pagination;
      setPaginationMeta({
        page: raw?.page ?? 1,
        limit: raw?.limit ?? 9,
        total: raw?.total ?? 0,
        totalPages: raw?.totalPages ?? raw?.pages ?? 0,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to load businesses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh to clear caches
  const handleRefresh = async () => {
    try {
      setLoading(true);
      // Clear client-side caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      // Revalidate Next.js data cache
      await fetch('/api/revalidate?path=/api/businesses', { method: 'POST' }).catch(() => {});
      // Refetch data with cache busting
      await fetchBusinesses();
      toast.success('Data refreshed');
    } catch (err) {
      toast.error('Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  // Fetch full business details (including images) for view/edit
  const fetchBusinessDetails = async (id: string): Promise<Business | null> => {
    try {
      const response = await fetch(`/api/businesses/${id}?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Failed to fetch business details');
      return await response.json();
    } catch (err) {
      console.error('Error fetching business details:', err);
      return null;
    }
  };
  
  // Fetch reference data (categories, regions, bundles, users)
  const fetchReferenceData = async () => {
    try {
      const [categoryRes, regionRes, districtRes, wardRes, bundleRes, userRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/regions'),
        fetch('/api/districts'),
        fetch('/api/wards'),
        fetch('/api/bundles'),
        fetch('/api/users?limit=500&page=1'),
      ]);

      if (categoryRes.ok) setCategories(await categoryRes.json());
      if (regionRes.ok) setRegions(await regionRes.json());
      if (districtRes.ok) setDistricts(await districtRes.json());
      if (wardRes.ok) setWards(await wardRes.json());
      if (bundleRes.ok) setBundles(await bundleRes.json());
      
      if (userRes.ok && !isOwnerPortal) {
        const userData = await userRes.json();
        let list: User[] = [];
        if (Array.isArray(userData)) {
          list = userData;
        } else if (userData?.users && Array.isArray(userData.users)) {
          list = userData.users;
        } else if (userData?.data && Array.isArray(userData.data)) {
          list = userData.data;
        }
        setUsers(list);
      }
    } catch (err) {
      console.error('Error fetching reference data:', err);
      setError('Failed to load reference data. Please try again later.');
      setUsers([]);
    }
  };
  
  // Initial reference data (business list loads via effect below)
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Refetch businesses when search, pagination or category filter changes
  useEffect(() => {
    if (isOwnerPortal && !userId) return;
    if (paginationMeta) {
      fetchBusinesses();
    }
  }, [
    search,
    paginationMeta?.page,
    paginationMeta?.limit,
    selectedCategory,
    filterRegionId,
    filterDistrictId,
    filterWardId,
    expiryStatus,
    userRole,
    userId,
    isOwnerPortal,
    ownerIdFilter,
  ]);
  
  // Update filtered districts when region changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.regionId) {
        try {
          const response = await fetch(`/api/districts?regionId=${formData.regionId}`);
          if (response.ok) {
            const data = await response.json();
            setFilteredDistricts(data);
          }
        } catch (err) {
          console.error('Error fetching districts:', err);
        }
      } else {
        setFilteredDistricts([]);
      }
    };
    loadDistricts();
  }, [formData.regionId]);
  
  // Update filtered wards when district changes
  useEffect(() => {
    const loadWards = async () => {
      if (formData.districtId) {
        try {
          const response = await fetch(`/api/wards?districtId=${formData.districtId}`);
          if (response.ok) {
            const data = await response.json();
            setFilteredWards(data);
          }
        } catch (err) {
          console.error('Error fetching wards:', err);
        }
      } else {
        setFilteredWards([]);
      }
    };
    loadWards();
  }, [formData.districtId]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPaginationMeta((prev) => ({ ...prev, page: 1 }));
  };
  
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginationMeta(prev => ({ ...prev, page: 1 }));
    fetchBusinesses();
  };
  
  // Handle category filter change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPaginationMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setFilterRegionId(v);
    setFilterDistrictId('');
    setFilterWardId('');
    setPaginationMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setFilterDistrictId(v);
    setFilterWardId('');
    setPaginationMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterWardId(e.target.value);
    setPaginationMeta((prev) => ({ ...prev, page: 1 }));
  };

  const listFilterDistricts = filterRegionId
    ? districts.filter((d) => String(d.regionId) === filterRegionId)
    : [];

  const listFilterWards = filterDistrictId
    ? wards.filter((w) => String(w.districtId) === filterDistrictId)
    : [];
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (!paginationMeta || newPage < 1 || newPage > (paginationMeta.totalPages || 1)) return;
    setPaginationMeta(prev => ({ ...prev, page: newPage }));
  };
  
  // Reset form data for new business
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
      logo: '',
      coverImage: '',
      facebook: '',
      instagram: '',
      twitter: '',
      allowsOnlineBooking: false,
      allowsDelivery: false,
      bundleId: '',
      categoryId: '',
      categoryId2: '',
      latitude: '',
      longitude: '',
      regionId: '',
      districtId: '',
      wardId: '',
      street: '',
      ownerId: '',
      isVerified: false,
      isApproved: false
    });
    setLogoPreview(null);
    setProductImages([]);
    setExistingImages([]);
    setSelectedUser(null);
    setUserSearchQuery('');
    setSelectedCategoryIds([]);
  };

  const selectOwnerUser = (user: User) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, ownerId: user.id }));
    setUserSearchQuery('');
    setAssignUserFocused(false);
  };

  const clearOwnerUser = () => {
    setSelectedUser(null);
    setFormData((prev) => ({ ...prev, ownerId: '' }));
    setUserSearchQuery('');
    setAssignUserFocused(false);
  };

  const resolveOwnerFromBusiness = (full: Business): User | null => {
    if (full.owner) {
      return { id: full.ownerId, name: full.owner.name, email: full.owner.email || '' };
    }
    if (full.ownerId) {
      const fromList = (users ?? []).find((u) => u.id === full.ownerId);
      if (fromList) return fromList;
      return { id: full.ownerId, name: 'Unknown user', email: '' };
    }
    return null;
  };
  
  // Handle input change for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: inputValue }));
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success('Location detected successfully');
        setDetectingLocation(false);
      },
      (err) => {
        toast.error(err.message || 'Could not detect your location');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  // Handle logo file selection
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setLogoPreview(base64);
      setFormData(prev => ({ ...prev, logo: base64 }));
    } catch (err) {
      console.error('Error reading logo file:', err);
    }
  };

  // Handle product image selection
  const handleProductImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selectedBundle = bundles.find(b => b.id === formData.bundleId);
    const maxImages = selectedBundle?.maxImages || 5;
    const remaining = maxImages - productImages.length;
    const toProcess = Array.from(files).slice(0, remaining);
    
    try {
      const newImages = await Promise.all(toProcess.map(f => fileToBase64(f)));
      setProductImages(prev => [...prev, ...newImages]);
    } catch (err) {
      console.error('Error reading image files:', err);
    }
    // Reset file input
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  // Remove a product image by index
  const removeProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle category in multi-select (max 2)
  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(catId)) {
        const next = prev.filter(id => id !== catId);
        setFormData(fd => ({
          ...fd,
          categoryId: next[0] || '',
          categoryId2: next[1] || ''
        }));
        return next;
      }
      if (prev.length >= 2) return prev;
      const next = [...prev, catId];
      setFormData(fd => ({
        ...fd,
        categoryId: next[0] || '',
        categoryId2: next[1] || ''
      }));
      return next;
    });
  };
  
  // Open add modal
  const handleOpenAddModal = () => {
    resetFormData();
    openAddModal();
  };
  
  // Open edit modal — open immediately with loader, then fetch full details
  const handleEdit = async (business: Business) => {
    // Open modal immediately with loading state
    setCurrentBusiness(null);
    openEditModal();
    setViewLoading(true);
    
    // Fetch full details in background
    const full = await fetchBusinessDetails(business.id);
    setViewLoading(false);
    
    if (!full) { 
      toast.error('Failed to load business details'); 
      closeEditModal();
      return; 
    }
    
    setCurrentBusiness(full);
    setFormData({
      name: full.name,
      description: full.description || '',
      phone: full.phone || '',
      whatsapp: full.whatsapp || '',
      email: full.email || '',
      website: full.website || '',
      logo: full.logo || '',
      coverImage: full.coverImage || '',
      facebook: full.facebook || '',
      instagram: full.instagram || '',
      twitter: full.twitter || '',
      allowsOnlineBooking: full.allowsOnlineBooking,
      allowsDelivery: full.allowsDelivery,
      bundleId: full.bundleId,
      categoryId: full.categoryId,
      categoryId2: full.categoryId2 || '',
      latitude: full.latitude?.toString() || '',
      longitude: full.longitude?.toString() || '',
      regionId: full.regionId,
      districtId: full.districtId,
      wardId: full.wardId,
      street: full.street || '',
      ownerId: full.ownerId,
      isVerified: full.isVerified,
      isApproved: full.isApproved
    });
    setLogoPreview(full.logo || null);
    setSelectedCategoryIds([full.categoryId, full.categoryId2].filter(Boolean) as string[]);
    setExistingImages(full.images || []);
    setProductImages([]);
    
    setSelectedUser(resolveOwnerFromBusiness(full));
  };
  
  // Open view modal — fetch full details first
  const handleView = async (business: Business) => {
    setViewLoading(true);
    openViewModal();
    const full = await fetchBusinessDetails(business.id);
    setViewLoading(false);
    if (full) {
      setCurrentBusiness(full);
    } else {
      setCurrentBusiness(business);
    }
  };
  
  // Delete business
  const handleDelete = async (business: Business) => {
    try {
      const result = await toast.confirm(
        'Confirm Delete',
        `Are you sure you want to delete "${business.name}"? This action cannot be undone.`,
        'warning'
      );
      
      if (result.isConfirmed) {
        const response = await fetch(`/api/businesses/${business.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete business');
        await fetchBusinesses();
        toast.success('Business deleted successfully');
      }
    } catch (err) {
      console.error('Error during delete:', err);
      toast.error('Failed to delete business');
    }
  };

  const openRenewal = (business: Business) => {
    setRenewalBusiness(business);
    setRenewalBundleId('');
    setRenewalPaymentReference('');
  };

  const closeRenewal = () => {
    if (renewalSubmitting) return;
    setRenewalBusiness(null);
    setRenewalBundleId('');
    setRenewalPaymentReference('');
  };

  const submitRenewal = async () => {
    if (!renewalBusiness || !renewalBundleId) return;
    const selectedBundle = bundles.find((bundle) => bundle.id === renewalBundleId);
    if (!selectedBundle) return;
    if (isOwnerPortal && selectedBundle.price > 0 && !renewalPaymentReference) {
      toast.error(locale === 'sw' ? 'Kamilisha hatua ya malipo kwanza' : 'Complete the payment step first');
      return;
    }

    setRenewalSubmitting(true);
    try {
      const response = await fetch(`/api/businesses/${renewalBusiness.id}/renewals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: selectedBundle.id,
          paymentReference: renewalPaymentReference || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to request renewal');
      toast.success(locale === 'sw' ? 'Ombi la kuhuisha limetumwa kwa msimamizi' : 'Renewal request sent for admin approval');
      setRenewalBusiness(null);
      await fetchBusinesses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to request renewal');
    } finally {
      setRenewalSubmitting(false);
    }
  };

  const decideRenewal = async (business: Business, decision: 'APPROVED' | 'REJECTED') => {
    const renewal = business.renewalRequests?.[0];
    if (!renewal) return;
    let rejectionReason = '';
    if (decision === 'REJECTED') {
      rejectionReason = window.prompt('Enter the reason for rejecting this renewal:')?.trim() || '';
      if (!rejectionReason) return;
    } else {
      const result = await toast.confirm(
        'Approve renewal?',
        `Assign ${renewal.newBundle.name} to "${business.name}" for ${renewal.newBundle.duration} days?`,
        'question',
        'Approve renewal',
        'Cancel',
      );
      if (!result.isConfirmed) return;
    }

    try {
      const response = await fetch(`/api/business-renewals/${renewal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, rejectionReason }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to update renewal');
      toast.success(decision === 'APPROVED' ? 'Renewal approved' : 'Renewal rejected');
      await fetchBusinesses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update renewal');
    }
  };

  const openBundleHistory = async (business: Business) => {
    setHistoryBusiness(business);
    setHistoryLoading(true);
    setBundleHistory([]);
    try {
      const response = await fetch(`/api/businesses/${business.id}/renewals`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to load bundle history');
      setBundleHistory(data.history || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load bundle history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const updateBusinessStatus = async (
    business: Business,
    action: 'APPROVE' | 'DISAPPROVE' | 'ACTIVATE' | 'DEACTIVATE',
  ) => {
    setOpenActionMenuId(null);
    let reason = '';
    let payload: Record<string, unknown>;

    if (action === 'DISAPPROVE') {
      reason = window.prompt('Enter the reason for disapproving this business:')?.trim() || '';
      if (!reason) return;
      payload = {
        isApproved: false,
        isVerified: false,
        approvalDecision: 'DISAPPROVED',
        deactivationReason: reason,
        notifyOwner: true,
        notificationLanguage: locale === 'sw' ? 'sw' : 'en',
      };
    } else if (action === 'APPROVE') {
      const confirmation = await toast.confirm(
        'Approve business?',
        `Approve "${business.name}" and notify the owner?`,
        'question',
        'Approve',
        'Cancel',
      );
      if (!confirmation.isConfirmed) return;
      payload = {
        isApproved: true,
        isVerified: true,
        approvalDecision: 'APPROVED',
        notifyOwner: true,
        notificationLanguage: locale === 'sw' ? 'sw' : 'en',
      };
    } else {
      const activating = action === 'ACTIVATE';
      const confirmation = await toast.confirm(
        activating ? 'Activate business?' : 'Deactivate business?',
        activating
          ? `Make "${business.name}" active and publicly visible again?`
          : `Deactivate "${business.name}" and remove it from public listings?`,
        activating ? 'question' : 'warning',
        activating ? 'Activate' : 'Deactivate',
        'Cancel',
      );
      if (!confirmation.isConfirmed) return;
      payload = {
        isApproved: activating,
        isVerified: activating,
        adminStatusAction: activating ? 'ACTIVATED' : 'DEACTIVATED',
        deactivationReason: activating ? null : 'Deactivated by administrator',
        notifyOwner: false,
      };
    }

    try {
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to update business');
      toast.success(
        action === 'APPROVE'
          ? 'Business approved'
          : action === 'DISAPPROVE'
            ? 'Business disapproved'
            : action === 'ACTIVATE'
              ? 'Business activated'
              : 'Business deactivated',
      );
      await fetchBusinesses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update business');
    }
  };

  const openApprovalDecision = (
    business: Business,
    decision: 'APPROVED' | 'DISAPPROVED',
  ) => {
    setOpenActionMenuId(null);
    setApprovalReason('');
    setApprovalLanguage(locale === 'sw' ? 'sw' : 'en');
    setApprovalNotifyOwner(true);
    setApprovalDecision({ business, decision });
  };

  const submitApprovalDecision = async () => {
    if (!approvalDecision) return;
    const approved = approvalDecision.decision === 'APPROVED';
    if (!approved && !approvalReason.trim()) {
      toast.error('Enter a reason for disapproval');
      return;
    }
    setApprovalSubmitting(true);
    try {
      const response = await fetch(`/api/businesses/${approvalDecision.business.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          approved
            ? {
                isApproved: true,
                isVerified: true,
                approvalDecision: 'APPROVED',
                notifyOwner: approvalNotifyOwner,
                notificationLanguage: approvalLanguage,
              }
            : {
                isApproved: false,
                isVerified: false,
                approvalDecision: 'DISAPPROVED',
                deactivationReason: approvalReason.trim(),
                notifyOwner: approvalNotifyOwner,
                notificationLanguage: approvalLanguage,
              },
        ),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to save decision');
      toast.success(approved ? 'Business approved' : 'Business disapproved');
      setApprovalDecision(null);
      await fetchBusinesses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save decision');
    } finally {
      setApprovalSubmitting(false);
    }
  };
  
  // Create new business (admin flow — auto-approved)
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) { toast.error('Business name is required'); return; }
    if (!selectedUser) { toast.error('Please select an owner'); return; }
    if (!formData.bundleId) { toast.error('Please select a bundle'); return; }
    if (selectedCategoryIds.length === 0) { toast.error('Please select at least one category'); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        ownerId: selectedUser.id,
        categoryId: selectedCategoryIds[0],
        categoryId2: selectedCategoryIds[1] || null,
        images: productImages.length > 0 ? productImages : undefined,
      };
      
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create business');
      }
      
      await fetchBusinesses();
      closeAddModal();
      toast.success('Business created & approved successfully');
      resetFormData();
    } catch (err: any) {
      console.error('Error creating business:', err);
      toast.error(err.message || 'Failed to create business');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update business
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    
    if (!formData.name) { toast.error('Business name is required'); return; }
    if (!isOwnerPortal && !selectedUser) { toast.error('Please select an owner'); return; }
    if (!formData.bundleId) { toast.error('Please select a bundle'); return; }
    if (selectedCategoryIds.length === 0) { toast.error('Please select at least one category'); return; }

    setSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        ownerId: isOwnerPortal ? userId : selectedUser!.id,
        categoryId: selectedCategoryIds[0],
        categoryId2: selectedCategoryIds[1] || null,
      };

      // Include new product images if any were added
      if (productImages.length > 0) {
        // Combine existing + new
        const allImages = [
          ...existingImages.map(img => img.imageData),
          ...productImages
        ];
        payload.images = allImages;
      }
      
      const response = await fetch(`/api/businesses/${currentBusiness.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to update business');
      
      await fetchBusinesses();
      closeEditModal();
      toast.success('Business updated successfully');
    } catch (err) {
      console.error('Error updating business:', err);
      toast.error('Failed to update business');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((cat) => {
    const query = categorySearchQuery.trim().toLowerCase();
    if (!query) return true;
    const name = cat.name?.toLowerCase() ?? '';
    return name.includes(query);
  });

  // Users for owner picker: filter when typing, else show all users
  const filteredUsers = Array.isArray(users)
    ? (() => {
        const q = userSearchQuery.trim().toLowerCase();
        let list = users;
        if (q) {
          list = users.filter((u) => {
            const name = u.name?.toLowerCase() ?? '';
            const email = u.email?.toLowerCase() ?? '';
            const phone = u.phone?.toLowerCase() ?? '';
            return name.includes(q) || email.includes(q) || phone.includes(q);
          });
        }
        return list.slice(0, 20);
      })()
    : [];

  // Show dropdown when focused, even without search query
  const showUserPicker =
    !selectedUser && assignUserFocused && filteredUsers.length > 0;

  // Product Photo Carousel - Optimized to load only first image initially
  const ProductCarousel = ({ business }: { business: Business }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])); // Only load first image
    const [imageError, setImageError] = useState<Record<number, boolean>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    // Get product photos metadata (lightweight - just strings, no actual image data loaded yet)
    const productImages = useMemo(() => {
      const imgs: string[] = [];
      if (business.images && business.images.length > 0) {
        imgs.push(...business.images.map(img => img.imageData));
      }
      if (business.logo) imgs.push(business.logo);
      if (business.coverImage) imgs.unshift(business.coverImage);
      return imgs;
    }, [business.images?.length, business.logo, business.coverImage]);

    const hasImages = productImages.length > 0;
    const totalImages = productImages.length;

    // Load image when index changes (lazy loading)
    useEffect(() => {
      if (!hasImages) return;
      
      // Mark current and adjacent images for loading
      setLoadedImages(prev => {
        const next = new Set(prev);
        next.add(currentIndex);
        // Preload next image
        next.add((currentIndex + 1) % totalImages);
        return next;
      });
    }, [currentIndex, hasImages, totalImages]);

    // Auto-play with intersection observer (pause when not visible)
    useEffect(() => {
      if (totalImages <= 1 || !containerRef.current) return;

      let interval: NodeJS.Timeout;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Start auto-play when visible
              interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % totalImages);
              }, 3000);
            } else {
              // Pause when not visible
              clearInterval(interval);
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(containerRef.current);
      
      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }, [totalImages]);

    const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    };

    const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    const handleImageError = (idx: number) => {
      setImageError(prev => ({ ...prev, [idx]: true }));
    };

    // Fallback when no images
    if (!hasImages) {
      return (
        <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-2">
            <FiImage className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
            Photo of products of this business for now
          </span>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="h-full w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {/* Only render images that have been marked for loading */}
        {productImages.map((imgData, idx) => {
          const isLoaded = loadedImages.has(idx);
          const isCurrent = idx === currentIndex;
          const hasError = imageError[idx];
          
          if (!isLoaded || hasError) return null;
          
          const displaySrc = resolveBusinessImageSrc(imgData);
          if (!displaySrc) return null;
          
          return (
            <img
              key={idx}
              src={displaySrc}
              alt={`${business.name} - Photo ${idx + 1}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              onError={() => handleImageError(idx)}
            />
          );
        })}

        {/* Photo Count Badge */}
        {totalImages > 1 && (
          <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
            <FiImage className="h-3 w-3 inline mr-1" />
            {currentIndex + 1} / {totalImages}
          </div>
        )}

        {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
        {totalImages > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg transition-all"
              aria-label="Previous photo"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 dark:bg-black/60 hover:bg-white dark:hover:bg-black/80 text-gray-800 dark:text-white rounded-full flex items-center justify-center shadow-lg transition-all"
              aria-label="Next photo"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <div className="flex justify-center gap-1.5">
                {productImages.slice(0, 5).map((_: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  />
                ))}
                {totalImages > 5 && (
                  <span className="text-white/70 text-xs self-center">+{totalImages - 5}</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Hover overlay with business name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-xl font-medium text-gray-900 dark:text-white">
            {isOwnerPortal ? (locale === 'sw' ? 'Biashara Zangu' : 'My Businesses') : (locale === 'sw' ? 'Usimamizi wa Biashara' : 'Business Management')}
          </h4>
          {isOwnerPortal && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {locale === 'sw' ? 'Simamia orodha za biashara zako' : 'Manage your business listings'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleRefresh}>
            <FiRefreshCw className="h-4 w-4" />
            {locale === 'sw' ? 'Onyesha upya' : 'Refresh'}
          </Button>
          {isOwnerPortal ? (
            <Link href="/business-create">
              <Button variant="primary" size="sm" className="flex items-center gap-1">
                <FiPlus className="h-4 w-4" />
                {locale === 'sw' ? 'Ongeza Biashara' : 'Add Business'}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="sm" className="flex items-center gap-1" onClick={handleOpenAddModal}>
              <FiPlus className="h-4 w-4" />
              Add Business
            </Button>
          )}
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-boxdark p-4 rounded-lg border border-stroke dark:border-strokedark mb-6">
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search businesses..."
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={search}
                onChange={handleSearchChange}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {messages.admin.categories}
              </label>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {messages.search.mkoa}
              </label>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={filterRegionId}
                onChange={handleFilterRegionChange}
              >
                <option value="">{messages.search.allLocations}</option>
                {regions.map((region) => (
                  <option key={String(region.id)} value={String(region.id)}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {messages.search.wilaya}
              </label>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-55 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={filterDistrictId}
                onChange={handleFilterDistrictChange}
                disabled={!filterRegionId}
              >
                <option value="">
                  {!filterRegionId ? messages.search.pickMkoaFirst : messages.search.allWilaya}
                </option>
                {listFilterDistricts.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {messages.search.kijiji}
              </label>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-55 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={filterWardId}
                onChange={handleFilterWardChange}
                disabled={!filterDistrictId}
              >
                <option value="">
                  {!filterDistrictId ? messages.search.pickWilayaFirst : messages.search.allKijiji}
                </option>
                {listFilterWards.map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {locale === 'sw' ? 'Muda wa kifurushi' : 'Bundle expiry'}
              </label>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={expiryStatus}
                onChange={(event) => {
                  setExpiryStatus(event.target.value);
                  setPaginationMeta((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <option value="">{locale === 'sw' ? 'Zote' : 'All expiry dates'}</option>
                <option value="near">{locale === 'sw' ? 'Zinaisha ndani ya siku 30' : 'Expiring within 30 days'}</option>
                <option value="expired">{locale === 'sw' ? 'Zilizoisha' : 'Expired'}</option>
                <option value="active">{locale === 'sw' ? 'Bado zinaendelea' : 'Active'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-error-500/10 text-error-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Business Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
            {businesses.map((business) => (
              <div
                key={business.id}
                onClick={() => handleView(business)}
                className="bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col cursor-pointer"
              >
                {/* ── Carousel (fixed height) ── */}
                <div className="relative h-48 sm:h-44 shrink-0 overflow-hidden rounded-t-xl">
                  <ProductCarousel business={business} />

                  {/* Status badges */}
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    {business.isVerified && (
                      <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                        ✓ Verified
                      </span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow ${business.isApproved ? 'bg-primary text-white' : business.deactivationReason ? 'bg-red-600 text-white' : 'bg-secondary text-gray-800'}`}>
                      {business.isApproved
                        ? 'Approved'
                        : business.renewalRequests?.length
                          ? 'Renewal pending'
                          : business.deactivationReason
                            ? 'Deactivated'
                            : 'Pending'}
                    </span>
                  </div>

                  {business.bundleExpiresAt && (() => {
                    const expiry = getExpiryDisplay(business.bundleExpiresAt, locale);
                    return (
                      <span className={`absolute left-2 top-2 z-10 rounded-full px-2 py-1 text-[10px] font-bold shadow ${expiry.className}`}>
                        {expiry.label}
                      </span>
                    );
                  })()}

                  {/* Name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2 z-10">
                    <p className="text-sm font-bold text-white leading-snug line-clamp-1">{business.name}</p>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="relative px-3 pt-2 pb-1 flex-1">
                  <div className="absolute right-2 top-2 z-30">
                    <button
                      type="button"
                      aria-label={locale === 'sw' ? 'Vitendo vya biashara' : 'Business actions'}
                      aria-expanded={openActionMenuId === business.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenActionMenuId((current) => current === business.id ? null : business.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <FiMoreVertical className="h-4 w-4" />
                    </button>
                    {openActionMenuId === business.id && (
                      <div
                        className="absolute right-0 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button type="button" onClick={() => { setOpenActionMenuId(null); void handleEdit(business); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800">
                          <FiEdit className="h-4 w-4" /> {locale === 'sw' ? 'Hariri' : 'Edit'}
                        </button>
                        <button type="button" onClick={() => { setOpenActionMenuId(null); void openBundleHistory(business); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800">
                          <FiClock className="h-4 w-4" /> {locale === 'sw' ? 'Historia ya vifurushi' : 'Bundle history'}
                        </button>

                        {!isOwnerPortal && !business.renewalRequests?.length && (
                          business.isApproved ? (
                            <button type="button" onClick={() => void updateBusinessStatus(business, 'DEACTIVATE')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10">
                              <FiPower className="h-4 w-4" /> Deactivate
                            </button>
                          ) : business.deactivationReason ? (
                            <button type="button" onClick={() => void updateBusinessStatus(business, 'ACTIVATE')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-500/10">
                              <FiPower className="h-4 w-4" /> Activate
                            </button>
                          ) : (
                            <>
                              <button type="button" onClick={() => openApprovalDecision(business, 'APPROVED')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-500/10">
                                <FiCheckCircle className="h-4 w-4" /> Approve
                              </button>
                              <button type="button" onClick={() => openApprovalDecision(business, 'DISAPPROVED')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10">
                                <FiX className="h-4 w-4" /> Disapprove
                              </button>
                            </>
                          )
                        )}

                        {new Date(business.bundleExpiresAt).getTime() <= Date.now() && !business.renewalRequests?.length && (
                          <button type="button" onClick={() => { setOpenActionMenuId(null); openRenewal(business); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
                            <FiRefreshCw className="h-4 w-4" /> {locale === 'sw' ? 'Huisha kifurushi' : 'Renew bundle'}
                          </button>
                        )}
                        <button type="button" onClick={() => { setOpenActionMenuId(null); void handleDelete(business); }} className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:border-gray-800 dark:text-red-300 dark:hover:bg-red-500/10">
                          <RiDeleteBin6Line className="h-4 w-4" /> {locale === 'sw' ? 'Futa' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="inline-flex max-w-[calc(100%-2.5rem)] items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-primary dark:bg-red-900/20">
                    {business.category?.icon} {business.category?.name || 'Uncategorized'}
                  </span>

                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <FiMapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{business.district?.name || business.region?.name || 'Location N/A'}</span>
                  </div>

                  {business.phone && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <FiPhone className="h-3 w-3 shrink-0" />
                      <span className="truncate">{business.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-1.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`h-3 w-3 ${s <= business.avgRating ? 'text-secondary' : 'text-gray-200 dark:text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-0.5">({business.numReviews || 0})</span>
                    <span className="ml-auto text-[10px] text-gray-400">{business.bundle?.name}</span>
                  </div>
                  {business.bundleExpiresAt && (
                    <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                      {locale === 'sw' ? 'Mwisho wa kifurushi' : 'Bundle expires'}:{' '}
                      {new Date(business.bundleExpiresAt).toLocaleDateString(locale === 'sw' ? 'sw-TZ' : 'en-TZ')}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void openBundleHistory(business);
                    }}
                    className="mt-2 text-[11px] font-semibold text-primary hover:underline"
                  >
                    {locale === 'sw' ? 'Historia ya vifurushi' : 'Bundle history'}
                  </button>
                </div>

                {business.renewalRequests?.[0] && (
                  <div className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-800/50 dark:bg-amber-950/30">
                    <p className="font-semibold text-amber-800 dark:text-amber-300">
                      {locale === 'sw' ? 'Ombi la kuhuisha linasubiri' : 'Renewal awaiting approval'}
                    </p>
                    <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                      {business.renewalRequests[0].newBundle.name} · {business.renewalRequests[0].newBundle.duration} {locale === 'sw' ? 'siku' : 'days'}
                    </p>
                    {!isOwnerPortal && (
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={(event) => { event.stopPropagation(); void decideRenewal(business, 'APPROVED'); }} className="rounded-md bg-green-600 px-2.5 py-1.5 font-semibold text-white hover:bg-green-700">
                          Approve renewal
                        </button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); void decideRenewal(business, 'REJECTED'); }} className="rounded-md bg-red-600 px-2.5 py-1.5 font-semibold text-white hover:bg-red-700">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {businesses.length === 0 && (
            <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {isOwnerPortal ? "You haven't created any businesses yet." : 'No businesses found'}
              </p>
              {isOwnerPortal ? (
                <Link href="/business-create">
                  <Button variant="primary" size="sm">Create Your First Business</Button>
                </Link>
              ) : (
                <Button variant="primary" size="sm" onClick={handleOpenAddModal}>Add Your First Business</Button>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {paginationMeta && paginationMeta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <nav className="flex items-center gap-2 flex-wrap justify-center" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationMeta.page - 1)}
                  disabled={paginationMeta.page === 1}
                  className={paginationMeta.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <FiChevronLeft className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === paginationMeta.totalPages ||
                      (page >= paginationMeta.page - 1 && page <= paginationMeta.page + 1)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="text-gray-500 dark:text-gray-400">...</span>
                      )}
                      <Button
                        variant={page === paginationMeta.page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationMeta.page + 1)}
                  disabled={paginationMeta.page === paginationMeta.totalPages}
                  className={
                    paginationMeta.page === paginationMeta.totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }
                >
                  <span className="hidden sm:inline">Next</span>
                  <FiChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </nav>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {paginationMeta.page} of {paginationMeta.totalPages}
                {paginationMeta.total ? ` · ${paginationMeta.total} total` : ''}
              </p>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={Boolean(approvalDecision)}
        onClose={() => {
          if (!approvalSubmitting) setApprovalDecision(null);
        }}
        className="max-h-[90vh] max-w-[620px] overflow-y-auto p-6"
      >
        {approvalDecision && (() => {
          const approved = approvalDecision.decision === 'APPROVED';
          const business = approvalDecision.business;
          const preview = buildBusinessDecisionMessage({
            decision: approvalDecision.decision,
            language: approvalLanguage,
            ownerName: business.owner?.name || (approvalLanguage === 'sw' ? 'mteja' : 'customer'),
            businessName: business.name,
            bundleName: business.bundle?.name || (approvalLanguage === 'sw' ? 'ulichochagua' : 'selected'),
            bundleDuration: business.bundle?.duration || 0,
            disapprovalReason:
              approvalReason.trim() ||
              (approvalLanguage === 'sw'
                ? '[andika sababu ya kutokuidhinisha]'
                : '[enter the reason for disapproval]'),
          });
          return (
            <>
              <h4 className="pr-12 text-xl font-semibold text-gray-900 dark:text-white">
                {approved ? 'Approve business?' : 'Disapprove business?'}
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{business.name}</p>

              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-gray-900 dark:text-white">SMS language</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([['sw', 'Kiswahili'], ['en', 'English']] as const).map(([value, label]) => (
                    <label key={value} className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold ${approvalLanguage === value ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}>
                      <input type="radio" name="card-approval-language" value={value} checked={approvalLanguage === value} onChange={() => setApprovalLanguage(value)} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {!approved && (
                <label className="mt-4 block">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Reason for disapproval *</span>
                  <textarea value={approvalReason} onChange={(event) => setApprovalReason(event.target.value.slice(0, 300))} rows={3} className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent p-3 text-sm dark:border-gray-700 dark:text-white" />
                  <span className="mt-1 block text-right text-xs text-gray-400">{approvalReason.length}/300</span>
                </label>
              )}

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">SMS message preview</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">{preview}</p>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <input type="checkbox" checked={approvalNotifyOwner} onChange={(event) => setApprovalNotifyOwner(event.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Notify the business owner by SMS</span>
              </label>

              <div className="mt-5 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setApprovalDecision(null)} disabled={approvalSubmitting}>Cancel</Button>
                <button type="button" onClick={() => void submitApprovalDecision()} disabled={approvalSubmitting || (!approved && !approvalReason.trim())} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${approved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {approvalSubmitting ? 'Saving…' : approved ? 'Approve' : 'Disapprove'}
                </button>
              </div>
            </>
          );
        })()}
      </Modal>

      <Modal
        isOpen={Boolean(renewalBusiness)}
        onClose={closeRenewal}
        className="max-h-[90vh] max-w-[760px] overflow-y-auto p-6"
      >
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
          {locale === 'sw' ? 'Huisha kifurushi cha biashara' : 'Renew business bundle'}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {renewalBusiness?.name} — {locale === 'sw' ? 'chagua kifurushi kipya. Kitaanza baada ya idhini ya msimamizi.' : 'select a new bundle. It starts after admin approval.'}
        </p>
        <div className="mt-5">
          <Label>{locale === 'sw' ? 'Kifurushi kipya' : 'New bundle'}</Label>
          <select
            value={renewalBundleId}
            onChange={(event) => {
              setRenewalBundleId(event.target.value);
              setRenewalPaymentReference('');
            }}
            className="mt-1 h-11 w-full rounded-lg border border-gray-300 px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">{locale === 'sw' ? 'Chagua kifurushi' : 'Select a bundle'}</option>
            {bundles.map((bundle) => (
              <option key={bundle.id} value={bundle.id}>
                {bundle.name} — TZS {bundle.price.toLocaleString()} / {bundle.duration} {locale === 'sw' ? 'siku' : 'days'}
              </option>
            ))}
          </select>
        </div>
        {(() => {
          const selected = bundles.find((bundle) => bundle.id === renewalBundleId);
          if (!selected) return null;
          if (isOwnerPortal && selected.price > 0 && !renewalPaymentReference) {
            return (
              <div className="mt-6">
                <PaymentProcessor
                  amount={selected.price}
                  bundleName={selected.name}
                  bundleDuration={selected.duration}
                  onComplete={setRenewalPaymentReference}
                />
              </div>
            );
          }
          return (
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeRenewal} disabled={renewalSubmitting}>
                {locale === 'sw' ? 'Ghairi' : 'Cancel'}
              </Button>
              <Button variant="primary" onClick={() => void submitRenewal()} disabled={renewalSubmitting}>
                {renewalSubmitting
                  ? (locale === 'sw' ? 'Inatuma…' : 'Submitting…')
                  : (locale === 'sw' ? 'Tuma ombi la kuhuisha' : 'Submit renewal request')}
              </Button>
            </div>
          );
        })()}
      </Modal>

      <Modal
        isOpen={Boolean(historyBusiness)}
        onClose={() => setHistoryBusiness(null)}
        className="max-h-[90vh] max-w-[680px] overflow-y-auto p-6"
      >
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
          {locale === 'sw' ? 'Historia ya vifurushi' : 'Bundle history'}
        </h4>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{historyBusiness?.name}</p>
        {historyLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">{locale === 'sw' ? 'Inapakia…' : 'Loading…'}</p>
        ) : bundleHistory.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">{locale === 'sw' ? 'Hakuna historia bado.' : 'No bundle history yet.'}</p>
        ) : (
          <div className="mt-5 space-y-3">
            {bundleHistory.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.bundleName}</p>
                    <p className="text-xs text-gray-500">TZS {item.bundlePrice.toLocaleString()} · {item.bundleDuration} {locale === 'sw' ? 'siku' : 'days'}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {item.source === 'RENEWAL' ? (locale === 'sw' ? 'Imehuishwa' : 'Renewal') : (locale === 'sw' ? 'Ya kwanza' : 'Initial')}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.startedAt).toLocaleDateString(locale === 'sw' ? 'sw-TZ' : 'en-TZ')} — {new Date(item.expiresAt).toLocaleDateString(locale === 'sw' ? 'sw-TZ' : 'en-TZ')}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
      
      {/* ═══ Shared Form Fields Component ═══ */}
      {(isAddModalOpen || isEditModalOpen) && (!isOwnerPortal || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={isAddModalOpen ? closeAddModal : closeEditModal}
          className="max-w-[900px] p-6 max-h-[90vh] overflow-y-auto"
        >
          {isEditModalOpen && !currentBusiness ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="h-12 w-12 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading business details...</p>
            </div>
          ) : (
          <form onSubmit={isAddModalOpen ? handleAdd : handleUpdate}>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
              {isAddModalOpen ? 'Add Business' : isOwnerPortal ? 'Edit My Business' : 'Edit Business'}
              <span className="block text-xs font-normal text-gray-500 mt-1">
                {isAddModalOpen
                  ? 'Create and assign to a user (auto-approved)'
                  : isOwnerPortal
                  ? 'Update your business details and photos'
                  : 'Update business details or reassign to a different user'}
              </span>
            </h4>

            {/* ── Assign to User (admin only) ── */}
            {!isOwnerPortal && (
            <div className="mb-6">
              <Label>Assign to User *</Label>
              {selectedUser ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700">
                  <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-600">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearOwnerUser}
                    title="Change assigned user"
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone…"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    onFocus={() => setAssignUserFocused(true)}
                    onBlur={() => {
                      window.setTimeout(() => setAssignUserFocused(false), 180);
                    }}
                  />
                  <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  {showUserPicker && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectOwnerUser(u)}
                        >
                          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-600">
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {[u.email, u.phone].filter(Boolean).join(' · ') || '—'}
                            </p>
                          </div>
                          {u.role && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{u.role}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* ── Company Logo ── */}
              <div className="col-span-1 sm:col-span-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4 mt-1">
                  <div
                    className="h-20 w-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary-400 transition-colors bg-gray-50 dark:bg-gray-800"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <FiUpload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <div className="text-sm text-gray-500">
                    <p>Click to upload logo</p>
                    {logoPreview && (
                      <button type="button" onClick={() => { setLogoPreview(null); setFormData(fd => ({ ...fd, logo: '' })); }} className="text-red-500 text-xs mt-1 hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Basic Fields ── */}
              <div className="col-span-1 sm:col-span-2">
                <Label>Business Name *</Label>
                <Input type="text" name="name" placeholder="Enter business name" defaultValue={formData.name} onChange={handleChange} />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label>Description</Label>
                <textarea name="description" placeholder="Describe the business" value={formData.description} onChange={handleChange}
                  className="h-20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
              </div>
              <div className="col-span-1">
                <Label>Phone *</Label>
                <TanzaniaPhoneInput
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1">
                <Label>WhatsApp</Label>
                <TanzaniaPhoneInput
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1">
                <Label>Email *</Label>
                <Input type="email" name="email" placeholder="business@email.com" defaultValue={formData.email} onChange={handleChange} />
              </div>
              <div className="col-span-1">
                <Label>Street Address</Label>
                <Input type="text" name="street" placeholder="Street address" defaultValue={formData.street} onChange={handleChange} />
              </div>
              <div className="col-span-1">
                <Label>Website</Label>
                <Input type="text" name="website" placeholder="https://..." defaultValue={formData.website} onChange={handleChange} />
              </div>

              {/* ── Bundle ── */}
              <div className="col-span-1">
                <Label>Bundle *</Label>
                <select name="bundleId" value={formData.bundleId} onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  <option value="">Select bundle</option>
                  {bundles.map(b => (
                    <option key={b.id} value={b.id}>{b.name} - {b.price.toLocaleString()} TZS</option>
                  ))}
                </select>
              </div>

              {/* ── Categories (multi-select up to 2) ── */}
              <div className="col-span-1 flex flex-col">
                <Label>Categories (up to 2) *</Label>
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col max-h-[280px]">
                  {/* Search input */}
                  <div className="p-2 border-b border-gray-300 dark:border-gray-700 flex-shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {selectedCategoryIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 max-h-[80px] overflow-y-auto">
                        {selectedCategoryIds.map(id => {
                          const cat = categories.find(c => c.id === id);
                          return cat ? (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs font-medium">
                              {cat.icon} {cat.name}
                              <button type="button" onClick={() => toggleCategory(id)} className="hover:text-red-500"><FiX className="h-3 w-3" /></button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-2 min-h-0">
                      <div className="space-y-1">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map(cat => (
                            <label key={cat.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${selectedCategoryIds.includes(cat.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                              <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(cat.id)}
                                onChange={() => toggleCategory(cat.id)}
                                disabled={!selectedCategoryIds.includes(cat.id) && selectedCategoryIds.length >= 2}
                                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                              />
                              <span>{cat.icon} {cat.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No categories found</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Region / District / Ward ── */}
              <div className="col-span-1">
                <Label>Region</Label>
                <select name="regionId" value={formData.regionId} onChange={(e) => { handleChange(e); setFormData(fd => ({ ...fd, districtId: '', wardId: '' })); }}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  <option value="">Select Region</option>
                  {regions.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                </select>
              </div>
              <div className="col-span-1">
                <Label>District</Label>
                <select name="districtId" value={formData.districtId} disabled={!formData.regionId}
                  onChange={(e) => { handleChange(e); setFormData(fd => ({ ...fd, wardId: '' })); }}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 disabled:opacity-50">
                  <option value="">{formData.regionId ? 'Select District' : 'Select a region first'}</option>
                  {filteredDistricts.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
              </div>
              <div className="col-span-1">
                <Label>Ward</Label>
                <select name="wardId" value={formData.wardId} disabled={!formData.districtId} onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 disabled:opacity-50">
                  <option value="">{formData.districtId ? 'Select Ward' : 'Select a district first'}</option>
                  {filteredWards.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
                </select>
              </div>

              {/* ── GPS Location ── */}
              <div className="col-span-1 sm:col-span-2">
                <Label>GPS Coordinates</Label>
                <div className="space-y-3">
                  <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20 p-3">
                    <FiMapPin className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                      <p className="font-semibold">{messages.business.gpsAtLocationTitle}</p>
                      <p className="mt-1">{messages.business.gpsAtLocationBody}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleDetectLocation}
                    loading={detectingLocation}
                    startIcon={<FiMapPin className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                  >
                    Detect my location
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="text" name="latitude" placeholder="Latitude (-6.8235)" value={formData.latitude} onChange={handleChange} disabled={detectingLocation} />
                    <Input type="text" name="longitude" placeholder="Longitude (39.2695)" value={formData.longitude} onChange={handleChange} disabled={detectingLocation} />
                  </div>
                </div>
              </div>

              {/* ── Checkboxes (edit only) ── */}
              {isEditModalOpen && (
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex flex-wrap gap-6">
                    {!isOwnerPortal && (
                      <>
                        <div className="flex items-center">
                          <Checkbox id="isApproved-form" checked={formData.isApproved} onChange={(checked) => handleCheckboxChange(checked, 'isApproved')} />
                          <Label htmlFor="isApproved-form" className="ml-2 cursor-pointer">Approved</Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox id="isVerified-form" checked={formData.isVerified} onChange={(checked) => handleCheckboxChange(checked, 'isVerified')} />
                          <Label htmlFor="isVerified-form" className="ml-2 cursor-pointer">Verified</Label>
                        </div>
                      </>
                    )}
                    <div className="flex items-center">
                      <Checkbox id="allowsOnlineBooking-form" checked={formData.allowsOnlineBooking} onChange={(checked) => handleCheckboxChange(checked, 'allowsOnlineBooking')} />
                      <Label htmlFor="allowsOnlineBooking-form" className="ml-2 cursor-pointer">Online Booking</Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox id="allowsDelivery-form" checked={formData.allowsDelivery} onChange={(checked) => handleCheckboxChange(checked, 'allowsDelivery')} />
                      <Label htmlFor="allowsDelivery-form" className="ml-2 cursor-pointer">Delivery</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Product Photos ── */}
              <div className="col-span-1 sm:col-span-2">
                <Label>Product Photos {formData.bundleId ? `(up to ${bundles.find(b => b.id === formData.bundleId)?.maxImages || 5})` : ''}</Label>
                {!formData.bundleId ? (
                  <p className="text-xs text-gray-400 mt-1">Select a bundle to enable photo uploads</p>
                ) : (
                  <>
                    {/* Existing images (edit mode) */}
                    {existingImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 mb-2">
                        {existingImages.map((img, i) => (
                          <div key={img.id} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img src={resolveBusinessImageSrc(img.imageData) || ''} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => setExistingImages(prev => prev.filter(x => x.id !== img.id))}
                              className="absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                              <FiX className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* New images */}
                    {productImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 mb-2">
                        {productImages.map((img, i) => (
                          <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-primary-200 dark:border-primary-700">
                            <img src={img} alt={`New ${i + 1}`} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => removeProductImage(i)}
                              className="absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                              <FiX className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={() => imagesInputRef.current?.click()}
                      className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors">
                      <FiImage className="h-4 w-4" /> Add Photos
                    </button>
                    <input ref={imagesInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleProductImagesChange} />
                    <p className="text-xs text-gray-400 mt-1">
                      {existingImages.length + productImages.length} / {bundles.find(b => b.id === formData.bundleId)?.maxImages || 5} photos
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* ── Footer Buttons ── */}
            <div className="flex items-center justify-end w-full gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button size="sm" variant="outline" onClick={isAddModalOpen ? closeAddModal : closeEditModal}>
                Cancel
              </Button>
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                {submitting ? (
                  <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {isAddModalOpen ? 'Creating...' : 'Updating...'}</>
                ) : (
                  <>{isAddModalOpen ? 'Create & Approve' : 'Update Business'}</>
                )}
              </button>
            </div>
          </form>
          )}
        </Modal>
      )}
      
      {/* ═══ View Business Modal ═══ */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        className="max-w-[700px] p-6 max-h-[90vh] overflow-y-auto"
      >
        {viewLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : currentBusiness && (
          <div>
            {/* Header with logo */}
            <div className="flex items-start gap-4 mb-6">
              <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentBusiness.logo ? (
                  <img src={resolveBusinessImageSrc(currentBusiness.logo) || ''} alt={currentBusiness.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">{currentBusiness.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{currentBusiness.name}</h4>
                <p className="text-sm text-gray-500">{currentBusiness.category?.name || 'Uncategorized'}</p>
                <div className="flex gap-2 mt-2">
                  {currentBusiness.isApproved ? (
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2 py-0.5 rounded-full">Approved</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full">Pending</span>
                  )}
                  {currentBusiness.isVerified && (
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full">Verified</span>
                  )}
                </div>
              </div>
              {/* Rating */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className={`h-4 w-4 ${star <= currentBusiness.avgRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{currentBusiness.avgRating.toFixed(1)} ({currentBusiness.numReviews} reviews)</p>
              </div>
            </div>

            {/* Product Images */}
            {currentBusiness.images && currentBusiness.images.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Photos</h5>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentBusiness.images.map((img, i) => (
                    <div key={img.id || i} className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                      <img src={resolveBusinessImageSrc(img.imageData) || ''} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-5">
              {/* Description */}
              {currentBusiness.description && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentBusiness.description}</p>
                </div>
              )}
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentBusiness.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bundle</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentBusiness.bundle?.name || 'N/A'}</p>
                </div>
              </div>
              
              {/* Contact Info */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact</h5>
                <div className="space-y-1.5">
                  {currentBusiness.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiPhone className="h-3.5 w-3.5 text-gray-400" /> {currentBusiness.phone}
                    </div>
                  )}
                  {currentBusiness.whatsapp && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <a
                        href={`https://wa.me/${currentBusiness.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        WhatsApp: {currentBusiness.whatsapp}
                      </a>
                    </div>
                  )}
                  {currentBusiness.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiMail className="h-3.5 w-3.5 text-gray-400" /> {currentBusiness.email}
                    </div>
                  )}
                  {currentBusiness.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FiGlobe className="h-3.5 w-3.5 text-gray-400" /> {currentBusiness.website}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Location */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</h5>
                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiMapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                  <span>{[currentBusiness.street, currentBusiness.ward?.name, currentBusiness.district?.name, currentBusiness.region?.name].filter(Boolean).join(', ') || 'N/A'}</span>
                </div>
                {currentBusiness.latitude && currentBusiness.longitude && (
                  <p className="text-xs text-gray-400 mt-1 ml-5.5">GPS: {currentBusiness.latitude}, {currentBusiness.longitude}</p>
                )}
              </div>
              
              {/* Owner */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</h5>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiUser className="h-3.5 w-3.5 text-gray-400" />
                  {currentBusiness.owner?.name} ({currentBusiness.owner?.email})
                </div>
              </div>

              {/* Features */}
              {(currentBusiness.allowsOnlineBooking || currentBusiness.allowsDelivery) && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentBusiness.allowsOnlineBooking && (
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-md">Online Booking</span>
                    )}
                    {currentBusiness.allowsDelivery && (
                      <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-md">Delivery</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end w-full gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button size="sm" variant="outline" onClick={closeViewModal}>
                Close
              </Button>
              <Button size="sm" onClick={() => { closeViewModal(); handleEdit(currentBusiness); }}>
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BusinessList;
