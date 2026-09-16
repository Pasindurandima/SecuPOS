import React, { useState } from 'react';
import { X, DollarSign, FileText } from 'lucide-react';

const SellingPriceGroup = () => {
  const [showAddPriceGroupModal, setShowAddPriceGroupModal] = useState(false);
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    priceCalculation: 'MARKUP',
    markupPercentage: '',
    discountPercentage: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Price Group Data:', formData);
    setShowAddPriceGroupModal(false);
    // API integration here
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Selling Price Group</h1>
        <p className="text-gray-600 mt-2">Manage different pricing groups for customer segments</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Price Groups</h2>
          <button 
            onClick={() => setShowAddPriceGroupModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Add Price Group</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Wholesale</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Special pricing for bulk buyers</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">25 products</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-teal-600 hover:text-teal-900 mr-3">Edit</button>
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Manage Prices</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Retail</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Standard retail pricing</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">50 products</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-teal-600 hover:text-teal-900 mr-3">Edit</button>
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Manage Prices</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">VIP</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Premium customer pricing</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">30 products</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-teal-600 hover:text-teal-900 mr-3">Edit</button>
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Manage Prices</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Price Group Modal */}
      {showAddPriceGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Add Price Group</h3>
              </div>
              <button
                onClick={() => setShowAddPriceGroupModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Group Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Group Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="groupName"
                        value={formData.groupName}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Wholesale, Retail, VIP"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Describe this price group"
                        rows="3"
                        required
                      />
                    </div>
                  </div>

                  {/* Price Calculation Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price Calculation Method
                    </label>
                    <select
                      name="priceCalculation"
                      value={formData.priceCalculation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="MARKUP">Markup on Purchase Price</option>
                      <option value="DISCOUNT">Discount on Selling Price</option>
                      <option value="FIXED">Fixed Price</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose how prices will be calculated for this group
                    </p>
                  </div>

                  {/* Conditional Fields Based on Calculation Type */}
                  {formData.priceCalculation === 'MARKUP' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Markup Percentage (%)
                      </label>
                      <input
                        type="number"
                        name="markupPercentage"
                        value={formData.markupPercentage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., 25 for 25% markup"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Price will be purchase price + markup percentage
                      </p>
                    </div>
                  )}

                  {formData.priceCalculation === 'DISCOUNT' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Discount Percentage (%)
                      </label>
                      <input
                        type="number"
                        name="discountPercentage"
                        value={formData.discountPercentage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., 10 for 10% discount"
                        step="0.01"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Price will be selling price - discount percentage
                      </p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Price groups allow you to set different pricing strategies 
                      for different customer segments. You can assign products to price groups after creation.
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
                  onClick={() => setShowAddPriceGroupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Create Price Group</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellingPriceGroup;
