import React, { useState, useEffect } from 'react';
import { X, Tag, FileText } from 'lucide-react';
import { brandService } from '../../services/apiService';

const Brands = () => {
  console.log('Brands component loaded');
  
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch brands on component mount
  useEffect(() => {
    console.log('useEffect running - calling fetchBrands');
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      console.log('Fetching brands...');
      const response = await brandService.getAll();
      console.log('Brands API Response:', response);
      console.log('Response structure:', JSON.stringify(response, null, 2));
      
      // brandService already unwraps the API response to an array.
      const brandsData = Array.isArray(response) ? response : response?.data || [];
      console.log('Brands array to display:', brandsData);
      console.log('Number of brands:', brandsData.length);
      
      setBrands(brandsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching brands:', err);
      console.error('Error response:', err.response);
      setError(`Failed to load brands: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        // Update existing brand
        console.log('Updating brand:', editingBrand.id, formData);
        const response = await brandService.update(editingBrand.id, formData);
        console.log('Brand updated successfully:', response);
        setShowEditBrandModal(false);
      } else {
        // Create new brand
        console.log('Creating brand with data:', formData);
        const response = await brandService.create(formData);
        console.log('Brand created successfully:', response);
        setShowAddBrandModal(false);
      }
      setFormData({ name: '', description: '' });
      setEditingBrand(null);
      fetchBrands(); // Refresh the brand list
    } catch (err) {
      console.error('Error saving brand:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || err.message;
      alert(`Failed to save brand: ${errorMessage}`);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || ''
    });
    setShowEditBrandModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        console.log('Deleting brand:', id);
        await brandService.delete(id);
        console.log('Brand deleted successfully');
        setBrands((currentBrands) => currentBrands.filter((brand) => String(brand.id) !== String(id)));
        await fetchBrands(); // Confirm the list from the database
      } catch (err) {
        console.error('Error deleting brand:', err);
        const errorMessage = err.response?.data?.message || err.message;
        alert(`Failed to delete brand: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
        <p className="text-gray-600 mt-2">Manage product brands</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Brand List</h2>
          <button 
            onClick={() => setShowAddBrandModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Tag className="w-4 h-4" />
            <span>Add Brand</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading && (
            <div className="text-center py-8 text-gray-600">Loading brands...</div>
          )}
          
          {error && (
            <div className="text-center py-8 text-red-600">{error}</div>
          )}

          {!loading && !error && brands.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No brands found. Click "Add Brand" to create one.
            </div>
          )}

          {!loading && !error && brands.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{brand.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{brand.description || 'No description'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(brand)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Brand Modal */}
      {showAddBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Add New Brand</h3>
              </div>
              <button
                onClick={() => setShowAddBrandModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Samsung, Sony, Bosch"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Describe the brand"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddBrandModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Create Brand</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Edit Brand</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditBrandModal(false);
                  setEditingBrand(null);
                  setFormData({ name: '', description: '' });
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Samsung, Sony, Bosch"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the brand"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBrandModal(false);
                    setEditingBrand(null);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Update Brand</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;

