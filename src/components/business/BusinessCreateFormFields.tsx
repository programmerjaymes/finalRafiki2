'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { Bundle, Category, Region, District, Ward } from '@prisma/client';
import { FiUpload, FiX, FiImage, FiSearch, FiMapPin, FiChevronDown } from 'react-icons/fi';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TanzaniaPhoneInput from '@/components/form/input/TanzaniaPhoneInput';
import Checkbox from '@/components/form/input/Checkbox';
import Button from '@/components/ui/button/Button';
import SearchableDropdown from '@/components/ui/SearchableDropdown';
import { bundleAllows } from '@/lib/bundleFields';
import { fileToBase64 } from '@/lib/fileToBase64';
import toast from '@/utils/toast';

export type BusinessCreateFormData = {
  name: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  logo: string;
  coverImage: string;
  facebook: string;
  instagram: string;
  twitter: string;
  allowsOnlineBooking: boolean;
  allowsDelivery: boolean;
  categoryId: string;
  categoryId2: string;
  latitude: string;
  longitude: string;
  regionId: string;
  districtId: string;
  wardId: string;
  street: string;
};

type BusinessCreateFormFieldsProps = {
  step: 3 | 4;
  bundle: Bundle | null;
  formData: BusinessCreateFormData;
  setFormData: React.Dispatch<React.SetStateAction<BusinessCreateFormData>>;
  categories: Category[];
  regions: Region[];
  districts: District[];
  wards: Ward[];
  selectedCategoryIds: string[];
  onToggleCategory: (id: string) => void;
  categorySearch: string;
  setCategorySearch: (v: string) => void;
  regionSearch: string;
  setRegionSearch: (v: string) => void;
  districtSearch: string;
  setDistrictSearch: (v: string) => void;
  wardSearch: string;
  setWardSearch: (v: string) => void;
  logoPreview: string | null;
  setLogoPreview: (v: string | null) => void;
  coverPreview: string | null;
  setCoverPreview: (v: string | null) => void;
  productImages: string[];
  setProductImages: React.Dispatch<React.SetStateAction<string[]>>;
  detectingLocation: boolean;
  onDetectLocation: () => void;
};

