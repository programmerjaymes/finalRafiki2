"use client";
import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import BundleSelection from "@/components/business/BundleSelection";
import PaymentProcessor from "@/components/business/PaymentProcessor";
import BusinessCreateFormFields, {
  type BusinessCreateFormData,
} from "@/components/business/BusinessCreateFormFields";
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
    description: "Manual payment info"
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

interface BusinessFormData extends BusinessCreateFormData {}

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
  const [categorySearch, setCategorySearch] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
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
    categoryId2: "",
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

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(catId)) {
        const next = prev.filter((id) => id !== catId);
        setFormData((fd) => ({
          ...fd,
          categoryId: next[0] || "",
          categoryId2: next[1] || "",
        }));
        return next;
      }
      if (prev.length >= 2) return prev;
      const next = [...prev, catId];
      setFormData((fd) => ({
        ...fd,
        categoryId: next[0] || "",
        categoryId2: next[1] || "",
      }));
      return next;
    });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
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
        toast.success("Location detected successfully");
        setDetectingLocation(false);
      },
      (err) => {
        toast.error(err.message || "Could not detect your location");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const formFieldsProps = {
    bundle: selectedBundle,
    formData,
    setFormData,
    categories,
    regions,
    districts,
    wards,
    selectedCategoryIds,
    onToggleCategory: toggleCategory,
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
    onDetectLocation: handleDetectLocation,
  };

  const handlePaymentComplete = (tid: string) => {
    setTransactionId(tid);
    setCurrentStep(3);
  };

  const buildSubmitPayload = () => {
    if (!selectedBundle) return null;
    const allowed = new Set(JSON.parse(selectedBundle.allowedFields) as string[]);
    const payload: Record<string, unknown> = {
      name: formData.name,
      description: formData.description,
      phone: formData.phone,
      email: formData.email,
      whatsapp: formData.whatsapp || null,
      categoryId: formData.categoryId,
      categoryId2: formData.categoryId2 || null,
      regionId: formData.regionId,
      districtId: formData.districtId,
      wardId: formData.wardId,
      street: formData.street,
      bundleId: selectedBundle.id,
      transactionId,
    };

    const optionalKeys: (keyof BusinessFormData)[] = [
      "website",
      "logo",
      "coverImage",
      "facebook",
      "instagram",
      "twitter",
      "latitude",
      "longitude",
      "allowsOnlineBooking",
      "allowsDelivery",
    ];

    for (const key of optionalKeys) {
      if (allowed.has(key)) {
        payload[key] = formData[key];
      }
    }

    if (productImages.length > 0) {
      payload.images = productImages;
    }

    return payload;
  };

  const submitBusiness = async () => {
    const finalData = buildSubmitPayload();
    if (!finalData) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to create business');
      }

      toast.success('Business created successfully!');
      router.push('/business-my-businesses');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create business';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedBundle || !transactionId) {
        toast.error('Please complete bundle selection and payment first');
        return;
      }

      const requiredFields = ['name', 'description', 'phone', 'email', 'categoryId', 'regionId', 'districtId', 'wardId', 'street'];
      const missingFields = requiredFields.filter((field) => !formData[field as keyof BusinessFormData]);
      if (missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      const result = await toast.confirm(
        'Create business?',
        `You are about to submit "${formData.name}" for registration. Please confirm all details are correct — this cannot be undone from this screen.`,
        'question',
      );

      if (!result.isConfirmed) return;

      await submitBusiness();
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
            bundleName={selectedBundle.name}
            onComplete={handlePaymentComplete}
          />
        ) : null;
      case 3:
        return <BusinessCreateFormFields step={3} {...formFieldsProps} />;
      case 4:
        return <BusinessCreateFormFields step={4} {...formFieldsProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <PageBreadcrumb
        items={[
          { label: 'Dashboard', path: '/business-dashboard' },
          { label: 'Create Business' },
        ]}
        className="mb-3 shrink-0 px-4 sm:px-6 lg:px-10"
      />

      <Card className="flex flex-col flex-1 min-h-0 !p-0 rounded-none border-0 shadow-none bg-white dark:bg-gray-900 overflow-hidden">
        <div className="shrink-0 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Create New Business
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Complete all steps to register your business
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                  currentStep === step.id
                    ? 'border-primary bg-primary/5 text-primary-600 dark:border-primary dark:bg-primary/10'
                    : currentStep > step.id
                    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="text-xs sm:text-sm font-semibold">{step.title}</div>
                <div className="mt-1 text-[10px] sm:text-xs opacity-80 hidden sm:block">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-10 py-6">
          <div className="w-full min-w-0">
            {renderStepContent(currentStep)}
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-4 flex justify-between gap-3 bg-gray-50/80 dark:bg-gray-900/80">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Previous
            </Button>
          ) : (
            <span />
          )}
          {currentStep < steps.length ? (
            <Button
              variant="primary"
              onClick={() => {
                if (currentStep === 1 && !selectedBundle) {
                  toast.error('Please select a bundle to continue');
                  return;
                }
                if (currentStep === 2) {
                  if (!transactionId) {
                    setTransactionId(`MANUAL-PENDING-${Date.now()}`);
                  }
                  setCurrentStep((prev) => prev + 1);
                  return;
                }
                setCurrentStep((prev) => prev + 1);
              }}
              className="ml-auto"
            >
              {currentStep === 2 ? 'Continue' : 'Next'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
              className="ml-auto"
            >
              Create Business
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}