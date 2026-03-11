import React from 'react';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Business } from './types';

interface BusinessCardProps {
  business: Business;
  onView: (business: Business) => void;
  onEdit: (business: Business) => void;
  onDelete: (business: Business) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, onView, onEdit, onDelete }) => {
  return (
    <div className="relative bg-white dark:bg-boxdark p-4 rounded-lg border border-stroke dark:border-strokedark shadow-sm hover:shadow-md transition-shadow">
      <div className="absolute top-2 right-2 flex gap-1">
        {business.isVerified && (
          <span className="bg-success-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            ✓
          </span>
        )}
        {business.isApproved ? (
          <span className="bg-primary-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            ✓
          </span>
        ) : (
          <span className="bg-warning-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            !
          </span>
        )}
      </div>
      
      <div className="h-20 w-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {business.logo ? (
          <img 
            src={business.logo.startsWith('data:') ? business.logo : `data:image/jpeg;base64,${business.logo}`} 
            alt={business.name} 
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-2xl font-bold">
            {business.name.charAt(0)}
          </span>
        )}
      </div>
      
      <h3 className="text-sm font-semibold text-black dark:text-white mb-1 text-center truncate" title={business.name}>
        {business.name}
      </h3>
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {business.category?.name || 'Uncategorized'}
        </span>
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-300 mb-3 text-center truncate">
        <p title={[business.ward?.name, business.district?.name, business.region?.name].filter(Boolean).join(', ')}>
          {business.district?.name || business.region?.name || 'N/A'}
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-1 mb-3">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg 
              key={star}
              className={`h-3 w-3 ${star <= business.avgRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-[10px] text-gray-500">({business.numReviews})</span>
      </div>
      
      <div className="flex justify-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
        <button 
          className="p-1.5 rounded-md text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => onView(business)}
          title="View"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button 
          className="p-1.5 rounded-md text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => onEdit(business)}
          title="Edit"
        >
          <FiEdit className="h-4 w-4" />
        </button>
        <button 
          className="p-1.5 rounded-md text-gray-500 hover:text-danger hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => onDelete(business)}
          title="Delete"
        >
          <RiDeleteBin6Line className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BusinessCard;
