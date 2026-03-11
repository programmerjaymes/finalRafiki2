import React from 'react';
import { FiMapPin } from 'react-icons/fi';
import Label from '@/components/form/Label';
import { Region, District, Ward } from './types';

interface LocationFieldsProps {
  formData: {
    regionId: string;
    districtId: string;
    wardId: string;
    street: string;
    latitude: string;
    longitude: string;
  };
  regions: Region[];
  filteredDistricts: District[];
  filteredWards: Ward[];
  filteredStreets: { id: string; name: string }[];
  fetchingLocation: boolean;
  onFieldChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onRegionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onWardChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onGetLocation: () => void;
}

const LocationFields: React.FC<LocationFieldsProps> = ({
  formData,
  regions,
  filteredDistricts,
  filteredWards,
  filteredStreets,
  fetchingLocation,
  onFieldChange,
  onRegionChange,
  onDistrictChange,
  onWardChange,
  onGetLocation,
}) => {
  return (
    <>
      <div className="col-span-1">
        <Label>Region</Label>
        <select 
          name="regionId" 
          value={formData.regionId} 
          onChange={onRegionChange}
          className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="">Select Region</option>
          {regions.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
        </select>
      </div>
      
      <div className="col-span-1">
        <Label>District</Label>
        <select 
          name="districtId" 
          value={formData.districtId} 
          disabled={!formData.regionId}
          onChange={onDistrictChange}
          className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 disabled:opacity-50"
        >
          <option value="">{formData.regionId ? 'Select District' : 'Select a region first'}</option>
          {filteredDistricts.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
        </select>
      </div>
      
      <div className="col-span-1">
        <Label>Ward</Label>
        <select 
          name="wardId" 
          value={formData.wardId} 
          disabled={!formData.districtId} 
          onChange={onWardChange}
          className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 disabled:opacity-50"
        >
          <option value="">{formData.districtId ? 'Select Ward' : 'Select a district first'}</option>
          {filteredWards.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
        </select>
      </div>

      <div className="col-span-1">
        <Label>Street / Village</Label>
        <select 
          name="street" 
          value={formData.street || ''} 
          disabled={!formData.wardId} 
          onChange={onFieldChange}
          className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 disabled:opacity-50"
        >
          <option value="">{formData.wardId ? 'Select street/village' : 'Select a ward first'}</option>
          {filteredStreets.map(s => (<option key={s.id} value={s.name}>{s.name}</option>))}
        </select>
      </div>

      <div className="col-span-1">
        <div className="flex items-center justify-between mb-2">
          <Label>GPS Coordinates</Label>
          <button
            type="button"
            onClick={onGetLocation}
            disabled={fetchingLocation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {fetchingLocation ? (
              <>
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Getting Location...
              </>
            ) : (
              <>
                <FiMapPin className="h-3 w-3" />
                Get Current Location
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-2">
          <FiMapPin className="h-3 w-3" />
          Make sure you are physically at the business location before fetching coordinates
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="latitude"
            placeholder="Latitude (-6.8235)"
            value={formData.latitude}
            onChange={onFieldChange}
            readOnly
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 read-only:bg-gray-50 dark:read-only:bg-gray-800 read-only:cursor-not-allowed"
          />
          <input
            type="text"
            name="longitude"
            placeholder="Longitude (39.2695)"
            value={formData.longitude}
            onChange={onFieldChange}
            readOnly
            className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 read-only:bg-gray-50 dark:read-only:bg-gray-800 read-only:cursor-not-allowed"
          />
        </div>
      </div>
    </>
  );
};

export default LocationFields;
