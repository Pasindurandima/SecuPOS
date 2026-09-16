import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Trash2, Package, User, Calendar, Clock, DollarSign, Search } from 'lucide-react';
import { quotationService, productService, customerService } from '../../services/apiService';

const AddQuotation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quotationId = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [quotationData, setQuotationData] = useState({
    customer: '',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    referenceNo: '',
    terms: '',
    notes: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    shippingCharge: 0
  });

  const [quotationItems, setQuotationItems] = useState([]);

  // Fetch products and customers on mount
  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  // Load existing quotation if editing
  useEffect(() => {
    if (quotationId && customers.length > 0) {
      loadQuotation(quotationId);
    }
  }, [quotationId, customers]);

  const loadQuotation = async (id) => {
    try {
      setLoading(true);
      const response = await quotationService.getById(id);
      if (response.data && response.data.success) {
        const quotation = response.data.data;
        
        // Parse notes to extract expiry, terms, and actual notes
        const parseNotes = (notes) => {
          if (!notes || !notes.includes('[QUOTATION]')) {
            return { expiryDate: '', terms: '', actualNotes: notes || '' };
          }
          
          const markerIndex = notes.indexOf('[QUOTATION]');
          const content = notes.substring(markerIndex + 11).trim();
          
          const expiryMatch = content.match(/Expiry:\s*([^\|]+)/);
          const termsMatch = content.match(/Terms:\s*([^\|]+)/);
          
          let actualNotes = content;
          if (expiryMatch || termsMatch) {
            const lastIndex = Math.max(
              termsMatch ? content.indexOf(termsMatch[0]) + termsMatch[0].length : 0,
              expiryMatch ? content.indexOf(expiryMatch[0]) + expiryMatch[0].length : 0
            );
            actualNotes = content.substring(lastIndex).replace(/^\s*\|\s*/, '').trim();
          }
          
          return {
            expiryDate: expiryMatch ? expiryMatch[1].trim() : '',
            terms: termsMatch ? termsMatch[1].trim() : '',
            actualNotes
          };
        };

        const parsedNotes = parseNotes(quotation.notes);

        // Set quotation data
        setQuotationData({
          customer: quotation.customerId.toString(),
          quotationDate: quotation.saleDate,
          expiryDate: parsedNotes.expiryDate,
          referenceNo: '',
          terms: parsedNotes.terms,
          notes: parsedNotes.actualNotes,
          discountType: 'PERCENTAGE',
          discountValue: 0,
          shippingCharge: 0
        });

        // Set quotation items
        if (quotation.items && quotation.items.length > 0) {
          setQuotationItems(quotation.items.map(item => ({
            id: Date.now() + Math.random(),
            product: item.productId.toString(),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tax: item.taxRate || 0,
            discount: 0
          })));
        }

        // Set selected customer
        const customer = customers.find(c => c.id === quotation.customerId);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }
    } catch (err) {
      console.error('Error loading quotation:', err);
      alert('Failed to load quotation details.');
    } finally {
      setLoading(false);
    }
  };

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
    setQuotationData({...quotationData, customer: customerId});
    
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
    setQuotationItems([...quotationItems, {
      id: Date.now(),
      product: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0
    }]);
  };

  const removeProduct = (id) => {
    setQuotationItems(quotationItems.filter(item => item.id !== id));
  };

  const updateProduct = (id, field, value) => {
    setQuotationItems(quotationItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: field === 'product' ? value : (parseFloat(value) || 0) };
        
        // If product is selected, auto-fill unit price
        if (field === 'product' && value) {
          const selectedProduct = products.find(p => p.id === parseInt(value));
          if (selectedProduct) {
            updated.unitPrice = selectedProduct.sellingPrice || 0;
            updated.tax = selectedProduct.taxRate || 0;
            updated.description = selectedProduct.description || '';
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
    return quotationItems.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.unitPrice) - item.discount;
      return sum + itemTotal;
    }, 0);
  };

  const calculateTax = () => {
    return quotationItems.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.unitPrice) - item.discount;
      return sum + (itemTotal * item.tax / 100);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (quotationData.discountType === 'PERCENTAGE') {
      return subtotal * (quotationData.discountValue / 100);
    }
    return quotationData.discountValue;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount() + parseFloat(quotationData.shippingCharge || 0);
  };

  const handleSaveQuotation = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!quotationData.customer) {
        alert('Please select a customer');
        setLoading(false);
        return;
      }

      if (!quotationData.expiryDate) {
        alert('Please select expiry date');
        setLoading(false);
        return;
      }

      if (quotationItems.length === 0) {
        alert('Please add at least one item');
        setLoading(false);
        return;
      }

      // Validate all items have products selected
      const invalidItems = quotationItems.filter(item => !item.product);
      if (invalidItems.length > 0) {
        alert('Please select a product for all items');
        setLoading(false);
        return;
      }

      // Calculate total amount
      const totalAmount = quotationItems.reduce((sum, item) => {
        const subtotal = item.quantity * item.unitPrice;
        const tax = subtotal * (item.tax / 100);
        return sum + subtotal + tax;
      }, 0);

      // Prepare quotation data matching backend QuotationRequest DTO
      const quotation = {
        customerId: parseInt(quotationData.customer),
        quotationDate: `${quotationData.quotationDate}T00:00:00`, // LocalDateTime format
        expiryDate: quotationData.expiryDate, // LocalDate format
        terms: quotationData.terms || '',
        notes: quotationData.notes || '',
        items: quotationItems.map(item => ({
          productId: parseInt(item.product),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          taxRate: parseFloat(item.tax)
        }))
      };

      console.log(quotationId ? 'Updating quotation:' : 'Creating quotation:', quotation);
      
      let response;
      if (quotationId) {
        // Update existing quotation
        response = await quotationService.update(quotationId, quotation);
        alert('Quotation updated successfully!');
      } else {
        // Create new quotation
        response = await quotationService.create(quotation);
        alert('Quotation created successfully!');
      }
      
      console.log('Quotation saved:', response);
      navigate('/sell/list-quotations');
    } catch (err) {
      console.error('Error saving quotation:', err);
      alert(`Failed to save quotation: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add Quotation</h1>
        <p className="text-gray-600 mt-2">Create a new sales quotation</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Customer & Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              value={quotationData.customer}
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
              Quotation Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={quotationData.quotationDate}
              onChange={(e) => setQuotationData({...quotationData, quotationDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={quotationData.expiryDate}
              onChange={(e) => setQuotationData({...quotationData, expiryDate: e.target.value})}
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
              value={quotationData.referenceNo}
              onChange={(e) => setQuotationData({...quotationData, referenceNo: e.target.value})}
              placeholder="Enter reference"
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
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Items</h3>
            <button
              onClick={addProduct}
              type="button"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax (%)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotationItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No items added yet</p>
                      <p className="text-sm">Click "Add Item" to start</p>
                    </td>
                  </tr>
                ) : (
                  quotationItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <select
                          value={item.product}
                          onChange={(e) => updateProduct(item.id, 'product', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select</option>
                          {filteredProducts.length === 0 ? (
                            <option disabled>No products found</option>
                          ) : (
                            filteredProducts.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {product.sku}
                              </option>
                            ))
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateProduct(item.id, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
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

        {/* Terms, Notes & Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Terms & Conditions
              </label>
              <textarea
                value={quotationData.terms}
                onChange={(e) => setQuotationData({...quotationData, terms: e.target.value})}
                rows="4"
                placeholder="Enter terms and conditions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={quotationData.notes}
                onChange={(e) => setQuotationData({...quotationData, notes: e.target.value})}
                rows="3"
                placeholder="Add any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select
                  value={quotationData.discountType}
                  onChange={(e) => setQuotationData({...quotationData, discountType: e.target.value})}
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
                  value={quotationData.discountValue}
                  onChange={(e) => setQuotationData({...quotationData, discountValue: parseFloat(e.target.value) || 0})}
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
                value={quotationData.shippingCharge}
                onChange={(e) => setQuotationData({...quotationData, shippingCharge: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="0.01"
              />
            </div>

            {/* Totals */}
            <div className="bg-teal-50 p-4 rounded-lg space-y-2">
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
                <span className="font-medium">Rs {parseFloat(quotationData.shippingCharge || 0).toFixed(2)}</span>
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
            onClick={() => navigate('/sell/list-quotations')}
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveQuotation}
            type="button"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:bg-gray-400"
          >
            <FileText className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Quotation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuotation;
