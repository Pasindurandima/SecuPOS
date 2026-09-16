import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, Package, Search, User, Calendar, FileText, DollarSign } from 'lucide-react';
import { draftService, productService, customerService } from '../../services/apiService';

const AddDraft = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const [draftData, setDraftData] = useState({
    customer: '',
    draftDate: new Date().toISOString().split('T')[0],
    referenceNo: '',
    notes: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    shippingCharge: 0
  });

  const [draftItems, setDraftItems] = useState([]);

  // Fetch products and customers on mount
  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      console.log('Products loaded:', response);
      setProducts(response || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      console.log('Customers loaded:', response);
      setCustomers(response || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleCustomerChange = (customerId) => {
    setDraftData({...draftData, customer: customerId});
    
    // Find and set selected customer details
    if (customerId) {
      const customer = customers.find(c => c.id === parseInt(customerId));
      setSelectedCustomer(customer || null);
      console.log('Selected customer:', customer);
    } else {
      setSelectedCustomer(null);
    }
  };

  const addProduct = () => {
    setDraftItems([...draftItems, {
      id: Date.now(),
      product: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0
    }]);
  };

  const removeProduct = (id) => {
    setDraftItems(draftItems.filter(item => item.id !== id));
  };

  const updateProduct = (id, field, value) => {
    setDraftItems(draftItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: field === 'product' ? value : (parseFloat(value) || 0) };
        
        // If product is selected, auto-fill unit price
        if (field === 'product' && value) {
          const selectedProduct = products.find(p => p.id === parseInt(value));
          if (selectedProduct) {
            updated.unitPrice = selectedProduct.sellingPrice || 0;
            updated.tax = selectedProduct.taxRate || 0;
          }
        }
        
        return updated;
      }
      return item;
    }));
  };

  // Filter products based on search
  const filteredProducts = searchProduct.trim() === '' 
    ? products 
    : products.filter(product => 
        product.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchProduct.toLowerCase())
      );

  const calculateSubtotal = () => {
    return draftItems.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.unitPrice) - item.discount;
      return sum + itemTotal;
    }, 0);
  };

  const calculateTax = () => {
    return draftItems.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.unitPrice) - item.discount;
      return sum + (itemTotal * item.tax / 100);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (draftData.discountType === 'PERCENTAGE') {
      return subtotal * (draftData.discountValue / 100);
    }
    return draftData.discountValue;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount() + parseFloat(draftData.shippingCharge || 0);
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!draftData.customer) {
        alert('Please select a customer');
        setLoading(false);
        return;
      }

      if (draftItems.length === 0) {
        alert('Please add at least one product');
        setLoading(false);
        return;
      }

      // Validate all items have products selected
      const invalidItems = draftItems.filter(item => !item.product);
      if (invalidItems.length > 0) {
        alert('Please select a product for all items');
        setLoading(false);
        return;
      }

      // Prepare draft data matching backend SaleRequest DTO
      const draft = {
        customerId: parseInt(draftData.customer),
        saleDate: new Date(draftData.draftDate).toISOString(),
        items: draftItems.map(item => ({
          productId: parseInt(item.product),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        })),
        paymentMethod: 'CASH', // Default for drafts
        paidAmount: 0, // Drafts have no payment yet
        notes: draftData.notes || null
      };

      console.log('Saving draft:', draft);
      const response = await draftService.create(draft);
      console.log('Draft saved:', response);
      
      alert('Draft saved successfully!');
      navigate('/sell/list-draft');
    } catch (err) {
      console.error('Error saving draft:', err);
      alert(`Failed to save draft: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add Draft</h1>
        <p className="text-gray-600 mt-2">Create a new sales draft</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Customer & Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={draftData.customer}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select Customer</option>
              {customers.length === 0 ? (
                <option disabled>Loading customers...</option>
              ) : (
                customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || `${customer.firstName} ${customer.lastName}`} - {customer.phone}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Draft Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={draftData.draftDate}
              onChange={(e) => setDraftData({...draftData, draftDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Reference No
            </label>
            <input
              type="text"
              value={draftData.referenceNo}
              onChange={(e) => setDraftData({...draftData, referenceNo: e.target.value})}
              placeholder="Enter reference number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Customer Details Display */}
        {selectedCustomer && (
          <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase flex items-center">
              <User className="w-4 h-4 mr-2" />
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Customer Name</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedCustomer.name || `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedCustomer.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Email</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedCustomer.email || 'N/A'}
                </p>
              </div>
              {selectedCustomer.customerGroup && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Customer Group</p>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedCustomer.customerGroup === 'VIP' ? 'bg-purple-100 text-purple-800' :
                    selectedCustomer.customerGroup === 'WHOLESALE' ? 'bg-blue-100 text-blue-800' :
                    selectedCustomer.customerGroup === 'RETAIL' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedCustomer.customerGroup}
                  </span>
                </div>
              )}
              {selectedCustomer.address && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-600 mb-1">Address</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedCustomer.address}
                    {selectedCustomer.city && `, ${selectedCustomer.city}`}
                    {selectedCustomer.state && `, ${selectedCustomer.state}`}
                    {selectedCustomer.zipCode && ` - ${selectedCustomer.zipCode}`}
                  </p>
                </div>
              )}
              {selectedCustomer.creditLimit && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Credit Limit</p>
                  <p className="text-sm font-semibold text-teal-600">
                    Rs {parseFloat(selectedCustomer.creditLimit).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Products</h3>
            <button
              onClick={addProduct}
              type="button"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Product Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Search products by name or SKU..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax (%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {draftItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No products added yet</p>
                      <p className="text-sm">Click "Add Product" to start</p>
                    </td>
                  </tr>
                ) : (
                  draftItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <select
                          value={item.product}
                          onChange={(e) => updateProduct(item.id, 'product', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select Product</option>
                          {filteredProducts.length === 0 ? (
                            <option disabled>No products found</option>
                          ) : (
                            filteredProducts.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {product.sku} (Stock: {product.quantity || 0})
                              </option>
                            ))
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateProduct(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateProduct(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateProduct(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.tax}
                          onChange={(e) => updateProduct(item.id, 'tax', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        Rs {((item.quantity * item.unitPrice) - item.discount + ((item.quantity * item.unitPrice - item.discount) * item.tax / 100)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeProduct(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Charges & Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={draftData.notes}
              onChange={(e) => setDraftData({...draftData, notes: e.target.value})}
              rows="4"
              placeholder="Add any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select
                  value={draftData.discountType}
                  onChange={(e) => setDraftData({...draftData, discountType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                <input
                  type="number"
                  value={draftData.discountValue}
                  onChange={(e) => setDraftData({...draftData, discountValue: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Charge</label>
              <input
                type="number"
                value={draftData.shippingCharge}
                onChange={(e) => setDraftData({...draftData, shippingCharge: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.01"
              />
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Rs {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">Rs {calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">- Rs {calculateDiscount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">Rs {parseFloat(draftData.shippingCharge || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-teal-600">Rs {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => navigate('/sell/list-draft')}
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            type="button"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:bg-gray-400"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Draft'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDraft;
