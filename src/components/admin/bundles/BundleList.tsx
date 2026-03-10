'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit, FiPlus } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';
import toast from '@/utils/toast'; // Import our custom toast utility
import Swal from 'sweetalert2';

interface Bundle {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  allowedFields: string;
  maxImages: number;
  allowsVideo: boolean;
  allowsAnalytics: boolean;
  advancedAnalytics: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const BundleList = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  
  // Form states
  const [currentBundle, setCurrentBundle] = useState<Bundle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    allowedFields: '',
    maxImages: '1',
    allowsVideo: false,
    allowsAnalytics: false,
    advancedAnalytics: false,
    featured: false
  });
  
  // Fetch bundles
  const fetchBundles = async () => {
    try {
      setLoading(true);
      // Show loading indicator for long operations
      const loadingToast = toast.loading('Loading Bundles', 'Fetching bundle data...');
      
      const response = await fetch('/api/bundles');
      
      // Close loading indicator
      toast.close();
      
      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }
      
      const data = await response.json();
      setBundles(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bundles:', err);
      setError('Failed to load bundles. Please try again later.');
      toast.crud('fetch', 'bundles', false);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchBundles();
  }, []);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle checkbox change specifically
  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Open edit modal
  const handleEdit = (bundle: Bundle) => {
    setCurrentBundle(bundle);
    setFormData({
      name: bundle.name,
      price: bundle.price.toString(),
      duration: bundle.duration.toString(),
      description: bundle.description || '',
      allowedFields: bundle.allowedFields,
      maxImages: bundle.maxImages.toString(),
      allowsVideo: bundle.allowsVideo,
      allowsAnalytics: bundle.allowsAnalytics,
      advancedAnalytics: bundle.advancedAnalytics,
      featured: bundle.featured
    });
    openEditModal();
  };
  
  // Open delete modal
  const handleDelete = (bundle: Bundle) => {
    setCurrentBundle(bundle);
    openDeleteModal();
  };
  
  // Add new bundle
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const loadingToast = toast.loading('Creating Bundle', 'Please wait...');
      
      const response = await fetch('/api/bundles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      toast.close();
      
      if (!response.ok) {
        throw new Error('Failed to create bundle');
      }
      
      await fetchBundles();
      closeAddModal();
      toast.crud('create', 'bundle');
      // Reset form
      setFormData({
        name: '',
        price: '',
        duration: '',
        description: '',
        allowedFields: '',
        maxImages: '1',
        allowsVideo: false,
        allowsAnalytics: false,
        advancedAnalytics: false,
        featured: false
      });
    } catch (err) {
      console.error('Error creating bundle:', err);
      toast.crud('create', 'bundle', false);
    }
  };
  
  // Update bundle
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBundle) return;
    
    try {
      const loadingToast = toast.loading('Updating Bundle', 'Please wait...');
      
      const response = await fetch(`/api/bundles/${currentBundle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      toast.close();
      
      if (!response.ok) {
        throw new Error('Failed to update bundle');
      }
      
      await fetchBundles();
      closeEditModal();
      toast.crud('update', 'bundle');
    } catch (err) {
      console.error('Error updating bundle:', err);
      toast.crud('update', 'bundle', false);
    }
  };
  
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!currentBundle) return;
    
    try {
      // Use HTML format for richer confirmation dialog with bundle details
      const htmlContent = `
        <div class="text-center">
          <p class="mb-4">You are about to delete:</p>
          <p class="text-lg font-semibold mb-1">${currentBundle.name}</p>
          <p class="text-primary-500 font-bold mb-2">$${currentBundle.price.toFixed(2)} / ${currentBundle.duration} days</p>
          ${currentBundle.description ? 
            `<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">${currentBundle.description}</p>` : 
            ''
          }
          <div class="flex flex-wrap justify-center gap-2 my-3">
            ${currentBundle.allowsVideo ? 
              '<span class="inline-block px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs">Video</span>' : 
              ''
            }
            ${currentBundle.allowsAnalytics ? 
              '<span class="inline-block px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs">Analytics</span>' : 
              ''
            }
            ${currentBundle.advancedAnalytics ? 
              '<span class="inline-block px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs">Advanced Analytics</span>' : 
              ''
            }
          </div>
          <p class="mt-4 text-error-500 font-medium">This action cannot be undone.</p>
        </div>
      `;
      
      const result = await Swal.fire({
        title: 'Delete Bundle',
        html: htmlContent,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444', // Red
        cancelButtonColor: '#6b7280', // Gray
        background: '#fff',
        customClass: {
          popup: 'dark:bg-boxdark dark:text-white',
          confirmButton: 'dark:hover:bg-red-700',
          cancelButton: 'dark:hover:bg-gray-600',
        }
      });
      
      if (result.isConfirmed) {
        const loadingToast = toast.loading('Deleting Bundle', 'Please wait...');
        
        const response = await fetch(`/api/bundles/${currentBundle.id}`, {
          method: 'DELETE'
        });
        
        toast.close();
        
        if (!response.ok) {
          throw new Error('Failed to delete bundle');
        }
        
        await fetchBundles();
        closeDeleteModal();
        toast.crud('delete', 'bundle');
      } else {
        // User cancelled delete
        closeDeleteModal();
      }
    } catch (err) {
      console.error('Error deleting bundle:', err);
      toast.crud('delete', 'bundle', false);
    }
  };
  
  // Open add modal with reset form
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      price: '',
      duration: '',
      description: '',
      allowedFields: '',
      maxImages: '1',
      allowsVideo: false,
      allowsAnalytics: false,
      advancedAnalytics: false,
      featured: false
    });
    openAddModal();
  };

  return (
    <div className="w-full">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-medium">Bundle Management</h4>
        <Button variant="primary" size="sm" className="flex items-center gap-1" onClick={handleOpenAddModal}>
          <FiPlus className="h-4 w-4" />
          Add Bundle
        </Button>
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
        /* Bundle Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div 
              key={bundle.id}
              className="relative bg-white dark:bg-boxdark p-6 rounded-lg border border-stroke dark:border-strokedark shadow-default hover:shadow-lg transition-shadow"
            >
              {/* Featured Badge */}
              {bundle.featured && (
                <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Featured
                </div>
              )}
              
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">{bundle.name}</h3>
              <div className="text-2xl font-bold text-primary-500 mb-4">
                ${bundle.price.toFixed(2)}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ {bundle.duration} days</span>
              </div>
              
              {bundle.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{bundle.description}</p>
              )}
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full ${bundle.allowsVideo ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span className="text-sm">{bundle.allowsVideo ? 'Video Allowed' : 'No Video'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full ${bundle.allowsAnalytics ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span className="text-sm">{bundle.allowsAnalytics ? 'Analytics' : 'No Analytics'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full ${bundle.advancedAnalytics ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span className="text-sm">{bundle.advancedAnalytics ? 'Advanced Analytics' : 'Basic Analytics'}</span>
                    </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Max Images:</span>
                  <span className="text-sm">{bundle.maxImages}</span>
                    </div>
                  </div>
              
              <div className="flex justify-end gap-3 mt-auto">
                <button 
                  className="p-2 rounded-md text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleEdit(bundle)}
                >
                      <FiEdit className="h-5 w-5" />
                    </button>
                <button 
                  className="p-2 rounded-md text-gray-500 hover:text-danger hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleDelete(bundle)}
                >
                      <RiDeleteBin6Line className="h-5 w-5" />
                    </button>
                  </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!loading && bundles.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No bundles available</p>
          <Button variant="primary" size="sm" onClick={handleOpenAddModal}>Add Your First Bundle</Button>
        </div>
      )}
      
      {/* Add Bundle Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        className="max-w-[600px] p-6"
      >
        <form onSubmit={handleAdd}>
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Add New Bundle
          </h4>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
              <Label>Bundle Name</Label>
              <Input 
                type="text" 
                name="name" 
                placeholder="e.g. Premium Bundle" 
                defaultValue={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1">
              <Label>Price</Label>
              <Input 
                type="number" 
                name="price" 
                placeholder="0.00" 
                defaultValue={formData.price}
                onChange={handleChange}
                min="0"
                step={0.01}
              />
            </div>
            
            <div className="col-span-1">
              <Label>Duration (days)</Label>
              <Input 
                type="number" 
                name="duration" 
                placeholder="30" 
                defaultValue={formData.duration}
                onChange={handleChange}
                min="1"
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <Label>Description</Label>
              <Input 
                type="text" 
                name="description" 
                placeholder="Bundle description" 
                defaultValue={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <Label>Allowed Fields (comma separated)</Label>
              <Input 
                type="text" 
                name="allowedFields" 
                placeholder="name,email,phone,website" 
                defaultValue={formData.allowedFields}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1">
              <Label>Max Images</Label>
              <Input 
                type="number" 
                name="maxImages" 
                placeholder="1" 
                defaultValue={formData.maxImages}
                onChange={handleChange}
                min="1"
              />
            </div>
            
            <div className="col-span-1 flex items-center pt-6">
              <Checkbox 
                id="featured" 
                checked={formData.featured}
                onChange={(checked) => handleCheckboxChange(checked, 'featured')}
              />
              <Label htmlFor="featured" className="ml-2 cursor-pointer">Featured Bundle</Label>
            </div>
            
            <div className="col-span-1">
              <div className="flex items-center mb-3">
                <Checkbox 
                  id="allowsVideo" 
                  checked={formData.allowsVideo}
                  onChange={(checked) => handleCheckboxChange(checked, 'allowsVideo')}
                />
                <Label htmlFor="allowsVideo" className="ml-2 cursor-pointer">Allow Videos</Label>
              </div>
              
              <div className="flex items-center mb-3">
                <Checkbox 
                  id="allowsAnalytics" 
                  checked={formData.allowsAnalytics}
                  onChange={(checked) => handleCheckboxChange(checked, 'allowsAnalytics')}
                />
                <Label htmlFor="allowsAnalytics" className="ml-2 cursor-pointer">Basic Analytics</Label>
              </div>
              
              <div className="flex items-center">
                <Checkbox 
                  id="advancedAnalytics" 
                  checked={formData.advancedAnalytics}
                  onChange={(checked) => handleCheckboxChange(checked, 'advancedAnalytics')}
                />
                <Label htmlFor="advancedAnalytics" className="ml-2 cursor-pointer">Advanced Analytics</Label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => document.forms[0].requestSubmit()}>
              Add Bundle
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Bundle Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        className="max-w-[600px] p-6"
      >
        <form onSubmit={handleUpdate}>
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Edit Bundle
          </h4>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
              <Label>Bundle Name</Label>
              <Input 
                type="text" 
                name="name" 
                placeholder="e.g. Premium Bundle" 
                defaultValue={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1">
              <Label>Price</Label>
              <Input 
                type="number" 
                name="price" 
                placeholder="0.00" 
                defaultValue={formData.price}
                onChange={handleChange}
                min="0"
                step={0.01}
              />
            </div>
            
            <div className="col-span-1">
              <Label>Duration (days)</Label>
              <Input 
                type="number" 
                name="duration" 
                placeholder="30" 
                defaultValue={formData.duration}
                onChange={handleChange}
                min="1"
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <Label>Description</Label>
              <Input 
                type="text" 
                name="description" 
                placeholder="Bundle description" 
                defaultValue={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <Label>Allowed Fields (comma separated)</Label>
              <Input 
                type="text" 
                name="allowedFields" 
                placeholder="name,email,phone,website" 
                defaultValue={formData.allowedFields}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1">
              <Label>Max Images</Label>
              <Input 
                type="number" 
                name="maxImages" 
                placeholder="1" 
                defaultValue={formData.maxImages}
                onChange={handleChange}
                min="1"
              />
            </div>
            
            <div className="col-span-1 flex items-center pt-6">
              <Checkbox 
                id="featured-edit" 
                checked={formData.featured}
                onChange={(checked) => handleCheckboxChange(checked, 'featured')}
              />
              <Label htmlFor="featured-edit" className="ml-2 cursor-pointer">Featured Bundle</Label>
            </div>
            
            <div className="col-span-1">
              <div className="flex items-center mb-3">
                <Checkbox 
                  id="allowsVideo-edit" 
                  checked={formData.allowsVideo}
                  onChange={(checked) => handleCheckboxChange(checked, 'allowsVideo')}
                />
                <Label htmlFor="allowsVideo-edit" className="ml-2 cursor-pointer">Allow Videos</Label>
              </div>
              
              <div className="flex items-center mb-3">
                <Checkbox 
                  id="allowsAnalytics-edit" 
                  checked={formData.allowsAnalytics}
                  onChange={(checked) => handleCheckboxChange(checked, 'allowsAnalytics')}
                />
                <Label htmlFor="allowsAnalytics-edit" className="ml-2 cursor-pointer">Basic Analytics</Label>
              </div>
              
              <div className="flex items-center">
                <Checkbox 
                  id="advancedAnalytics-edit" 
                  checked={formData.advancedAnalytics}
                  onChange={(checked) => handleCheckboxChange(checked, 'advancedAnalytics')}
                />
                <Label htmlFor="advancedAnalytics-edit" className="ml-2 cursor-pointer">Advanced Analytics</Label>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => document.forms[1].requestSubmit()}>
              Update Bundle
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        className="max-w-[400px] p-6"
      >
        <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          Confirm Delete
        </h4>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete the <span className="font-semibold">{currentBundle?.name}</span> bundle? This action cannot be undone.
        </p>
        
        <div className="flex items-center justify-end w-full gap-3">
          <Button size="sm" variant="outline" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button size="sm" variant="outline" className="bg-error-500 text-white hover:bg-error-600 ring-error-500" onClick={handleConfirmDelete}>
            Delete
          </Button>
      </div>
      </Modal>
    </div>
  );
};

export default BundleList;
