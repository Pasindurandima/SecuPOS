import React, { useState } from 'react';
import { X, Layers, FileText, Percent, Tag } from 'lucide-react';

const CustomerGroups = () => {
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    priceCalculation: 'SELLING_PRICE',
    notes: ''
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
    // TODO: Add API call to create customer group
    console.log('Customer Group data:', formData);
    // Reset form and close modal
    setFormData({
      groupName: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      priceCalculation: 'SELLING_PRICE',
      notes: ''
    });
    setShowAddGroupModal(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Groups</h1>
        <p className="text-gray-600 mt-2">Organize customers into groups</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customer Group List</h2>
          <button 
            onClick={() => setShowAddGroupModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Layers className="w-4 h-4" />
            <span>Add New Group</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Retail Customers</h3>
            <p className="text-sm text-gray-600 mb-3">Regular retail buyers</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">25 customers</span>
              <div>
                <button className="text-blue-600 hover:text-blue-900 text-sm mr-2">Edit</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Wholesale Customers</h3>
            <p className="text-sm text-gray-600 mb-3">Bulk buyers with special pricing</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">8 customers</span>
              <div>
                <button className="text-blue-600 hover:text-blue-900 text-sm mr-2">Edit</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">VIP Customers</h3>
            <p className="text-sm text-gray-600 mb-3">Premium customers with special benefits</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">5 customers</span>
              <div>
                <button className="text-blue-600 hover:text-blue-900 text-sm mr-2">Edit</button>
                <button className="text-red-600 hover:text-red-900 text-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Add New Customer Group</h3>
              </div>
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Basic Information</h4>
                  <div className="space-y-4">
                    {/* Group Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Group Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="groupName"
                          value={formData.groupName}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="e.g., Retail, Wholesale, VIP"
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
                          placeholder="Describe this customer group"
                          rows="3"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Discount Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Pricing & Discount</h4>
                  <div className="space-y-4">
                    {/* Price Calculation */}
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
                        <option value="SELLING_PRICE">Selling Price</option>
                        <option value="SELLING_PRICE_GROUP_1">Selling Price Group 1</option>
                        <option value="SELLING_PRICE_GROUP_2">Selling Price Group 2</option>
                        <option value="SELLING_PRICE_GROUP_3">Selling Price Group 3</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Select how prices should be calculated for this group
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Discount Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Type
                        </label>
                        <select
                          name="discountType"
                          value={formData.discountType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="PERCENTAGE">Percentage (%)</option>
                          <option value="FIXED">Fixed Amount</option>
                        </select>
                      </div>

                      {/* Discount Value */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Value
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            name="discountValue"
                            value={formData.discountValue}
                            onChange={handleInputChange}
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 100'}
                            step="0.01"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.discountType === 'PERCENTAGE' ? 'Percentage off regular price' : 'Fixed amount discount'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Add any additional notes about this customer group"
                    rows="3"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Create Group</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerGroups;
