import React, { useState } from 'react';
import { Percent, Plus, Edit, Trash2, Tag, Calendar, Users, DollarSign } from 'lucide-react';

const Discounts = () => {
  const [showModal, setShowModal] = useState(false);
  const [discountData, setDiscountData] = useState({
    name: '',
    code: '',
    type: 'PERCENTAGE',
    value: 0,
    minAmount: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    applicableFor: 'ALL',
    description: ''
  });

  const [discounts] = useState([
    {
      id: 1,
      name: 'Black Friday Sale',
      code: 'BF2025',
      type: 'PERCENTAGE',
      value: 25,
      minAmount: 5000,
      maxDiscount: 10000,
      startDate: '2025-11-24',
      endDate: '2025-11-27',
      usageLimit: 500,
      used: 234,
      applicableFor: 'ALL',
      status: 'ACTIVE'
    },
    {
      id: 2,
      name: 'New Customer Discount',
      code: 'NEWCUST50',
      type: 'FIXED',
      value: 500,
      minAmount: 2000,
      maxDiscount: 500,
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      usageLimit: 1000,
      used: 145,
      applicableFor: 'NEW_CUSTOMERS',
      status: 'ACTIVE'
    },
    {
      id: 3,
      name: 'Summer Sale',
      code: 'SUMMER20',
      type: 'PERCENTAGE',
      value: 20,
      minAmount: 3000,
      maxDiscount: 5000,
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      usageLimit: 300,
      used: 300,
      applicableFor: 'ALL',
      status: 'EXPIRED'
    },
    {
      id: 4,
      name: 'VIP Member Discount',
      code: 'VIP15',
      type: 'PERCENTAGE',
      value: 15,
      minAmount: 0,
      maxDiscount: 0,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      usageLimit: 0,
      used: 567,
      applicableFor: 'VIP_CUSTOMERS',
      status: 'ACTIVE'
    }
  ]);

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'INACTIVE': 'bg-gray-100 text-gray-800',
      'EXPIRED': 'bg-red-100 text-red-800',
      'SCHEDULED': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type, value) => {
    return type === 'PERCENTAGE' ? `${value}%` : `Rs ${value}`;
  };

  const handleAddDiscount = () => {
    setShowModal(true);
    setDiscountData({
      name: '',
      code: '',
      type: 'PERCENTAGE',
      value: 0,
      minAmount: 0,
      maxDiscount: 0,
      startDate: '',
      endDate: '',
      usageLimit: 0,
      applicableFor: 'ALL',
      description: ''
    });
  };

  const handleSaveDiscount = () => {
    console.log('Saving discount:', discountData);
    setShowModal(false);
  };

  const handleEditDiscount = (id) => {
    console.log('Edit discount:', id);
  };

  const handleDeleteDiscount = (id) => {
    console.log('Delete discount:', id);
  };

  const handleToggleStatus = (id) => {
    console.log('Toggle discount status:', id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Discounts & Promotions</h1>
        <p className="text-gray-600 mt-2">Manage discount codes and promotional offers</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search discounts..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Types</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>
          <button
            onClick={handleAddDiscount}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Discount</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Period</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm font-medium text-gray-900">
                    <div className="max-w-[200px]">
                      <div className="font-medium">{discount.name}</div>
                      <div className="text-xs text-gray-500">
                        {discount.applicableFor.replace('_', ' ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-mono bg-teal-100 text-teal-800 rounded">
                      {discount.code}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-bold text-teal-600">
                      {getTypeLabel(discount.type, discount.value)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {discount.minAmount > 0 && `Min: Rs ${discount.minAmount}`}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600">
                    <div className="flex items-center text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      <div>
                        <div>{discount.startDate}</div>
                        <div>{discount.endDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600">
                    <div className="text-xs">
                      {discount.used} / {discount.usageLimit > 0 ? discount.usageLimit : '∞'}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(discount.status)}`}>
                      {discount.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditDiscount(discount.id)}
                        className="text-teal-600 hover:text-teal-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(discount.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Toggle Status"
                      >
                        <Percent className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDiscount(discount.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Active Discounts</div>
            <div className="text-2xl font-bold text-green-900">
              {discounts.filter(d => d.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Expired</div>
            <div className="text-2xl font-bold text-red-900">
              {discounts.filter(d => d.status === 'EXPIRED').length}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Usage</div>
            <div className="text-2xl font-bold text-blue-900">
              {discounts.reduce((sum, d) => sum + d.used, 0)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Available Codes</div>
            <div className="text-2xl font-bold text-purple-900">
              {discounts.filter(d => d.status === 'ACTIVE').length}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Discount Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-lg flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center">
                <Percent className="w-5 h-5 mr-2" />
                Add Discount
              </h2>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Discount Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={discountData.name}
                    onChange={(e) => setDiscountData({...discountData, name: e.target.value})}
                    placeholder="e.g., Black Friday Sale"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={discountData.code}
                    onChange={(e) => setDiscountData({...discountData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., BF2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <select
                    value={discountData.type}
                    onChange={(e) => setDiscountData({...discountData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (Rs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={discountData.value}
                    onChange={(e) => setDiscountData({...discountData, value: parseFloat(e.target.value) || 0})}
                    placeholder={discountData.type === 'PERCENTAGE' ? '0-100' : '0.00'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="0"
                    max={discountData.type === 'PERCENTAGE' ? '100' : undefined}
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Amount</label>
                  <input
                    type="number"
                    value={discountData.minAmount}
                    onChange={(e) => setDiscountData({...discountData, minAmount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Discount</label>
                  <input
                    type="number"
                    value={discountData.maxDiscount}
                    onChange={(e) => setDiscountData({...discountData, maxDiscount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00 (0 = unlimited)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={discountData.startDate}
                    onChange={(e) => setDiscountData({...discountData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={discountData.endDate}
                    onChange={(e) => setDiscountData({...discountData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                  <input
                    type="number"
                    value={discountData.usageLimit}
                    onChange={(e) => setDiscountData({...discountData, usageLimit: parseInt(e.target.value) || 0})}
                    placeholder="0 = unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Applicable For
                  </label>
                  <select
                    value={discountData.applicableFor}
                    onChange={(e) => setDiscountData({...discountData, applicableFor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ALL">All Customers</option>
                    <option value="NEW_CUSTOMERS">New Customers Only</option>
                    <option value="VIP_CUSTOMERS">VIP Customers Only</option>
                    <option value="SPECIFIC_GROUP">Specific Customer Group</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={discountData.description}
                  onChange={(e) => setDiscountData({...discountData, description: e.target.value})}
                  rows="3"
                  placeholder="Add a description for this discount..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6 flex justify-end space-x-4 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDiscount}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Percent className="w-4 h-4" />
                <span>Save Discount</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discounts;
