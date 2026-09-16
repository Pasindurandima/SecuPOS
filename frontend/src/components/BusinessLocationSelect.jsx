import React, { useEffect, useState } from 'react';
import { businessLocationService } from '../services/apiService';

const BusinessLocationSelect = ({
  value,
  onChange,
  name = 'businessLocation',
  required = false,
  allLabel = '',
  className = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500',
}) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let mounted = true;
    businessLocationService.getAll()
      .then((data) => {
        if (mounted) setLocations(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error('Failed to load business locations:', error));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <select name={name} value={value ?? ''} onChange={onChange} required={required} className={className}>
      <option value="">{allLabel || 'Select Location'}</option>
      {locations.map((location) => (
        <option key={location.id} value={location.name}>
          {location.name}{location.code ? ` (${location.code})` : ''}
        </option>
      ))}
    </select>
  );
};

export default BusinessLocationSelect;
