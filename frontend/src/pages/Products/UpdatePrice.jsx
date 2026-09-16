import React, { useState } from 'react';
import { DollarSign, Search, TrendingUp, TrendingDown } from 'lucide-react';

const UpdatePrice = () => {
  const [updateConfig, setUpdateConfig] = useState({
    updateType: 'INCREASE_PERCENTAGE',
    value: '',
    applyTo: 'ALL'
  });

  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setUpdateConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePrices = () => {
    console.log('Update Config:', updateConfig);
    console.log('Selected Products:', selectedProducts);
    // API integration here
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Update Price</h1>
        <p className="text-gray-600 mt-2">Bulk update product prices</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Products</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Price Update Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Type</label>
              <select 
                name="updateType"
                value={updateConfig.updateType}
                onChange={handleConfigChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="INCREASE_PERCENTAGE">Increase by Percentage (%)</option>
                <option value="DECREASE_PERCENTAGE">Decrease by Percentage (%)</option>
                <option value="INCREASE_AMOUNT">Increase by Fixed Amount</option>
                <option value="DECREASE_AMOUNT">Decrease by Fixed Amount</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value {updateConfig.updateType.includes('PERCENTAGE') ? '(%)' : '(Rs)'}
              </label>
              <div className="relative">
                {updateConfig.updateType.includes('INCREASE') ? (
                  <TrendingUp className="absolute left-3 top-3 text-green-500 w-5 h-5" />
                ) : (
                  <TrendingDown className="absolute left-3 top-3 text-red-500 w-5 h-5" />
                )}
                <input
                  type="number"
                  name="value"
                  value={updateConfig.value}
                  onChange={handleConfigChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter value"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
              <select 
                name="applyTo"
                value={updateConfig.applyTo}
                onChange={handleConfigChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Products</option>
                <option value="SELECTED">Selected Products Only</option>
                <option value="CATEGORY">By Category</option>
                <option value="BRAND">By Brand</option>
              </select>
            </div>
          </div>

          {/* Preview Calculation */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Example:</strong> If current price is Rs 1,000 and you {updateConfig.updateType.includes('INCREASE') ? 'increase' : 'decrease'} by{' '}
              {updateConfig.value || '0'}{updateConfig.updateType.includes('PERCENTAGE') ? '%' : ' Rs'}, 
              new price will be Rs{' '}
              {updateConfig.value ? (
                updateConfig.updateType === 'INCREASE_PERCENTAGE' ? (1000 + (1000 * updateConfig.value / 100)).toFixed(2) :
                updateConfig.updateType === 'DECREASE_PERCENTAGE' ? (1000 - (1000 * updateConfig.value / 100)).toFixed(2) :
                updateConfig.updateType === 'INCREASE_AMOUNT' ? (1000 + parseFloat(updateConfig.value)).toFixed(2) :
                (1000 - parseFloat(updateConfig.value)).toFixed(2)
              ) : '1,000.00'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sample Product</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Rs 5,000.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-600">Rs 5,000.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleUpdatePrices}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 font-semibold"
          >
            <DollarSign className="w-4 h-4" />
            <span>Update Prices</span>
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors font-semibold">
            Preview Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrice;
