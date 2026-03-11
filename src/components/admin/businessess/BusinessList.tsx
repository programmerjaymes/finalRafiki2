'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiMapPin } from 'react-icons/fi';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Button from '@/components/ui/button/Button';
import toast from '@/utils/toast';
import BusinessCard from './BusinessCard';
import BusinessSearchFilter from './BusinessSearchFilter';
import Pagination from './Pagination';
import BusinessFormModal from './BusinessFormModal';
import BusinessViewModal from './BusinessViewModal';
import { fetchUsers } from '@/actions/userActions';
import { 
  Business, 
  BusinessFormData, 
  BusinessImage, 
  Category, 
  Region, 
  District, 
  Ward, 
  Bundle, 
  User, 
  PaginationMeta 
} from './types';
import { fileToBase64 } from './utils';
import { validateBusinessForm, hasValidationErrors, getErrorMessage } from './validation';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [users, setUsers] = useState<User[] | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });
  
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [filteredWards, setFilteredWards] = useState<Ward[]>([]);
  const [filteredStreets, setFilteredStreets] = useState<{id:string;name:string}[]>([]);
  
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isViewModalOpen, openModal: openViewModal, closeModal: closeViewModal } = useModal();
  
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showGpsConfirm, setShowGpsConfirm] = useState(false);
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    description: '',
    phone: '',
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

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<BusinessImage[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: paginationMeta?.page?.toString() || '1',
        limit: paginationMeta?.limit?.toString() || '9'
      });
      
      if (search) queryParams.append('search', search);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      
      const response = await fetch(`/api/businesses?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch businesses');
      
      const data = await response.json();
      setBusinesses(data.businesses || []);
      setPaginationMeta(data.meta || data.pagination || {
        page: 1,
        limit: 9,
        total: 0,
        totalPages: data.pagination?.pages || 0
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Failed to load businesses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessDetails = async (id: string): Promise<Business | null> => {
    try {
      const response = await fetch(`/api/businesses/${id}`);
      if (!response.ok) throw new Error('Failed to fetch business details');
      return await response.json();
    } catch (err) {
      console.error('Error fetching business details:', err);
      return null;
    }
  };
  
  const fetchReferenceData = async () => {
    try {
      console.log('🔄 Fetching reference data...');
      
      const [categoryRes, regionRes, districtRes, wardRes, bundleRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/regions'),
        fetch('/api/districts'),
        fetch('/api/wards'),
        fetch('/api/bundles'),
      ]);

      if (categoryRes.ok) setCategories(await categoryRes.json());
      if (regionRes.ok) setRegions(await regionRes.json());
      if (districtRes.ok) setDistricts(await districtRes.json());
      if (wardRes.ok) setWards(await wardRes.json());
      if (bundleRes.ok) setBundles(await bundleRes.json());
      
      // Fetch users using server action
      console.log('👥 Fetching users via server action...');
      const businessOwners = await fetchUsers();
      setUsers(businessOwners);
      console.log(`✅ Loaded ${businessOwners.length} business owners`);
    } catch (err) {
      console.error('❌ Error fetching reference data:', err);
      setError('Failed to load reference data. Please try again later.');
      setUsers([]);
    }
  };
  
  useEffect(() => {
    fetchBusinesses();
    fetchReferenceData();
  }, []);
  
  useEffect(() => {
    if (paginationMeta) fetchBusinesses();
  }, [search, paginationMeta?.page, paginationMeta?.limit, selectedCategory]);
  
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.regionId) {
        try {
          const response = await fetch(`/api/districts?regionId=${formData.regionId}`);
          if (response.ok) setFilteredDistricts(await response.json());
        } catch (err) {
          console.error('Error fetching districts:', err);
        }
      } else {
        setFilteredDistricts([]);
      }
    };
    loadDistricts();
  }, [formData.regionId]);
  
  useEffect(() => {
    const loadWards = async () => {
      if (formData.districtId) {
        try {
          const response = await fetch(`/api/wards?districtId=${formData.districtId}`);
          if (response.ok) setFilteredWards(await response.json());
        } catch (err) {
          console.error('Error fetching wards:', err);
        }
      } else {
        setFilteredWards([]);
      }
    };
    loadWards();
  }, [formData.districtId]);

  useEffect(() => {
    const loadStreets = async () => {
      if (formData.wardId) {
        try {
          const response = await fetch(`/api/wards/${formData.wardId}/streets`);
          if (response.ok) setFilteredStreets(await response.json());
        } catch (err) {
          console.error('Error fetching streets:', err);
        }
      } else {
        setFilteredStreets([]);
      }
    };
    loadStreets();
  }, [formData.wardId]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginationMeta(prev => ({ ...prev, page: 1 }));
    fetchBusinesses();
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPaginationMeta(prev => ({ ...prev, page: 1 }));
  };
  
  const handlePageChange = (newPage: number) => {
    if (!paginationMeta || newPage < 1 || newPage > (paginationMeta.totalPages || 1)) return;
    setPaginationMeta(prev => ({ ...prev, page: newPage }));
  };
  
  const resetFormData = () => {
    setFormData({
      name: '', description: '', phone: '', email: '', website: '', logo: '', coverImage: '',
      facebook: '', instagram: '', twitter: '', allowsOnlineBooking: false, allowsDelivery: false,
      bundleId: '', categoryId: '', categoryId2: '', latitude: '', longitude: '',
      regionId: '', districtId: '', wardId: '', street: '', ownerId: '',
      isVerified: false, isApproved: false
    });
    setLogoPreview(null);
    setProductImages([]);
    setExistingImages([]);
    setSelectedUserId('');
    setSelectedCategoryIds([]);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: inputValue }));
  };
  
  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

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
  };

  const removeProductImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCategoryIdsChange = (categoryIds: string[]) => {
    setSelectedCategoryIds(categoryIds);
    setFormData(fd => ({
      ...fd,
      categoryId: categoryIds[0] || '',
      categoryId2: categoryIds[1] || ''
    }));
  };
  
  const handleOpenAddModal = () => {
    resetFormData();
    openAddModal();
  };
  
  const handleEdit = async (business: Business) => {
    setViewLoading(true);
    const full = await fetchBusinessDetails(business.id);
    setViewLoading(false);
    if (!full) { toast.error('Failed to load business details'); return; }
    
    setCurrentBusiness(full);
    setFormData({
      name: full.name,
      description: full.description || '',
      phone: full.phone || '',
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
    setSelectedUserId(full.ownerId);
    
    openEditModal();
  };
  
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
  
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateBusinessForm(formData, selectedUserId, selectedCategoryIds);
    
    if (hasValidationErrors(validationErrors)) {
      const errorMsg = getErrorMessage(validationErrors);
      toast.error(errorMsg);
      console.error('Validation errors:', validationErrors);
      return;
    }
    
    setPendingFormData(e);
    setShowApprovalConfirm(true);
  };

  const confirmApproval = async () => {
    setShowApprovalConfirm(false);
    if (!pendingFormData || !selectedUserId) {
      toast.error('Please select a user to assign the business to');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        ownerId: selectedUserId,
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
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    
    // Validate form data
    const validationErrors = validateBusinessForm(formData, selectedUserId, selectedCategoryIds);
    
    if (hasValidationErrors(validationErrors)) {
      const errorMsg = getErrorMessage(validationErrors);
      toast.error(errorMsg);
      console.error('Validation errors:', validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        categoryId: selectedCategoryIds[0],
        categoryId2: selectedCategoryIds[1] || null,
      };

      if (productImages.length > 0) {
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

  const availableUsers = Array.isArray(users) ? users : [];

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setFetchingLocation(false);
        toast.success('Location fetched successfully');
      },
      (error) => {
        setFetchingLocation(false);
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        toast.error(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-medium">Business Management</h4>
        <Button variant="primary" size="sm" className="flex items-center gap-1" onClick={handleOpenAddModal}>
          <FiPlus className="h-4 w-4" />
          Add Business
        </Button>
      </div>
      
      <BusinessSearchFilter
        search={search}
        selectedCategory={selectedCategory}
        categories={categories}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearch}
        onCategoryChange={handleCategoryChange}
      />
      
      {error && (
        <div className="bg-error-500/10 text-error-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          
          {businesses.length === 0 && (
            <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No businesses found</p>
              <Button variant="primary" size="sm" onClick={handleOpenAddModal}>Add Your First Business</Button>
            </div>
          )}
          
          <Pagination
            paginationMeta={paginationMeta}
            onPageChange={handlePageChange}
          />
        </>
      )}
      
      <BusinessFormModal
        isOpen={isAddModalOpen || isEditModalOpen}
        isEditMode={isEditModalOpen}
        formData={formData}
        logoPreview={logoPreview}
        productImages={productImages}
        existingImages={existingImages}
        selectedUserId={selectedUserId}
        users={availableUsers}
        selectedCategoryIds={selectedCategoryIds}
        categories={categories}
        bundles={bundles}
        regions={regions}
        filteredDistricts={filteredDistricts}
        filteredWards={filteredWards}
        filteredStreets={filteredStreets}
        fetchingLocation={fetchingLocation}
        submitting={submitting}
        onClose={isAddModalOpen ? closeAddModal : closeEditModal}
        onSubmit={isAddModalOpen ? handleAdd : handleUpdate}
        onFieldChange={handleChange}
        onCheckboxChange={handleCheckboxChange}
        onLogoChange={handleLogoChange}
        onProductImagesChange={handleProductImagesChange}
        onRemoveProductImage={removeProductImage}
        onRemoveLogo={() => { setLogoPreview(null); setFormData(fd => ({ ...fd, logo: '' })); }}
        onUserChange={setSelectedUserId}
        onCategoryChange={handleCategoryIdsChange}
        onRegionChange={(e) => { handleChange(e); setFormData(fd => ({ ...fd, districtId: '', wardId: '', street: '' })); }}
        onDistrictChange={(e) => { handleChange(e); setFormData(fd => ({ ...fd, wardId: '', street: '' })); }}
        onWardChange={(e) => { handleChange(e); setFormData(fd => ({ ...fd, street: '' })); }}
        onGetLocation={() => setShowGpsConfirm(true)}
        onRemoveExistingImage={(id) => setExistingImages(prev => prev.filter(x => x.id !== id))}
      />

      <BusinessViewModal
        isOpen={isViewModalOpen}
        business={currentBusiness}
        loading={viewLoading}
        onClose={closeViewModal}
        onEdit={handleEdit}
      />
      
      {showApprovalConfirm && (
        <Modal isOpen={showApprovalConfirm} onClose={() => setShowApprovalConfirm(false)} className="max-w-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Approve Business?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This business will be automatically approved and visible to customers immediately after creation.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="sm" variant="outline" onClick={() => { setShowApprovalConfirm(false); setPendingFormData(null); }}>
                Cancel
              </Button>
              <button
                onClick={confirmApproval}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Yes, Create & Approve
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showGpsConfirm && (
        <Modal isOpen={showGpsConfirm} onClose={() => setShowGpsConfirm(false)} className="max-w-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <FiMapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fetch GPS Coordinates?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Make sure you are <strong className="text-gray-700 dark:text-gray-200">physically at the business location</strong> before proceeding. Your current device location will be used as the business coordinates.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="sm" variant="outline" onClick={() => setShowGpsConfirm(false)}>
                Cancel
              </Button>
              <button
                onClick={() => { setShowGpsConfirm(false); handleGetLocation(); }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Yes, I'm at the location
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BusinessList;
