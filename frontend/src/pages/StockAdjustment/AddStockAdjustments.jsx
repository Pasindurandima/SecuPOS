import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Trash2, Check } from 'lucide-react';
import { productService } from '../../services/apiService';
import { stockAdjustmentService } from '../../services/apiService';
import { formatCurrency } from '../../context/BusinessSettingsContext';
import BusinessLocationSelect from '../../components/BusinessLocationSelect';

const AddStockAdjustments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editAdjustment = location.state?.editAdjustment;

  const [formData, setFormData] = useState({
    adjustmentDate: new Date().toISOString().split('T')[0],
    location: '',
    adjustmentType: 'NORMAL',
    reason: 'DAMAGED_GOODS',
    notes: '',
  });

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [adjustmentItems, setAdjustmentItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    
    // Load edit data if editing
    if (editAdjustment) {
      setFormData({
        adjustmentDate: editAdjustment.adjustmentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        location: editAdjustment.location || '',
        adjustmentType: editAdjustment.adjustmentType || 'NORMAL',
        reason: editAdjustment.reason || 'DAMAGED_GOODS',
        notes: editAdjustment.notes || '',
      });

      // Load items
      if (editAdjustment.items && editAdjustment.items.length > 0) {
        const loadedItems = editAdjustment.items.map(item => ({
          product: item.product,
          productId: item.product.id,
          sku: item.product.sku,
          currentStock: item.currentStock,
          adjustmentType: item.adjustmentType,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: item.subtotal,
        }));
        setAdjustmentItems(loadedItems);
      }
    }
  }, [editAdjustment]);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from API...');
      const data = await productService.getAll();
      console.log('Products fetched successfully:', data.length, data);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please check your backend connection.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    console.log('Search term:', value);
    console.log('Total products:', products.length);
    
    if (value.trim()) {
      const filtered = products.filter(product => {
        const nameMatch = product.name && product.name.toLowerCase().includes(value.toLowerCase());
        const skuMatch = product.sku && product.sku.toLowerCase().includes(value.toLowerCase());
        return nameMatch || skuMatch;
      });
      console.log('Filtered products:', filtered.length, filtered);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  const addProductToAdjustment = (product) => {
    // Check if product already added
    if (adjustmentItems.some(item => item.productId === product.id)) {
      alert('Product already added');
      return;
    }

    const newItem = {
      product: product,
      productId: product.id,
      sku: product.sku,
      currentStock: product.quantity,
      adjustmentType: 'ADD',
      quantity: 1,
      unitCost: parseFloat(product.costPrice) || 0,
      subtotal: parseFloat(product.costPrice) || 0,
    };

    setAdjustmentItems([...adjustmentItems, newItem]);
    setSearchTerm('');
    setFilteredProducts([]);
  };

  const updateAdjustmentItem = (index, field, value) => {
    const updatedItems = [...adjustmentItems];
    updatedItems[index][field] = value;

    // Recalculate subtotal if quantity or unitCost changed
    if (field === 'quantity' || field === 'unitCost') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitCost = parseFloat(updatedItems[index].unitCost) || 0;
      updatedItems[index].subtotal = quantity * unitCost;
    }

    setAdjustmentItems(updatedItems);
  };

  const removeAdjustmentItem = (index) => {
    setAdjustmentItems(adjustmentItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalItems = adjustmentItems.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
    const totalAmount = adjustmentItems.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
    return { totalItems, totalAmount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.location) {
      alert('Please select a location');
      return;
    }

    if (adjustmentItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        adjustmentDate: new Date(formData.adjustmentDate).toISOString(),
        location: formData.location,
        adjustmentType: formData.adjustmentType,
        reason: formData.reason,
        items: adjustmentItems.map(item => ({
          productId: item.productId,
          adjustmentType: item.adjustmentType,
          quantity: parseInt(item.quantity),
          unitCost: parseFloat(item.unitCost),
        })),
        notes: formData.notes,
      };

      if (editAdjustment) {
        await stockAdjustmentService.update(editAdjustment.id, requestData);
      } else {
        await stockAdjustmentService.create(requestData);
      }

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/stock-adjustment/list');
      }, 2000);

    } catch (error) {
      console.error('Error saving stock adjustment:', error);
      alert(error.response?.data?.message || 'Failed to save stock adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/stock-adjustment/list');
  };

  const { totalItems, totalAmount } = calculateTotals();

  return (
    <div className="p-6">
      {editAdjustment && (
        <div className="mb-4">
          <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            Editing: {editAdjustment.referenceNumber}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {editAdjustment ? 'Edit' : 'Add'} Stock Adjustment
        </h1>
        <p className="text-gray-600 mt-2">Adjust stock quantities for inventory management</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference No *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="Auto generated"
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Date *</label>
              <input
                type="date"
                name="adjustmentDate"
                value={formData.adjustmentDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Location *</label>
              <BusinessLocationSelect
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Type *</label>
              <select 
                name="adjustmentType"
                value={formData.adjustmentType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="NORMAL">Normal</option>
                <option value="ABNORMAL">Abnormal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <select 
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="DAMAGED_GOODS">Damaged goods</option>
                <option value="STOCK_FOUND">Stock found</option>
                <option value="EXPIRED_PRODUCTS">Expired products</option>
                <option value="THEFT_LOSS">Theft/Loss</option>
                <option value="PHYSICAL_COUNT">Physical count adjustment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Products</label>
            <div className="border rounded-lg p-4">
              <div className="relative mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search and select products..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pl-10"
                    autoComplete="off"
                  />
                </div>
                
                {filteredProducts.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto left-0">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => addProductToAdjustment(product)}
                        className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">SKU:</span> {product.sku || 'N/A'} | 
                              <span className="font-medium"> Stock:</span> {product.quantity || 0}
                            </div>
                          </div>
                          <Plus className="h-5 w-5 text-teal-600 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchTerm && filteredProducts.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 left-0">
                    <p className="text-gray-500 text-center">No products found</p>
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Current Stock</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Adjustment Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Cost</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adjustmentItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                          No products added yet
                        </td>
                      </tr>
                    ) : (
                      adjustmentItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.product.name}</td>
                          <td className="px-4 py-2 text-sm">{item.sku}</td>
                          <td className="px-4 py-2 text-sm">{item.currentStock}</td>
                          <td className="px-4 py-2">
                            <select
                              value={item.adjustmentType}
                              onChange={(e) => updateAdjustmentItem(index, 'adjustmentType', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="ADD">Add</option>
                              <option value="SUBTRACT">Subtract</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateAdjustmentItem(index, 'quantity', e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) => updateAdjustmentItem(index, 'unitCost', e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              step="0.01"
                              min="0"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeAdjustmentItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-teal-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Add adjustment notes..."
            ></textarea>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Saving...' : editAdjustment ? 'Update Adjustment' : 'Save Adjustment'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600">
                Stock adjustment {editAdjustment ? 'updated' : 'created'} successfully
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStockAdjustments;
