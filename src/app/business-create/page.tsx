"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Card from "@/components/ui/card/Card";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/select/Select";
import BundleSelection from "@/components/business/BundleSelection";
import PaymentProcessor from "@/components/business/PaymentProcessor";
import toast from "@/utils/toast";
import { useRouter } from "next/navigation";
import type { Bundle, Category, Region, District, Ward } from "@prisma/client";

// Step interface to track progress
interface Step {
  id: number;
  title: string;
  description: string;
}

// Steps in the business creation process
const steps: Step[] = [
  {
    id: 1,
    title: "Choose Bundle",
    description: "Select a subscription plan"
  },
  {
    id: 2,
    title: "Payment",
    description: "Complete your payment"
  },
  {
    id: 3,
    title: "Business Information",
    description: "Basic details about your business"
  },
  {
    id: 4,
    title: "Location",
    description: "Address and location information"
  }
];

interface BusinessFormData {
  name: string;
  description: string;
  phone: string;
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
  latitude: string;
  longitude: string;
  regionId: string;
  districtId: string;
  wardId: string;
  street: string;
}

export default function CreateBusinessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    logo: "",
    coverImage: "",
    facebook: "",
    instagram: "",
    twitter: "",
    allowsOnlineBooking: false,
    allowsDelivery: false,
    categoryId: "",
    latitude: "",
    longitude: "",
    regionId: "",
    districtId: "",
    wardId: "",
    street: ""
  });

  // Fetch bundles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bundles
        const bundlesResponse = await fetch('/api/bundles');
        if (!bundlesResponse.ok) throw new Error('Failed to fetch bundles');
        const bundlesData = await bundlesResponse.json();
        setBundles(bundlesData);

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch regions
        const regionsResponse = await fetch('/api/regions');
        if (!regionsResponse.ok) throw new Error('Failed to fetch regions');
        const regionsData = await regionsResponse.json();
        setRegions(regionsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        toast.error(errorMessage);
      }
    };
    
    fetchData();
  }, []);

  // Fetch districts when region changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.regionId) {
        setDistricts([]);
        return;
      }

      try {
        const response = await fetch(`/api/regions/${formData.regionId}/districts`);
        if (!response.ok) throw new Error('Failed to fetch districts');
        const data = await response.json();
        setDistricts(data);
        // Clear district and ward selection when region changes
        setFormData(prev => ({ ...prev, districtId: '', wardId: '' }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load districts';
        toast.error(errorMessage);
      }
    };

    fetchDistricts();
  }, [formData.regionId]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.districtId) {
        setWards([]);
        return;
      }

      try {
        const response = await fetch(`/api/districts/${formData.districtId}/wards`);
        if (!response.ok) throw new Error('Failed to fetch wards');
        const data = await response.json();
        setWards(data);
        // Clear ward selection when district changes
        setFormData(prev => ({ ...prev, wardId: '' }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load wards';
        toast.error(errorMessage);
      }
    };

    fetchWards();
  }, [formData.districtId]);

  const handleBundleSelect = (bundle: Bundle) => {
    setSelectedBundle(bundle);
  };

  const handlePaymentComplete = (tid: string) => {
    setTransactionId(tid);
    setCurrentStep(3);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    try {
      if (!selectedBundle || !transactionId) {
        toast.error('Please complete bundle selection and payment first');
        return;
      }

      // Get allowed fields from the selected bundle
      const allowedFields = JSON.parse(selectedBundle.allowedFields);
      
      // Validate required fields
      const requiredFields = ['name', 'description', 'phone', 'email', 'categoryId', 'regionId', 'districtId', 'wardId', 'street'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof BusinessFormData]);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Filter form data to only include allowed fields
      const filteredData = Object.keys(formData).reduce<Record<string, string | boolean>>((acc, key) => {
        if (allowedFields.includes(key)) {
          acc[key] = formData[key as keyof BusinessFormData];
        }
        return acc;
      }, {});

      // Add required fields that might not be in allowedFields
      const finalData = {
        ...filteredData,
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        categoryId: formData.categoryId,
        regionId: formData.regionId,
        districtId: formData.districtId,
        wardId: formData.wardId,
        street: formData.street,
        bundleId: selectedBundle.id,
        transactionId
      };

      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(finalData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create business');
      }

      toast.success('Business created successfully!');
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create business';
      toast.error(errorMessage);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <BundleSelection
            bundles={bundles}
            selectedBundle={selectedBundle}
            onSelect={handleBundleSelect}
          />
        );
      case 2:
        return selectedBundle ? (
          <PaymentProcessor
            amount={selectedBundle.price}
            onComplete={handlePaymentComplete}
          />
        ) : null;
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoryId">Business Category *</Label>
              <Select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            {selectedBundle && JSON.parse(selectedBundle.allowedFields).includes('website') && (
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {/* Add social media fields based on bundle */}
            {selectedBundle && JSON.parse(selectedBundle.allowedFields).includes('social_media') && (
              <>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            {selectedBundle && JSON.parse(selectedBundle.allowedFields).includes('allows_online_booking') && (
              <div>
                <Label htmlFor="allowsOnlineBooking">Allows Online Booking</Label>
                <input
                  id="allowsOnlineBooking"
                  name="allowsOnlineBooking"
                  type="checkbox"
                  checked={formData.allowsOnlineBooking}
                  onChange={handleCheckboxChange}
                />
              </div>
            )}
            {selectedBundle && JSON.parse(selectedBundle.allowedFields).includes('allows_delivery') && (
              <div>
                <Label htmlFor="allowsDelivery">Allows Delivery</Label>
                <input
                  id="allowsDelivery"
                  name="allowsDelivery"
                  type="checkbox"
                  checked={formData.allowsDelivery}
                  onChange={handleCheckboxChange}
                />
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="regionId">Region *</Label>
              <Select
                id="regionId"
                name="regionId"
                value={formData.regionId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a region</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="districtId">District *</Label>
              <Select
                id="districtId"
                name="districtId"
                value={formData.districtId}
                onChange={handleInputChange}
                required
                disabled={!formData.regionId}
              >
                <option value="">Select a district</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="wardId">Ward *</Label>
              <Select
                id="wardId"
                name="wardId"
                value={formData.wardId}
                onChange={handleInputChange}
                required
                disabled={!formData.districtId}
              >
                <option value="">Select a ward</option>
                {wards.map(ward => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
              />
            </div>
            {selectedBundle && JSON.parse(selectedBundle.allowedFields).includes('coordinates') && (
              <>
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <PageBreadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Create Business' }]} />
      
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Create New Business</h2>
            <p className="text-gray-600">Complete all steps to register your business</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center ${
                    currentStep === step.id
                      ? 'text-primary-600'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div className="mb-2">{step.title}</div>
                  <div className="text-sm">{step.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            {renderStepContent(currentStep)}
          </div>

          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Previous
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button
                variant="primary"
                onClick={() => {
                  if (currentStep === 1 && !selectedBundle) {
                    toast.error('Please select a bundle to continue');
                    return;
                  }
                  if (currentStep === 2 && !transactionId) {
                    toast.error('Please complete the payment to continue');
                    return;
                  }
                  setCurrentStep((prev) => prev + 1);
                }}
                className="ml-auto"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                className="ml-auto"
              >
                Create Business
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}