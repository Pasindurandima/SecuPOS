import React, { useState } from 'react';
import { X, GitBranch, Tag, Plus, Trash2 } from 'lucide-react';

const Variations = () => {
  const [showAddVariationModal, setShowAddVariationModal] = useState(false);
  const [formData, setFormData] = useState({
    templateName: '',
    values: ['']
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleValueChange = (index, value) => {
    const newValues = [...formData.values];
    newValues[index] = value;
    setFormData(prev => ({
      ...prev,
      values: newValues
    }));
  };

  const addValue = () => {
    setFormData(prev => ({
      ...prev,
      values: [...prev.values, '']
    }));
  };

  const removeValue = (index) => {
    if (formData.values.length > 1) {
      const newValues = formData.values.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        values: newValues
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Variation Template Data:', formData);
    setShowAddVariationModal(false);
    // API integration here
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Variations</h1>
        <p className="text-gray-600 mt-2">Manage product variations and attributes</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Variation Templates</h2>
          <button 
            onClick={() => setShowAddVariationModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <GitBranch className="w-4 h-4" />
            <span>Add Variation Template</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Size</h3>
            <p className="text-sm text-gray-600 mb-3">Values: S, M, L, XL, XXL</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">5 values</span>
              <div>
                <button className="text-blue-600 hover:text-blue-900 text-sm mr-2">Edit</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Color</h3>
            <p className="text-sm text-gray-600 mb-3">Values: Red, Blue, Green, Black, White</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">5 values</span>
              <div>
                <button className="text-blue-600 hover:text-blue-900 text-sm mr-2">Edit</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Material</h3>
            <p className="text-sm text-gray-600 mb-3">Values: Cotton, Polyester, Wool</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">3 values</span>
              <div>
                <button className="text-blue-600 hover:text-blue-900 text-sm mr-2">Edit</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Variation Template Modal */}
      {showAddVariationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Add Variation Template</h3>
              </div>
              <button
                onClick={() => setShowAddVariationModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Template Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="templateName"
                        value={formData.templateName}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Size, Color, Material"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Examples: Size (S, M, L), Color (Red, Blue), Material (Cotton, Wool)</p>
                  </div>

                  {/* Variation Values */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Variation Values <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {formData.values.map((value, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleValueChange(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder={`Value ${index + 1} (e.g., Small, Medium, Large)`}
                            required
                          />
                          {formData.values.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeValue(index)}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addValue}
                      className="mt-3 flex items-center space-x-2 text-sm text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Value</span>
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Variation templates help you manage product variants efficiently. 
                      For example, a "Size" template with values S, M, L, XL can be applied to clothing products.
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddVariationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>Create Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Variations;
