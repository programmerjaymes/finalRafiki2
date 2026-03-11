import React, { useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';
import UserSelector from './UserSelector';
import LocationFields from './LocationFields';
import { BusinessFormData, Category, Region, District, Ward, Bundle, User, BusinessImage } from './types';

interface BusinessFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  formData: BusinessFormData;
  logoPreview: string | null;
  productImages: string[];
  existingImages: BusinessImage[];
  selectedUserId: string;
  users: User[];
  selectedCategoryIds: string[];
  categories: Category[];
  bundles: Bundle[];
  regions: Region[];
  filteredDistricts: District[];
  filteredWards: Ward[];
  filteredStreets: { id: string; name: string }[];
  fetchingLocation: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onCheckboxChange: (checked: boolean, name: string) => void;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveProductImage: (index: number) => void;
  onRemoveLogo: () => void;
  onUserChange: (userId: string) => void;
  onCategoryChange: (categoryIds: string[]) => void;
  onRegionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onWardChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onGetLocation: () => void;
  onRemoveExistingImage: (id: string) => void;
}

const BusinessFormModal: React.FC<BusinessFormModalProps> = ({
  isOpen,
  isEditMode,
  formData,
  logoPreview,
  productImages,
  existingImages,
  selectedUserId,
  users,
  selectedCategoryIds,
  categories,
  bundles,
  regions,
  filteredDistricts,
  filteredWards,
  filteredStreets,
  fetchingLocation,
  submitting,
  onClose,
  onSubmit,
  onFieldChange,
  onCheckboxChange,
  onLogoChange,
  onProductImagesChange,
  onRemoveProductImage,
  onRemoveLogo,
  onUserChange,
  onCategoryChange,
  onRegionChange,
  onDistrictChange,
  onWardChange,
  onGetLocation,
  onRemoveExistingImage,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[900px] p-6 max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={onSubmit}>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
          {isEditMode ? 'Edit Business' : 'Add Business'}
          <span className="block text-xs font-normal text-gray-500 mt-1">
            {isEditMode ? 'Update business details' : 'Create and assign to a user (auto-approved)'}
          </span>
        </h4>

        <UserSelector
          selectedUserId={selectedUserId}
          users={users}
          onUserChange={onUserChange}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
              <div className="text-sm text-gray-500">
                <p>Click to upload logo</p>
                {logoPreview && (
                  <button type="button" onClick={onRemoveLogo} className="text-red-500 text-xs mt-1 hover:underline">
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Business Name *</Label>
            <Input type="text" name="name" placeholder="Enter business name" defaultValue={formData.name} onChange={onFieldChange} />
          </div>
          
          <div className="col-span-1 sm:col-span-2">
            <Label>Description</Label>
            <textarea 
              name="description" 
              placeholder="Describe the business" 
              value={formData.description} 
              onChange={onFieldChange}
              className="h-20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" 
            />
          </div>
          
          <div className="col-span-1">
            <Label>Phone *</Label>
            <Input type="text" name="phone" placeholder="+255 xxx xxx xxx" defaultValue={formData.phone} onChange={onFieldChange} />
          </div>
          
          <div className="col-span-1">
            <Label>Email *</Label>
            <Input type="email" name="email" placeholder="business@email.com" defaultValue={formData.email} onChange={onFieldChange} />
          </div>
          
          <div className="col-span-1">
            <Label>Website</Label>
            <Input type="text" name="website" placeholder="https://..." defaultValue={formData.website} onChange={onFieldChange} />
          </div>

          <div className="col-span-1">
            <Label>Bundle *</Label>
            <select 
              name="bundleId" 
              value={formData.bundleId} 
              onChange={onFieldChange}
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Select bundle</option>
              {bundles.map(b => (
                <option key={b.id} value={b.id}>{b.name} - {b.price.toLocaleString()} TZS</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Categories (select up to 2) *</Label>
            <div className="mt-2 border border-gray-300 dark:border-gray-700 rounded-lg p-3 max-h-60 overflow-y-auto bg-white dark:bg-gray-900">
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedCategoryIds.length < 2) {
                            onCategoryChange([...selectedCategoryIds, cat.id]);
                          }
                        } else {
                          onCategoryChange(selectedCategoryIds.filter(id => id !== cat.id));
                        }
                      }}
                      disabled={!selectedCategoryIds.includes(cat.id) && selectedCategoryIds.length >= 2}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                      {cat.icon} {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select up to 2 categories. {selectedCategoryIds.length}/2 selected.
            </p>
          </div>

          <LocationFields
            formData={formData}
            regions={regions}
            filteredDistricts={filteredDistricts}
            filteredWards={filteredWards}
            filteredStreets={filteredStreets}
            fetchingLocation={fetchingLocation}
            onFieldChange={onFieldChange}
            onRegionChange={onRegionChange}
            onDistrictChange={onDistrictChange}
            onWardChange={onWardChange}
            onGetLocation={onGetLocation}
          />

          {isEditMode && (
            <div className="col-span-1 sm:col-span-2">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center">
                  <Checkbox id="isApproved-form" checked={formData.isApproved} onChange={(checked) => onCheckboxChange(checked, 'isApproved')} />
                  <Label htmlFor="isApproved-form" className="ml-2 cursor-pointer">Approved</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="isVerified-form" checked={formData.isVerified} onChange={(checked) => onCheckboxChange(checked, 'isVerified')} />
                  <Label htmlFor="isVerified-form" className="ml-2 cursor-pointer">Verified</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="allowsOnlineBooking-form" checked={formData.allowsOnlineBooking} onChange={(checked) => onCheckboxChange(checked, 'allowsOnlineBooking')} />
                  <Label htmlFor="allowsOnlineBooking-form" className="ml-2 cursor-pointer">Online Booking</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="allowsDelivery-form" checked={formData.allowsDelivery} onChange={(checked) => onCheckboxChange(checked, 'allowsDelivery')} />
                  <Label htmlFor="allowsDelivery-form" className="ml-2 cursor-pointer">Delivery</Label>
                </div>
              </div>
            </div>
          )}

          <div className="col-span-1 sm:col-span-2">
            <Label>Product Photos {formData.bundleId ? `(up to ${bundles.find(b => b.id === formData.bundleId)?.maxImages || 5})` : ''}</Label>
            {!formData.bundleId ? (
              <p className="text-xs text-gray-400 mt-1">Select a bundle to enable photo uploads</p>
            ) : (
              <>
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {existingImages.map((img, i) => (
                      <div key={img.id} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={img.imageData.startsWith('data:') ? img.imageData : `data:image/jpeg;base64,${img.imageData}`} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => onRemoveExistingImage(img.id)}
                          className="absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                          <FiX className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {productImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {productImages.map((img, i) => (
                      <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-primary-200 dark:border-primary-700">
                        <img src={img} alt={`New ${i + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => onRemoveProductImage(i)}
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
                <input ref={imagesInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onProductImagesChange} />
                <p className="text-xs text-gray-400 mt-1">
                  {existingImages.length + productImages.length} / {bundles.find(b => b.id === formData.bundleId)?.maxImages || 5} photos
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-lg">
            {submitting ? (
              <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {isEditMode ? 'Updating...' : 'Creating...'}</>
            ) : (
              <>{isEditMode ? 'Update Business' : 'Create & Approve'}</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BusinessFormModal;
