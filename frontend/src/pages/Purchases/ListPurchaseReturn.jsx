import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Truck, FileText, Calendar, AlertCircle, Plus, Trash2, Package, Search, Edit } from 'lucide-react';
import { productService, purchaseReturnService, purchaseService } from '../../services/apiService';

const ListPurchaseReturn = () => {
  console.log('ListPurchaseReturn component loaded');
  
  const [showAddReturnModal, setShowAddReturnModal] = useState(false);
  const [showEditReturnModal, setShowEditReturnModal] = useState(false);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingReturn, setEditingReturn] = useState(null);
  
  const [formData, setFormData] = useState({
    purchaseInvoice: '',
    supplier: '',
    returnDate: new Date().toISOString().split('T')[0],
    returnNo: '',
    returnReason: '',
    refundType: 'CASH',
    notes: ''
  });

  const [returnItems, setReturnItems] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');

  // Fetch purchase returns on component mount
  useEffect(() => {
    console.log('useEffect running - fetching purchase returns');
    fetchPurchaseReturns();
    fetchPurchases();
    fetchProducts();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await purchaseService.getAll();
      setPurchases(response || []);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError(`Failed to load purchases: ${err.message}`);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await productService.getAll();
      console.log('Products response:', response);
      setProducts(response || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      // Don't show error to user, just log it
    }
  };

  const fetchPurchaseReturns = async () => {
    try {
      setLoading(true);
      const response = await purchaseReturnService.getAll();
      setPurchaseReturns(response || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching purchase returns:', err);
      setError(`Failed to load purchase returns: ${err.message}`);
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

  const handlePurchaseInvoiceChange = (e) => {
    const purchase = purchases.find(item => item.purchaseNumber === e.target.value);

    setFormData(prev => ({
      ...prev,
      purchaseInvoice: purchase?.purchaseNumber || '',
      supplier: purchase?.supplier?.name || ''
    }));
  };

  const addProduct = () => {
    const newItem = {
      id: Date.now(),
      product: '',
      purchasedQty: 0,
      returnQty: 1,
      unitCost: 0,
      subtotal: 0
    };
    setReturnItems([...returnItems, newItem]);
  };

  const removeProduct = (id) => {
    setReturnItems(returnItems.filter(item => item.id !== id));
  };

  const updateProduct = (id, field, value) => {
    setReturnItems(returnItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: field === 'product' ? value : (parseFloat(value) || 0) };
        
        // If product is selected, auto-fill unit cost from product data
        if (field === 'product' && value) {
          const selectedProduct = products.find(p => p.id === parseInt(value));
          if (selectedProduct) {
            updated.unitCost = selectedProduct.purchasePrice || selectedProduct.sellingPrice || 0;
            updated.purchasedQty = selectedProduct.quantity || 0;
          }
        }
        
        updated.subtotal = updated.returnQty * updated.unitCost;
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return returnItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Filter products based on search
  const filteredProducts = searchProduct.trim() === '' 
    ? products 
    : products.filter(product => 
        product.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchProduct.toLowerCase())
      );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const total = calculateTotal();
      const returnData = {
        purchaseInvoice: formData.purchaseInvoice,
        supplier: formData.supplier,
        returnDate: new Date(formData.returnDate).toISOString(),
        returnNo: formData.returnNo || null,
        returnReason: formData.returnReason,
        refundType: formData.refundType,
        notes: formData.notes,
        total,
        items: returnItems.map(item => ({
          productId: parseInt(item.product, 10),
          purchasedQty: parseInt(item.purchasedQty, 10) || 0,
          returnQty: parseInt(item.returnQty, 10) || 0,
          unitCost: parseFloat(item.unitCost) || 0,
          subtotal: parseFloat(item.subtotal) || 0
        }))
      };

      if (!returnData.supplier) {
        alert('Please select a purchase invoice with a supplier.');
        return;
      }

      if (returnData.items.some(item => !Number.isInteger(item.productId) || item.returnQty < 1 || item.unitCost <= 0)) {
        alert('Please select a product and enter a valid return quantity and unit cost.');
        return;
      }

      console.log('Saving purchase return:', returnData);

      if (editingReturn) {
        await purchaseReturnService.update(editingReturn.id, returnData);
      } else {
        await purchaseReturnService.create(returnData);
      }

      // Reset form and close modal
      if (editingReturn) {
        setShowEditReturnModal(false);
        setEditingReturn(null);
      } else {
        setShowAddReturnModal(false);
      }
      
      setFormData({
        purchaseInvoice: '',
        supplier: '',
        returnDate: new Date().toISOString().split('T')[0],
        returnNo: '',
        returnReason: '',
        refundType: 'CASH',
        notes: ''
      });
      setReturnItems([]);
      fetchPurchaseReturns();
    } catch (err) {
      console.error('Error saving purchase return:', err);
      const validationErrors = err.response?.data?.errors;
      const details = validationErrors && typeof validationErrors === 'object'
        ? Object.values(validationErrors).join(' ')
        : err.response?.data?.message || err.message;
      alert(`Failed to save purchase return: ${details}`);
    }
  };

  const handleEdit = (purchaseReturn) => {
    console.log('Editing purchase return:', purchaseReturn);
    setEditingReturn(purchaseReturn);
    setFormData({
      purchaseInvoice: purchaseReturn.purchaseInvoice || '',
      supplier: purchaseReturn.supplier || '',
      returnDate: purchaseReturn.returnDate || new Date().toISOString().split('T')[0],
      returnNo: purchaseReturn.returnNo || '',
      returnReason: purchaseReturn.returnReason || '',
      refundType: purchaseReturn.refundType || 'CASH',
      notes: purchaseReturn.notes || ''
    });
    setReturnItems((purchaseReturn.items || []).map(item => ({
      id: item.id || Date.now(),
      product: item.product?.id || item.productId || '',
      purchasedQty: item.purchasedQty || 0,
      returnQty: item.returnQty || 1,
      unitCost: item.unitCost || 0,
      subtotal: item.subtotal || 0
    })));
    setShowEditReturnModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase return?')) {
      try {
        console.log('Deleting purchase return:', id);
        
        await purchaseReturnService.delete(id);
        fetchPurchaseReturns();
      } catch (err) {
        console.error('Error deleting purchase return:', err);
        alert('Failed to delete purchase return. Please try again.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Return List</h1>
        <p className="text-gray-600 mt-2">View all purchase returns</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search returns..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button 
            onClick={() => setShowAddReturnModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Add Purchase Return</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {loading && (
            <div className="text-center py-8 text-gray-600">Loading purchase returns...</div>
          )}
          
          {error && (
            <div className="text-center py-8 text-red-600">{error}</div>
          )}

          {!loading && !error && purchaseReturns.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No purchase returns found. Click "Add Purchase Return" to create one.
            </div>
          )}

          {!loading && !error && purchaseReturns.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseReturns.map((purchaseReturn) => (
                  <tr key={purchaseReturn.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(purchaseReturn.returnDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {purchaseReturn.returnNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {purchaseReturn.purchaseInvoice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {purchaseReturn.supplier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      Rs {purchaseReturn.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchaseReturn.refundType === 'CASH' ? 'bg-green-100 text-green-800' :
                        purchaseReturn.refundType === 'BANK_TRANSFER' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {purchaseReturn.refundType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(purchaseReturn)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="w-4 h-4 inline" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(purchaseReturn.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Purchase Return Modal */}
      {(showAddReturnModal || showEditReturnModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-red-600 to-red-700">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">
                  {editingReturn ? 'Edit Purchase Return' : 'Add Purchase Return'}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (editingReturn) {
                    setShowEditReturnModal(false);
                    setEditingReturn(null);
                  } else {
                    setShowAddReturnModal(false);
                  }
                  setFormData({
                    purchaseInvoice: '',
                    supplier: '',
                    returnDate: new Date().toISOString().split('T')[0],
                    returnNo: '',
                    returnReason: '',
                    refundType: 'CASH',
                    notes: ''
                  });
                  setReturnItems([]);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                {/* Return Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Return Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Purchase Invoice */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Purchase Invoice <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <select
                          name="purchaseInvoice"
                          value={formData.purchaseInvoice}
                          onChange={handlePurchaseInvoiceChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        >
                          <option value="">Select Purchase Invoice</option>
                          {purchases.map((purchase) => (
                            <option key={purchase.id} value={purchase.purchaseNumber}>
                              {purchase.purchaseNumber} - {purchase.supplier?.name || 'Unknown Supplier'}
                            </option>
                          ))}
                        </select>
                        {purchases.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            No saved purchases available.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Supplier (Auto-filled) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Supplier
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="supplier"
                          value={formData.supplier}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          placeholder="Auto-filled from invoice"
                          disabled
                        />
                      </div>
                    </div>

                    {/* Return Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="returnDate"
                          value={formData.returnDate}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Return No */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return No
                      </label>
                      <input
                        type="text"
                        name="returnNo"
                        value={formData.returnNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Auto-generated"
                      />
                    </div>

                    {/* Return Reason */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return Reason <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <AlertCircle className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <select
                          name="returnReason"
                          value={formData.returnReason}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        >
                          <option value="">Select Reason</option>
                          <option value="DAMAGED">Damaged Products</option>
                          <option value="DEFECTIVE">Defective Items</option>
                          <option value="WRONG_ITEM">Wrong Item Received</option>
                          <option value="QUALITY_ISSUE">Quality Issue</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Refund Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Refund Type
                      </label>
                      <select
                        name="refundType"
                        value={formData.refundType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="CASH">Cash Refund</option>
                        <option value="CREDIT">Credit Note</option>
                        <option value="EXCHANGE">Exchange</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Return Items Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-gray-700 uppercase">Return Items</h4>
                    <button
                      type="button"
                      onClick={addProduct}
                      className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 font-semibold"
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
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Search purchased products..."
                      />
                    </div>
                    {products.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Loading products...</p>
                    )}
                  </div>

                  {/* Return Items Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchased Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost (Rs)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal (Rs)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {returnItems.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                <p>No items added yet. Click "Add Item" to start.</p>
                              </td>
                            </tr>
                          ) : (
                            returnItems.map((item) => (
                              <tr key={item.id}>
                                <td className="px-4 py-3">
                                  <select
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={item.product}
                                    onChange={(e) => updateProduct(item.id, 'product', e.target.value)}
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
                                    value={item.purchasedQty}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                                    disabled
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.returnQty}
                                    onChange={(e) => updateProduct(item.id, 'returnQty', e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitCost}
                                    onChange={(e) => updateProduct(item.id, 'unitCost', e.target.value)}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-red-600">
                                  {item.subtotal.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
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
                </div>

                {/* Notes and Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Add any notes about this return..."
                      rows="4"
                    />
                  </div>

                  {/* Total Summary */}
                  <div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Return Summary</h4>
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-900 font-bold">Total Return Amount:</span>
                        <span className="font-bold text-red-600">Rs {calculateTotal().toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        This amount will be {formData.refundType === 'CASH' ? 'refunded' : formData.refundType === 'CREDIT' ? 'credited' : 'exchanged'}
                      </p>
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
                  onClick={() => setShowAddReturnModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Process Return</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPurchaseReturn;
