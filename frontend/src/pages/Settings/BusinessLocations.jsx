import React, { useEffect, useState } from 'react';
import { businessLocationService } from '../../services/apiService';

const emptyForm = {
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
};

const BusinessLocations = () => {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      setLocations(await businessLocationService.getAll());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load business locations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const savedLocation = editingId
        ? await businessLocationService.update(editingId, formData)
        : await businessLocationService.create(formData);

      setLocations((current) => editingId
        ? current.map((location) => location.id === editingId ? savedLocation : location)
        : [...current, savedLocation].sort((first, second) => first.name.localeCompare(second.name)));
      setFormData(emptyForm);
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save business location');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (location) => {
    setEditingId(location.id);
    setFormData({
      name: location.name || '',
      code: location.code || '',
      address: location.address || '',
      phone: location.phone || '',
      email: location.email || '',
    });
    setError('');
  };

  const handleDelete = async (location) => {
    if (!window.confirm(`Delete ${location.name}? It will no longer appear in location selectors.`)) return;

    try {
      await businessLocationService.delete(location.id);
      setLocations((current) => current.filter((item) => item.id !== location.id));
      if (editingId === location.id) {
        setEditingId(null);
        setFormData(emptyForm);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete business location');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError('');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Business Locations</h1>
        <p className="text-gray-600 mt-2">Manage the branches and warehouses used throughout the system</p>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            {editingId ? 'Edit Business Location' : 'Add New Location'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Location Name *</label>
              <input name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Main Office" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Location Code</label>
              <input name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g., LOC-001" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" placeholder="Enter location address" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Phone number" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email address" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 disabled:bg-gray-400">
                {saving ? 'Saving...' : editingId ? 'Update Location' : 'Add Location'}
              </button>
              {editingId && <button type="button" onClick={handleCancel} className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">Cancel</button>}
            </div>
          </form>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Existing Locations</h2>
          {loading ? <p className="py-8 text-center text-gray-500">Loading locations...</p> : locations.length === 0 ? <p className="py-8 text-center text-gray-500">No business locations created yet.</p> : (
            <div className="space-y-3">
              {locations.map((location) => (
                <div key={location.id} className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{location.name}</h3>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Active</span>
                      {location.code && <span className="ml-2 text-xs text-gray-500">{location.code}</span>}
                    </div>
                    <div className="flex gap-2 text-sm">
                      <button onClick={() => handleEdit(location)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => handleDelete(location)} className="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {location.address && <p>{location.address}</p>}
                    {location.phone && <p>Phone: {location.phone}</p>}
                    {location.email && <p>Email: {location.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessLocations;
