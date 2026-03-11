export interface BusinessImage {
  id: string;
  imageData: string;
  sortOrder: number;
}

export interface Business {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
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
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export interface Region {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  regionId: string;
}

export interface Ward {
  id: string;
  name: string;
  districtId: string;
}

export interface Bundle {
  id: string;
  name: string;
  price: number;
  maxImages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BusinessFormData {
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
  bundleId: string;
  categoryId: string;
  categoryId2: string;
  latitude: string;
  longitude: string;
  regionId: string;
  districtId: string;
  wardId: string;
  street: string;
  ownerId: string;
  isVerified: boolean;
  isApproved: boolean;
}
