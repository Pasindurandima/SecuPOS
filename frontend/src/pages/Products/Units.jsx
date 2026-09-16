import React, { useState, useEffect } from 'react';
import { X, Ruler, FileText, Search, Edit, Trash2 } from 'lucide-react';
import { unitService } from '../../services/apiService';

const Units = () => {
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    allowDecimal: false,
    description: ''
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    filterUnits();
  }, [searchQuery, units]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const data = await unitService.getAll();
      setUnits(data);
      setFilteredUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
      alert('Failed to fetch units');
    } finally {
      setLoading(false);
    }
  };

  const filterUnits = () => {
    if (!searchQuery.trim()) {
      setFilteredUnits(units);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = units.filter(unit =>
      unit.name.toLowerCase().includes(query) ||
      unit.shortName.toLowerCase().includes(query)
    );
    setFilteredUnits(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortName: '',
      allowDecimal: false,
      description: ''
    });
    setSelectedUnit(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await unitService.create(formData);
      
      if (response.success) {
        alert('Unit created successfully!');
        setShowAddUnitModal(false);
        resetForm();
        fetchUnits();
      } else {
        alert(response.message || 'Failed to create unit');
      }
    } catch (error) {
      console.error('Error creating unit:', error);
      alert(error.response?.data?.message || 'Failed to create unit');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      name: unit.name,
      shortName: unit.shortName,
      allowDecimal: unit.allowDecimal,
      description: unit.description || ''
    });
    setShowEditUnitModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await unitService.update(selectedUnit.id, formData);
      
      if (response.success) {
        alert('Unit updated successfully!');
        setShowEditUnitModal(false);
        resetForm();
        fetchUnits();
      } else {
        alert(response.message || 'Failed to update unit');
      }
    } catch (error) {
      console.error('Error updating unit:', error);
      alert(error.response?.data?.message || 'Failed to update unit');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await unitService.delete(id);
      
      if (response.success) {
        alert('Unit deleted successfully!');
        fetchUnits();
      } else {
        alert(response.message || 'Failed to delete unit');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert(error.response?.data?.message || 'Failed to delete unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Units</h1>
        <p className="text-gray-600 mt-2">Manage product measurement units</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">Unit List ({filteredUnits.length})</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <button 
              onClick={() => setShowAddUnitModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Ruler className="w-4 h-4" />
              <span>Add Unit</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Loading units...</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="text-center py-8">
            <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? 'No units found matching your search' : 'No units available. Click "Add Unit" to create one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allow Decimal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {unit.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {unit.shortName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        unit.allowDecimal 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {unit.allowDecimal ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {unit.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(unit)}
                        className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(unit.id, unit.name)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center space-x-2">
                <Ruler className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Add New Unit</h3>
              </div>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Unit Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Pieces, Kilograms, Liters"
                        required
                      />
                    </div>
                  </div>

                  {/* Short Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Short Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shortName"
                      value={formData.shortName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Pcs, Kg, L"
                      maxLength="10"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Abbreviated form of the unit (max 10 characters)</p>
                  </div>

                  {/* Allow Decimal */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="allowDecimal"
                        checked={formData.allowDecimal}
                        onChange={handleInputChange}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold text-gray-700">Allow Decimal Values</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">Enable this for units that can have decimal quantities (e.g., 1.5 Kg)</p>
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
                        placeholder="Optional description"
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
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                >
                  <Ruler className="w-4 h-4" />
                  <span>Create Unit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {showEditUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Edit Unit</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditUnitModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  {/* Unit Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Pieces, Kilograms, Liters"
                        required
                      />
                    </div>
                  </div>

                  {/* Short Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Short Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shortName"
                      value={formData.shortName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Pcs, Kg, L"
                      maxLength="10"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Abbreviated form of the unit (max 10 characters)</p>
                  </div>

                  {/* Allow Decimal */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="allowDecimal"
                        checked={formData.allowDecimal}
                        onChange={handleInputChange}
                        className="rounded"
                      />
                      <span className="text-sm font-semibold text-gray-700">Allow Decimal Values</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">Enable this for units that can have decimal quantities (e.g., 1.5 Kg)</p>
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
                        placeholder="Optional description"
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
                    setShowEditUnitModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                  <span>{loading ? 'Updating...' : 'Update Unit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
