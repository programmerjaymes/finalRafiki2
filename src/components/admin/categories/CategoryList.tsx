'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit, FiPlus, FiSearch } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import DataTable, { Column } from '@/components/tables/DataTable';
import toast from '@/utils/toast'; // Import our custom toast utility
import Swal from 'sweetalert2';

// Remove the old toast fallback
// Use alert for notifications as a fallback
// const toast = {
//   success: (message: string) => alert(message),
//   error: (message: string) => alert(message)
// };

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const CategoryList = () => {
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Modal states
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteModalOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  
  // Current category for edit/delete
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: ''
  });
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Show loading indicator for long operations
      const loadingToast = toast.loading('Loading Categories', 'Fetching category data...');
      
      const response = await fetch('/api/categories');
      
      // Close loading indicator
      toast.close();
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
      toast.crud('fetch', 'categories', false);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
  );
  
  // Reset form data for new category
  const resetFormData = () => {
    setFormData({
      name: '',
      icon: '',
      description: ''
    });
  };
  
  // Handle input change for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open add modal
  const handleOpenAddModal = () => {
    resetFormData();
    openAddModal();
  };
  
  // Open edit modal
  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || '',
      description: category.description || ''
    });
    openEditModal();
  };
  
  // Open delete modal
  const handleDelete = (category: Category) => {
    setCurrentCategory(category);
    openDeleteModal();
  };
  
  // Add new category
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      await fetchCategories();
      closeAddModal();
      resetFormData();
      toast.crud('create', 'category');
    } catch (err) {
      console.error('Error creating category:', err);
      toast.crud('create', 'category', false);
    }
  };
  
  // Update existing category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCategory) return;
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const response = await fetch(`/api/categories/${currentCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      await fetchCategories();
      closeEditModal();
      toast.crud('update', 'category');
    } catch (err) {
      console.error('Error updating category:', err);
      toast.crud('update', 'category', false);
    }
  };
  
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!currentCategory) return;
    
    try {
      // Use HTML format for richer confirmation dialog with category details
      const htmlContent = `
        <div class="text-center">
          <p class="mb-4">You are about to delete:</p>
          <div class="flex items-center justify-center mb-4">
            <div class="flex items-center justify-center h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full text-center">
              ${currentCategory.icon ? 
                `<span class="text-xl">${currentCategory.icon}</span>` : 
                `<span class="text-gray-400 dark:text-gray-500 text-xl font-bold">${currentCategory.name.charAt(0)}</span>`
              }
            </div>
          </div>
          <p class="text-lg font-semibold mb-1">${currentCategory.name}</p>
          ${currentCategory.description ? 
            `<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">${currentCategory.description}</p>` : 
            ''
          }
          <p class="mt-4 text-error-500 font-medium">This action cannot be undone.</p>
        </div>
      `;
      
      const result = await Swal.fire({
        title: 'Delete Category',
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
        const response = await fetch(`/api/categories/${currentCategory.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete category');
        }
        
        await fetchCategories();
        closeDeleteModal();
        toast.crud('delete', 'category');
      } else {
        // User cancelled delete
        closeDeleteModal();
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.crud('delete', 'category', false);
    }
  };

  // Define columns for the data table
  const columns: Column<Category>[] = [
    {
      key: 'serialNumber',
      header: 'S/N',
      cell: (_, index) => (
        <span className="font-medium">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
      sortable: false
    },
    {
      key: 'icon',
      header: 'Icon',
      cell: (category) => (
        <div className="flex items-center justify-center h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
          {category.icon ? (
            <span className="text-xl">{category.icon}</span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-xl font-bold">
              {category.name.charAt(0)}
            </span>
          )}
        </div>
      ),
      sortable: false
    },
    {
      key: 'name',
      header: 'Name',
      cell: (category) => (
        <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
      ),
      sortable: true
    },
    {
      key: 'description',
      header: 'Description',
      cell: (category) => (
        category.description ? (
          <span>{category.description}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-600 italic">No description</span>
        )
      ),
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (category) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(category);
            }}
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-error-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(category);
            }}
          >
            <RiDeleteBin6Line className="h-4 w-4" />
          </button>
        </div>
      ),
      sortable: false
    }
  ];

  return (
    <div className="w-full">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-xl font-medium">Category Management</h4>
        <Button variant="primary" size="sm" className="flex items-center gap-1" onClick={handleOpenAddModal}>
          <FiPlus className="h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {/* Search Section */}
      <div className="bg-white dark:bg-boxdark p-4 rounded-lg border border-stroke dark:border-strokedark mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search categories..."
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              value={search}
              onChange={handleSearchChange}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 dark:text-gray-400">
              <FiSearch className="h-5 w-5" />
            </span>
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
        <DataTable
          data={filteredCategories}
          columns={columns}
          keyExtractor={(category) => category.id}
          pageSize={pageSize}
          onRowClick={handleEdit}
          showPagination={true}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
      
      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        className="max-w-[500px] p-6"
      >
        <form onSubmit={handleAdd}>
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Add New Category
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label>Category Name*</Label>
              <Input 
                type="text" 
                name="name" 
                placeholder="e.g. Restaurants, Hotels, etc." 
                defaultValue={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label>Icon (Emoji or Icon Code)</Label>
              <Input 
                type="text" 
                name="icon" 
                placeholder="e.g. 🍔 or fa-utensils" 
                defaultValue={formData.icon}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <textarea 
                name="description" 
                placeholder="Brief description of this category" 
                value={formData.description}
                onChange={handleChange}
                className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => document.forms[0].requestSubmit()}>
              Add Category
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        className="max-w-[500px] p-6"
      >
        <form onSubmit={handleUpdate}>
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            Edit Category
          </h4>
          
          <div className="space-y-4">
            <div>
              <Label>Category Name*</Label>
              <Input 
                type="text" 
                name="name" 
                placeholder="e.g. Restaurants, Hotels, etc." 
                defaultValue={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label>Icon (Emoji or Icon Code)</Label>
              <Input 
                type="text" 
                name="icon" 
                placeholder="e.g. 🍔 or fa-utensils" 
                defaultValue={formData.icon}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <textarea 
                name="description" 
                placeholder="Brief description of this category" 
                value={formData.description}
                onChange={handleChange}
                className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end w-full gap-3 mt-8">
            <Button size="sm" variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => document.forms[1].requestSubmit()}>
              Update Category
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
          Are you sure you want to delete the <span className="font-semibold">{currentCategory?.name}</span> category? This action cannot be undone.
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

export default CategoryList; 