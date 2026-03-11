import React from 'react';
import { FiMapPin, FiPhone, FiMail, FiGlobe, FiUser } from 'react-icons/fi';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { Business } from './types';

interface BusinessViewModalProps {
  isOpen: boolean;
  business: Business | null;
  loading: boolean;
  onClose: () => void;
  onEdit: (business: Business) => void;
}

const BusinessViewModal: React.FC<BusinessViewModalProps> = ({
  isOpen,
  business,
  loading,
  onClose,
  onEdit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] p-6 max-h-[90vh] overflow-y-auto"
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : business && (
        <div>
          <div className="flex items-start gap-4 mb-6">
            <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {business.logo ? (
                <img src={business.logo.startsWith('data:') ? business.logo : `data:image/jpeg;base64,${business.logo}`} alt={business.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-400">{business.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{business.name}</h4>
              <p className="text-sm text-gray-500">{business.category?.name || 'Uncategorized'}</p>
              <div className="flex gap-2 mt-2">
                {business.isApproved ? (
                  <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium px-2 py-0.5 rounded-full">Approved</span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full">Pending</span>
                )}
                {business.isVerified && (
                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full">Verified</span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} className={`h-4 w-4 ${star <= business.avgRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{business.avgRating.toFixed(1)} ({business.numReviews} reviews)</p>
            </div>
          </div>

          {business.images && business.images.length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Photos</h5>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {business.images.map((img, i) => (
                  <div key={img.id || i} className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    <img src={img.imageData.startsWith('data:') ? img.imageData : `data:image/jpeg;base64,${img.imageData}`} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-5">
            {business.description && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{business.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{business.category?.name || 'N/A'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bundle</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{business.bundle?.name || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact</h5>
              <div className="space-y-1.5">
                {business.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiPhone className="h-3.5 w-3.5 text-gray-400" /> {business.phone}
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="h-3.5 w-3.5 text-gray-400" /> {business.email}
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiGlobe className="h-3.5 w-3.5 text-gray-400" /> {business.website}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</h5>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiMapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                <span>{[business.street, business.ward?.name, business.district?.name, business.region?.name].filter(Boolean).join(', ') || 'N/A'}</span>
              </div>
              {business.latitude && business.longitude && (
                <p className="text-xs text-gray-400 mt-1 ml-5.5">GPS: {business.latitude}, {business.longitude}</p>
              )}
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</h5>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiUser className="h-3.5 w-3.5 text-gray-400" />
                {business.owner?.name} ({business.owner?.email})
              </div>
            </div>

            {(business.allowsOnlineBooking || business.allowsDelivery) && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</h5>
                <div className="flex flex-wrap gap-2">
                  {business.allowsOnlineBooking && (
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-md">Online Booking</span>
                  )}
                  {business.allowsDelivery && (
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-md">Delivery</span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end w-full gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" onClick={() => { onClose(); onEdit(business); }}>
              Edit
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BusinessViewModal;
