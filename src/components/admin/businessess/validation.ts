import { BusinessFormData } from './types';

export interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  website?: string;
  bundleId?: string;
  categoryId?: string;
  ownerId?: string;
  regionId?: string;
  districtId?: string;
  wardId?: string;
  latitude?: string;
  longitude?: string;
}

export const validateBusinessForm = (
  formData: BusinessFormData,
  selectedUserId: string,
  selectedCategoryIds: string[]
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Required field: Business name
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'Business name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Business name must be at least 2 characters';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Business name must not exceed 100 characters';
  }

  // Required field: Phone number
  if (!formData.phone || formData.phone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  } else {
    const phoneRegex = /^(\+255|0)[67]\d{8}$/;
    const cleanPhone = formData.phone.replace(/\s+/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Invalid phone number. Format: +255XXXXXXXXX or 0XXXXXXXXX (must start with 6 or 7)';
    }
  }

  // Email validation (optional but must be valid if provided)
  if (formData.email && formData.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
  }

  // Website validation (optional but must be valid if provided)
  if (formData.website && formData.website.trim().length > 0) {
    try {
      const url = new URL(formData.website);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.website = 'Website must start with http:// or https://';
      }
    } catch {
      errors.website = 'Invalid website URL. Must include http:// or https://';
    }
  }

  // Required field: Bundle
  if (!formData.bundleId || formData.bundleId.trim().length === 0) {
    errors.bundleId = 'Please select a bundle';
  }

  // Required field: Categories
  if (selectedCategoryIds.length === 0) {
    errors.categoryId = 'Please select at least one category';
  }

  // Required field: Owner/User
  if (!selectedUserId || selectedUserId.trim().length === 0) {
    errors.ownerId = 'Please select a business owner';
  }

  // Required field: Region
  if (!formData.regionId || formData.regionId.trim().length === 0) {
    errors.regionId = 'Please select a region';
  }

  // Required field: District
  if (!formData.districtId || formData.districtId.trim().length === 0) {
    errors.districtId = 'Please select a district';
  }

  // Required field: Ward
  if (!formData.wardId || formData.wardId.trim().length === 0) {
    errors.wardId = 'Please select a ward';
  }

  // GPS coordinates validation (optional but must be valid if provided)
  if (formData.latitude && formData.latitude.trim().length > 0) {
    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
  }

  if (formData.longitude && formData.longitude.trim().length > 0) {
    const lng = parseFloat(formData.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const getErrorMessage = (errors: ValidationErrors): string => {
  const errorMessages = Object.values(errors).filter(Boolean);
  if (errorMessages.length === 0) return '';
  
  if (errorMessages.length === 1) {
    return errorMessages[0];
  }
  
  return `Please fix the following errors:\n${errorMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}`;
};
