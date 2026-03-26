'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaPhone, FaEnvelope, FaGlobe, FaFacebook, FaInstagram, FaTwitter, FaStar, FaMapMarkerAlt } from 'react-icons/fa';

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
  bundleExpiresAt: string;
  latitude: number | null;
  longitude: number | null;
  street: string | null;
  avgRating: number;
  numReviews: number;
  viewCount: number;
  clickCount: number;
  inquiryCount: number;
  createdAt: string;
  updatedAt: string;
  images?: BusinessImage[];
  
  // Included relations
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  region: {
    id: string;
    name: string;
  };
  district: {
    id: string;
    name: string;
  };
  ward: {
    id: string;
    name: string;
  };
  bundle: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export default function BusinessDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch business data
  useEffect(() => {
    async function fetchBusinessData() {
      try {
        const response = await fetch(`/api/businesses/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Business not found');
          } else {
            setError('Failed to load business');
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setBusiness(data);
        
        // Track view
        try {
          await fetch(`/api/businesses/${id}/view`, {
            method: 'POST'
          });
        } catch (err) {
          console.error('Failed to track view:', err);
        }
      } catch (err) {
        console.error('Error fetching business:', err);
        setError('Failed to load business');
      } finally {
        setLoading(false);
      }
    }
    
    fetchBusinessData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{error || 'Business not found'}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The business you're looking for could not be found or is no longer available.</p>
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Business Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="relative h-64 w-full bg-gradient-to-r from-primary to-primary-light dark:from-secondary dark:to-secondary-light">
            {business.coverImage ? (
              <Image 
                src={business.coverImage} 
                alt={`${business.name} cover`}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <h1 className="text-white text-3xl font-bold px-4 text-center">{business.name}</h1>
              </div>
            )}
          </div>
          
          {/* Business Info Section */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex items-center">
                {business.logo ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden mr-4 border-4 border-white dark:border-gray-700 shadow-lg">
                    <img 
                      src={business.logo.startsWith('data:') ? business.logo : `data:image/jpeg;base64,${business.logo}`} 
                      alt={`${business.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary dark:bg-secondary flex items-center justify-center text-white dark:text-gray-900 mr-4 border-4 border-white dark:border-gray-700 shadow-lg">
                    <span className="text-2xl font-bold">{business.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{business.name}</h1>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark dark:bg-secondary-light dark:text-secondary-dark mr-2">
                      {business.category.name}
                    </span>
                    {business.isVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center">
                <div className="flex items-center mr-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(business.avgRating) 
                          ? 'text-yellow-400' 
                          : i < business.avgRating 
                            ? 'text-yellow-300' 
                            : 'text-gray-300 dark:text-gray-600'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                    ({business.numReviews})
                  </span>
                </div>
                
                {business.allowsOnlineBooking && (
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark dark:bg-secondary dark:hover:bg-secondary-light transition duration-150">
                    Book Now
                  </button>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-700 dark:text-gray-300">{business.description}</p>
            </div>
            
            {/* Product Images Gallery */}
            {business.images && business.images.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {business.images.map((img, i) => (
                    <div key={img.id || i} className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <img 
                        src={img.imageData.startsWith('data:') ? img.imageData : `data:image/jpeg;base64,${img.imageData}`} 
                        alt={`${business.name} photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            
            <ul className="space-y-4">
              {business.phone && (
                <li className="flex items-start">
                  <FaPhone className="mt-1 w-5 h-5 text-primary dark:text-secondary mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <a href={`tel:${business.phone}`} className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-secondary">
                      {business.phone}
                    </a>
                  </div>
                </li>
              )}
              
              {business.email && (
                <li className="flex items-start">
                  <FaEnvelope className="mt-1 w-5 h-5 text-primary dark:text-secondary mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${business.email}`} className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-secondary">
                      {business.email}
                    </a>
                  </div>
                </li>
              )}
              
              {business.website && (
                <li className="flex items-start">
                  <FaGlobe className="mt-1 w-5 h-5 text-primary dark:text-secondary mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white hover:text-primary dark:hover:text-secondary">
                      {business.website.replace(/(^\w+:|^)\/\//, '')}
                    </a>
                  </div>
                </li>
              )}
            </ul>
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Social Media</h3>
              <div className="flex space-x-3">
                {business.facebook && (
                  <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    <FaFacebook className="w-6 h-6" />
                  </a>
                )}
                
                {business.instagram && (
                  <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400">
                    <FaInstagram className="w-6 h-6" />
                  </a>
                )}
                
                {business.twitter && (
                  <a href={business.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 dark:hover:text-blue-300">
                    <FaTwitter className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 w-5 h-5 text-primary dark:text-secondary mr-3" />
                <div>
                  <p className="text-gray-900 dark:text-white">
                    {business.street ? `${business.street}, ` : ''}
                    {business.ward.name}, {business.district.name}, {business.region.name}
                  </p>
                </div>
              </li>
            </ul>
            
            {/* Map placeholder */}
            <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-700 h-48 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Map view would be displayed here</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Features</h2>
            
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              {business.allowsOnlineBooking && (
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Online Booking Available
                </li>
              )}
              
              {business.allowsDelivery && (
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Delivery Services
                </li>
              )}
              
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {business.category.name} Services
              </li>
            </ul>
            
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Business Statistics</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{business.viewCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Clicks</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{business.clickCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inquiries</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{business.inquiryCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back Button */}
        <div className="flex justify-center">
          <Link 
            href="/search"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Back to Search
          </Link>
        </div>
      </div>
    </div>
  );
} 