export default function BusinessCreateFormFields(props: BusinessCreateFormFieldsProps) {
  const {
    step,
    bundle,
    formData,
    setFormData,
    categories,
    regions,
    districts,
    wards,
    selectedCategoryIds,
    onToggleCategory,
    categorySearch,
    setCategorySearch,
    regionSearch,
    setRegionSearch,
    districtSearch,
    setDistrictSearch,
    wardSearch,
    setWardSearch,
    logoPreview,
    setLogoPreview,
    coverPreview,
    setCoverPreview,
    productImages,
    setProductImages,
    detectingLocation,
    onDetectLocation,
  } = props;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [dragOverImages, setDragOverImages] = useState(false);

  useEffect(() => {
    if (!categoryOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (checked: boolean, name: keyof BusinessCreateFormData) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setLogoPreview(base64);
      setFormData((prev) => ({ ...prev, logo: base64 }));
    } catch {
      toast.error('Failed to read logo file');
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setCoverPreview(base64);
      setFormData((prev) => ({ ...prev, coverImage: base64 }));
    } catch {
      toast.error('Failed to read cover image');
    }
  };

  const handleProductImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    await addProductImageFiles(files);
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  const addProductImageFiles = async (files: FileList | File[]) => {
    if (!bundle) return;
    const maxImages = bundle.maxImages || 1;
    const remaining = maxImages - productImages.length;
    if (remaining <= 0) {
      toast.error(`You can only upload up to ${maxImages} photo${maxImages === 1 ? '' : 's'}`);
      return;
    }

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast.error('Please select image files only');
      return;
    }

    const toProcess = fileArray.slice(0, remaining);
    if (fileArray.length > remaining) {
      toast.info(`Only ${remaining} more photo${remaining === 1 ? '' : 's'} added (bundle limit: ${maxImages})`);
    }

    try {
      const newImages = await Promise.all(toProcess.map((f) => fileToBase64(f)));
      setProductImages((prev) => [...prev, ...newImages]);
    } catch {
      toast.error('Failed to read product photos');
    }
  };

  const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverImages(false);
    if (!bundle || productImages.length >= (bundle.maxImages || 1)) return;
    if (e.dataTransfer.files?.length) {
      await addProductImageFiles(e.dataTransfer.files);
    }
  };

  const regionOptions = regions.map((r) => ({
    value: String(r.id),
    label: r.name ?? String(r.id),
  }));

  const districtOptions = districts
    .filter((d) => !formData.regionId || String(d.regionId) === formData.regionId)
    .map((d) => ({
      value: String(d.id),
      label: d.name ?? String(d.id),
    }));

  const wardOptions = wards
    .filter((w) => !formData.districtId || String(w.districtId) === formData.districtId)
    .map((w) => ({
      value: String(w.id),
      label: w.name ?? String(w.id),
    }));

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.nameEn?.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.nameSw?.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const maxPhotos = bundle?.maxImages ?? 1;
  const showGps = bundleAllows(bundle, 'latitude') || bundleAllows(bundle, 'longitude');

  if (step === 3) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 w-full">
        {bundleAllows(bundle, 'logo') && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4 mt-1">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="h-20 w-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 hover:border-primary-400"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <FiUpload className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <div className="text-sm text-gray-500">
                <p>Click to upload your business logo</p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setFormData((prev) => ({ ...prev, logo: '' }));
                    }}
                    className="text-red-500 text-xs mt-1 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <Label htmlFor="name">Business Name *</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            placeholder="Describe your business, products, and services"
          />
        </div>

        <div className="col-span-1">
          <Label>Phone Number *</Label>
          <TanzaniaPhoneInput name="phone" value={formData.phone} onChange={handleChange} required />
        </div>

        <div className="col-span-1">
          <Label>WhatsApp Number</Label>
          <TanzaniaPhoneInput name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
          <p className="mt-1 text-xs text-gray-400">Optional — customers can tap to chat on WhatsApp</p>
        </div>

        <div className="col-span-1">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="col-span-1 md:col-span-2 xl:col-span-3" ref={categoryDropdownRef}>
          <Label>Categories (up to 2) *</Label>
          <div className="relative mt-1">
            <button
              type="button"
              onClick={() => setCategoryOpen((o) => !o)}
              className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-primary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <span className="flex flex-wrap items-center gap-1.5 text-left min-h-[1.25rem]">
                {selectedCategoryIds.length === 0 ? (
                  <span className="text-gray-400">Select categories...</span>
                ) : (
                  selectedCategoryIds.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    return cat ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {cat.icon} {cat.name}
                      </span>
                    ) : null;
                  })
                )}
              </span>
              <FiChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoryOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="border-b border-gray-200 p-2 dark:border-gray-700">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      autoFocus
                    />
                    <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto p-2">
                  {filteredCategories.length === 0 ? (
                    <p className="px-2 py-3 text-center text-sm text-gray-400">No categories found</p>
                  ) : (
                    filteredCategories.map((cat) => (
                      <label
                        key={cat.id}
                        className={`flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedCategoryIds.includes(cat.id) ? 'bg-primary/5' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(cat.id)}
                          onChange={() => onToggleCategory(cat.id)}
                          disabled={!selectedCategoryIds.includes(cat.id) && selectedCategoryIds.length >= 2}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>{cat.icon} {cat.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {bundleAllows(bundle, 'website') && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
          </div>
        )}

        {bundleAllows(bundle, 'facebook') && (
          <div className="col-span-1">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} />
          </div>
        )}
        {bundleAllows(bundle, 'instagram') && (
          <div className="col-span-1">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} />
          </div>
        )}
        {bundleAllows(bundle, 'twitter') && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3">
            <Label htmlFor="twitter">Twitter / X</Label>
            <Input id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} />
          </div>
        )}

        {(bundleAllows(bundle, 'allowsOnlineBooking') || bundleAllows(bundle, 'allowsDelivery')) && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-wrap gap-6">
            {bundleAllows(bundle, 'allowsOnlineBooking') && (
              <div className="flex items-center">
                <Checkbox id="allowsOnlineBooking" checked={formData.allowsOnlineBooking} onChange={(c) => handleCheckbox(c, 'allowsOnlineBooking')} />
                <Label htmlFor="allowsOnlineBooking" className="ml-2 cursor-pointer">Online booking</Label>
              </div>
            )}
            {bundleAllows(bundle, 'allowsDelivery') && (
              <div className="flex items-center">
                <Checkbox id="allowsDelivery" checked={formData.allowsDelivery} onChange={(c) => handleCheckbox(c, 'allowsDelivery')} />
                <Label htmlFor="allowsDelivery" className="ml-2 cursor-pointer">Delivery available</Label>
              </div>
            )}
          </div>
        )}

        {bundleAllows(bundle, 'coverImage') && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3">
            <Label>Cover Image</Label>
            <div className="flex items-center gap-4 mt-1">
              <button type="button" onClick={() => coverInputRef.current?.click()} className="h-24 w-40 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                {coverPreview ? <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" /> : <FiImage className="h-8 w-8 text-gray-400" />}
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              {coverPreview && (
                <button type="button" onClick={() => { setCoverPreview(null); setFormData((prev) => ({ ...prev, coverImage: '' })); }} className="text-red-500 text-sm hover:underline">Remove cover</button>
              )}
            </div>
          </div>
        )}

        {bundle && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3">
            <Label>Product Photos (up to {maxPhotos})</Label>
            {productImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {productImages.map((img, i) => (
                  <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-primary-200">
                    <img src={img} alt={`Product ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setProductImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      aria-label={`Remove photo ${i + 1}`}
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverImages(true); }}
              onDragLeave={() => setDragOverImages(false)}
              onDrop={handleImageDrop}
              className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                dragOverImages
                  ? 'border-primary-400 bg-primary/5'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              } ${productImages.length >= maxPhotos ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <FiImage className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Drag & drop photos here, or{' '}
                <button
                  type="button"
                  onClick={() => imagesInputRef.current?.click()}
                  disabled={productImages.length >= maxPhotos}
                  className="text-primary hover:underline font-semibold disabled:opacity-50"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Select multiple images at once — {productImages.length} / {maxPhotos} used
              </p>
            </div>
            <input
              ref={imagesInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleProductImagesChange}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 w-full">
      <div className="col-span-1 w-full">
        <SearchableDropdown
          id="regionId"
          label="Region"
          placeholder="Select a region"
          searchPlaceholder="Search regions..."
          value={formData.regionId}
          options={regionOptions}
          search={regionSearch}
          onSearchChange={setRegionSearch}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, regionId: value, districtId: '', wardId: '' }));
            setDistrictSearch('');
            setWardSearch('');
          }}
          required
        />
      </div>
      <div className="col-span-1 w-full">
        <SearchableDropdown
          id="districtId"
          label="District"
          placeholder={formData.regionId ? 'Select a district' : 'Select a region first'}
          searchPlaceholder="Search districts..."
          value={formData.districtId}
          options={districtOptions}
          search={districtSearch}
          onSearchChange={setDistrictSearch}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, districtId: value, wardId: '' }));
            setWardSearch('');
          }}
          disabled={!formData.regionId}
          emptyMessage={formData.regionId ? 'No districts found' : 'Select a region first'}
          required
        />
      </div>
      <div className="col-span-1 w-full">
        <SearchableDropdown
          id="wardId"
          label="Ward"
          placeholder={formData.districtId ? 'Select a ward' : 'Select a district first'}
          searchPlaceholder="Search wards..."
          value={formData.wardId}
          options={wardOptions}
          search={wardSearch}
          onSearchChange={setWardSearch}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, wardId: value }))}
          disabled={!formData.districtId}
          emptyMessage={formData.districtId ? 'No wards found' : 'Select a district first'}
          required
        />
      </div>
      <div className="col-span-1 md:col-span-2 xl:col-span-3">
        <Label htmlFor="street">Street Address *</Label>
        <Input
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="Building, street, landmarks"
          className="h-11"
          required
        />
      </div>
      {showGps && (
        <div className="col-span-1 md:col-span-2 xl:col-span-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20 p-4 space-y-4">
          <div className="flex gap-2">
            <FiMapPin className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
              <strong>Important:</strong> Make sure you are physically at your business location before detecting or saving GPS coordinates. This helps customers find you accurately on the map.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label htmlFor="latitude">Latitude</Label><Input id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="-6.8235" /></div>
            <div><Label htmlFor="longitude">Longitude</Label><Input id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="39.2695" /></div>
          </div>
          <Button type="button" variant="outline" onClick={onDetectLocation} loading={detectingLocation} className="w-full sm:w-auto">Detect my location</Button>
        </div>
      )}
    </div>
  );
}
