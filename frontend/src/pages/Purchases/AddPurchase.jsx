import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Calendar, MapPin, FileText, Package, Plus, Trash2, Upload, DollarSign, CreditCard } from 'lucide-react';
import { supplierService, purchaseService, productService } from '../../services/apiService';
import BusinessLocationSelect from '../../components/BusinessLocationSelect';

const AddPurchase = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplier: '',
    address: '',
    referenceNo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseStatus: 'RECEIVED',
    businessLocation: '',
    payTerm: '30',
    attachedDocument: null,
    additionalNotes: '',
    shippingCharges: '0.00',
    discountType: 'fixed',
    discountAmount: '0.00',
    purchaseTax: '0.00',
    // Payment fields
    showPayment: false,
    paymentAmount: '0.00',
    paidOn: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    paymentAccount: '',
    paymentNote: ''
  });

  const [purchaseItems, setPurchaseItems] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');

  // Fetch suppliers and products on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      alert('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Update address when supplier changes
  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setFormData(prev => ({ ...prev, supplier: supplierId }));
    
    if (supplierId) {
      const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));
      if (selectedSupplier) {
        const address = `${selectedSupplier.address || ''}, ${selectedSupplier.city || ''}, ${selectedSupplier.state || ''} ${selectedSupplier.zipCode || ''}`.trim();
        setFormData(prev => ({ ...prev, address: address }));
      }
    } else {
      setFormData(prev => ({ ...prev, address: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['application/pdf', 'text/csv', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
      
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert('Only .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png files are allowed');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        attachedDocument: file
      }));
    }
  };

  const addProduct = () => {
    const newItem = {
      id: Date.now(),
      productId: '',
      productName: '',
      purchaseQuantity: 1,
      unitCostBeforeDiscount: 0,
      discountPercent: 0,
      unitCostBeforeTax: 0,
      lineTotal: 0,
      profitMargin: 0,
      unitSellingPrice: 0
    };
    setPurchaseItems([...purchaseItems, newItem]);
  };

  const removeProduct = (id) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
  };

  const updateProduct = (id, field, value) => {
    setPurchaseItems(purchaseItems.map(item => {
      if (item.id === id) {
        const updated = { ...item };
        
        // Handle product selection
        if (field === 'productId') {
          const selectedProduct = products.find(p => p.id === parseInt(value));
          if (selectedProduct) {
            updated.productId = selectedProduct.id;
            updated.productName = selectedProduct.name;
            updated.unitCostBeforeDiscount = selectedProduct.costPrice || 0;
            updated.unitSellingPrice = selectedProduct.sellingPrice || 0;
          } else {
            updated[field] = value;
          }
        } else {
          updated[field] = field === 'productName' ? value : (parseFloat(value) || 0);
        }
        
        // Calculate unit cost before tax after discount
        const discountAmount = updated.unitCostBeforeDiscount * (updated.discountPercent / 100);
        updated.unitCostBeforeTax = updated.unitCostBeforeDiscount - discountAmount;
        
        // Calculate line total
        updated.lineTotal = updated.unitCostBeforeTax * updated.purchaseQuantity;
        
        // Calculate selling price with profit margin
        if (updated.profitMargin > 0) {
          updated.unitSellingPrice = updated.unitCostBeforeTax * (1 + updated.profitMargin / 100);
        }
        
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const totalItems = purchaseItems.reduce((sum, item) => sum + item.purchaseQuantity, 0);
    const netTotal = purchaseItems.reduce((sum, item) => sum + item.lineTotal, 0);
    
    let discountValue = 0;
    if (formData.discountType === 'fixed') {
      discountValue = parseFloat(formData.discountAmount) || 0;
    } else {
      discountValue = netTotal * (parseFloat(formData.discountAmount) / 100);
    }
    
    const afterDiscount = netTotal - discountValue;
    const taxAmount = afterDiscount * (parseFloat(formData.purchaseTax) / 100);
    const shippingCharges = parseFloat(formData.shippingCharges) || 0;
    const purchaseTotal = afterDiscount + taxAmount + shippingCharges;
    
    return {
      totalItems,
      netTotal,
      discountValue,
      taxAmount,
      shippingCharges,
      purchaseTotal
    };
  };

  const totals = calculateTotals();
  const paymentDue = totals.purchaseTotal - (parseFloat(formData.paymentAmount) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (purchaseItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    if (!formData.supplier) {
      alert('Please select a supplier');
      return;
    }

    try {
      setSubmitLoading(true);

      // Prepare purchase data
      const purchaseData = {
        supplierId: parseInt(formData.supplier),
        supplierAddress: formData.address,
        referenceNo: formData.referenceNo,
        purchaseDate: new Date(formData.purchaseDate).toISOString(),
        purchaseStatus: formData.purchaseStatus,
        businessLocation: formData.businessLocation,
        payTerm: parseInt(formData.payTerm),
        attachedDocumentPath: formData.attachedDocument ? formData.attachedDocument.name : null,
        items: purchaseItems.map(item => ({
          productId: item.productId,
          quantity: item.purchaseQuantity,
          unitCostBeforeDiscount: parseFloat(item.unitCostBeforeDiscount),
          discountPercent: parseFloat(item.discountPercent),
          unitCostBeforeTax: parseFloat(item.unitCostBeforeTax),
          lineTotal: parseFloat(item.lineTotal),
          profitMarginPercent: parseFloat(item.profitMargin),
          unitSellingPrice: parseFloat(item.unitSellingPrice),
          unitCost: parseFloat(item.unitCostBeforeTax)
        })),
        subtotal: parseFloat(totals.netTotal),
        discountAmount: parseFloat(totals.discountValue),
        discountType: formData.discountType.toUpperCase(),
        tax: parseFloat(totals.taxAmount),
        taxPercent: parseFloat(formData.purchaseTax),
        shippingCharges: parseFloat(formData.shippingCharges),
        total: parseFloat(totals.purchaseTotal),
        additionalNotes: formData.additionalNotes,
        paidAmount: parseFloat(formData.paymentAmount) || 0,
        paidOn: formData.showPayment && formData.paymentAmount > 0 ? new Date(formData.paidOn).toISOString() : null,
        paymentMethod: formData.showPayment && formData.paymentMethod ? formData.paymentMethod.toUpperCase() : null,
        paymentAccount: formData.paymentAccount || null,
        paymentNote: formData.paymentNote || null,
        paymentDue: parseFloat(paymentDue)
      };

      console.log('Submitting purchase data:', purchaseData);

      const response = await purchaseService.create(purchaseData);
      
      alert('Purchase order created successfully!');
      navigate('/purchases/list');
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Failed to create purchase order: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add Purchase</h1>
        <p className="text-gray-600 mt-2">Create a new purchase order</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Purchase Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Supplier */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Supplier <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleSupplierChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Reference No */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Reference No</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="referenceNo"
                  value={formData.referenceNo}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter reference no"
                />
              </div>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Purchase Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Purchase Status <span className="text-red-500">*</span>
              </label>
              <select
                name="purchaseStatus"
                value={formData.purchaseStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="RECEIVED">Received</option>
                <option value="PENDING">Pending</option>
                <option value="ORDERED">Ordered</option>
              </select>
            </div>

            {/* Business Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Location <span className="text-red-500">*</span>
              </label>
              <BusinessLocationSelect
                name="businessLocation"
                value={formData.businessLocation}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Pay Term */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pay Term</label>
              <select
                name="payTerm"
                value={formData.payTerm}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">Due on Receipt</option>
                <option value="7">Net 7 Days</option>
                <option value="15">Net 15 Days</option>
                <option value="30">Net 30 Days</option>
                <option value="45">Net 45 Days</option>
                <option value="60">Net 60 Days</option>
              </select>
            </div>

            {/* Attach Document */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Document</label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Max File size: 5MB | Allowed: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png</p>
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Product Items</h3>
            <button
              type="button"
              onClick={addProduct}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost (Before Discount)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount Percent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost (Before Tax)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit Margin %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Selling Price (Inc. tax)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseItems.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      No products added yet. Click "Add Product" to start.
                    </td>
                  </tr>
                ) : (
                  purchaseItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <select
                          value={item.productId}
                          onChange={(e) => updateProduct(item.id, 'productId', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="">Select product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.purchaseQuantity}
                          onChange={(e) => updateProduct(item.id, 'purchaseQuantity', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                          min="1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitCostBeforeDiscount}
                          onChange={(e) => updateProduct(item.id, 'unitCostBeforeDiscount', e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.discountPercent}
                          onChange={(e) => updateProduct(item.id, 'discountPercent', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                          step="0.01"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.unitCostBeforeTax.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {item.lineTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.profitMargin}
                          onChange={(e) => updateProduct(item.id, 'profitMargin', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.unitSellingPrice.toFixed(2)}
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

        {/* Additional Notes and Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Notes and Shipping */}
          <div className="space-y-6">
            {/* Additional Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h3>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Shipping Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Details</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  (+) Additional Shipping Charges
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    name="shippingCharges"
                    value={formData.shippingCharges}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Totals and Payment */}
          <div className="space-y-6">
            {/* Purchase Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">{totals.totalItems.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Net Total Amount:</span>
                  <span className="font-semibold">₨ {totals.netTotal.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type</label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Amount</label>
                      <input
                        type="number"
                        name="discountAmount"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount (-):</span>
                    <span className="font-semibold">{totals.discountValue.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Tax (%)</label>
                    <input
                      type="number"
                      name="purchaseTax"
                      value={formData.purchaseTax}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Purchase Tax (+):</span>
                    <span className="font-semibold">{totals.taxAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-blue-600">
                  <span>Shipping Charges (+):</span>
                  <span className="font-semibold">{totals.shippingCharges.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3 flex justify-between text-lg font-bold text-teal-600">
                  <span>Purchase Total:</span>
                  <span>₨ {totals.purchaseTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Add Payment Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add Payment</h3>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, showPayment: !prev.showPayment }))}
                  className="text-teal-600 hover:text-teal-700 text-sm font-semibold"
                >
                  {formData.showPayment ? 'Hide' : 'Show'} Payment Form
                </button>
              </div>

              {formData.showPayment && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Advance Balance:</span>
                      <span className="font-semibold">0.00</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="paymentAmount"
                      value={formData.paymentAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Paid on <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="paidOn"
                      value={formData.paidOn}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select Method</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Account</label>
                    <select
                      name="paymentAccount"
                      value={formData.paymentAccount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select Account</option>
                      <option value="account1">Main Account</option>
                      <option value="account2">Secondary Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Note</label>
                    <textarea
                      name="paymentNote"
                      value={formData.paymentNote}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Add payment note..."
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-semibold">Payment Due:</span>
                      <span className="font-bold text-red-600">{paymentDue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/purchases/list')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors font-semibold"
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className={`px-6 py-2 rounded-lg transition-colors font-semibold flex items-center space-x-2 ${
                submitLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-700'
              } text-white`}
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>Save Purchase</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          OnexlaERP - V5.31 | Copyright © 2025 All rights reserved.
        </div>
      </form>
    </div>
  );
};

export default AddPurchase;
