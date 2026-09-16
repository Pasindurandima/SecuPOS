import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, Building2, Check, X, User, Calendar } from 'lucide-react';
import { productService, customerService, saleService } from '../../services/apiService';

const POS = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editSale = location.state?.editSale;
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  // Products fetched from backend
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Customers fetched from backend
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const result = await productService.getAll();
        // Normalize shape for POS UI
        const normalized = (result || []).map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: (p.sellingPrice !== undefined && p.sellingPrice !== null) ? p.sellingPrice : (p.price || 0),
          stock: p.quantity !== undefined && p.quantity !== null ? p.quantity : (p.stock || 0),
          image: p.imageUrl || p.image || '📦',
          taxRate: p.taxRate || 0,
        }));
        setProducts(normalized || []);
      } catch (error) {
        console.error('Error fetching products for POS:', error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    const fetchCustomers = async () => {
      try {
        setCustomersLoading(true);
        const result = await customerService.getAll();
        setCustomers(result || []);
      } catch (error) {
        console.error('Error fetching customers for POS:', error);
        setCustomers([]);
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchProducts();
    fetchCustomers();
  }, []);

  // Load edit sale data if present
  useEffect(() => {
    if (editSale && products.length > 0) {
      console.log('Loading sale for editing:', editSale);
      
      // Load customer
      if (editSale.customerId && customers.length > 0) {
        const customer = customers.find(c => c.id === editSale.customerId);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }

      // Load cart items from sale
      if (editSale.items && editSale.items.length > 0) {
        const cartItems = editSale.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            id: item.productId,
            name: item.productName || (product?.name) || 'Unknown Product',
            price: parseFloat(item.unitPrice) || 0,
            quantity: item.quantity || 1,
            sku: product?.sku || '',
            stock: product?.stock || 0,
            image: product?.image || '📦',
            taxRate: parseFloat(item.taxRate) || 0,
          };
        });
        setCart(cartItems);
      }

      // Load discount - convert from amount to percentage if needed
      if (editSale.discountPercent) {
        setDiscount(parseFloat(editSale.discountPercent) || 0);
      } else if (editSale.discount && editSale.subtotal) {
        const discountPercent = (parseFloat(editSale.discount) / parseFloat(editSale.subtotal)) * 100;
        setDiscount(discountPercent || 0);
      }

      // Load notes and payment info
      setNotes(editSale.sellNote || editSale.notes || '');
      setPaidAmount(editSale.paidAmount ? editSale.paidAmount.toString() : '');
      setPaymentMethod(editSale.paymentMethod || 'CASH');
    }
  }, [editSale, products, customers]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setNotes('');
    setPaidAmount('');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return cart.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity;
      return sum + (itemSubtotal * item.taxRate / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - discount;
  };

  const calculateChange = () => {
    const paid = parseFloat(paidAmount) || 0;
    return paid >= calculateTotal() ? paid - calculateTotal() : 0;
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert('Cart is empty! Please add items to proceed.');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    const total = calculateTotal();
    const paid = parseFloat(paidAmount) || 0;

    if (paymentMethod === 'CASH' && paid < total) {
      alert('Insufficient payment! Amount paid must be greater than or equal to total.');
      return;
    }

    try {
      // Prepare sale data for backend (matching API spec)
      const saleData = {
        customerId: selectedCustomer?.id || null,
        saleDate: new Date().toISOString(),
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          taxRate: item.taxRate || 0
        })),
        discount: (calculateSubtotal() * discount) / 100,
        paymentMethod: paymentMethod,
        paidAmount: paid,
        notes: notes || ''
      };

      console.log('Saving sale to backend:', saleData);
      
      // Save to backend
      let response;
      if (editSale) {
        // Update existing sale
        response = await saleService.update(editSale.id, saleData);
        console.log('Sale updated:', response);
      } else {
        // Create new sale
        response = await saleService.create(saleData);
        console.log('Sale created:', response);
      }
      
      // Prepare display data for success modal
      const displayData = {
        invoiceNumber: response.data?.invoiceNumber || `INV${Date.now()}`,
        totalAmount: total,
        paymentMethod: paymentMethod,
        paidAmount: paid,
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || 'Walk-In Customer'
      };
      
      // Store last invoice for success modal
      setLastInvoice(displayData);
      
      // Show success modal
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      
      // Reset form and navigate after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        resetSale();
        // If editing, navigate back to AllSales
        if (editSale) {
          navigate('/sell/all-sales');
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error saving sale:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to save sale: ${errorMsg}\n\nPlease check the console for details.`);
    }
  };

  const resetSale = () => {
    setCart([]);
    setDiscount(0);
    setNotes('');
    setPaidAmount('');
    setPaymentMethod('CASH');
    setSelectedCustomer(null);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paymentMethods = [
    { id: 'CASH', name: 'Cash', icon: Banknote, color: 'bg-green-500' },
    { id: 'CARD', name: 'Card', icon: CreditCard, color: 'bg-blue-500' },

  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between bg-white shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <span>POS - Point of Sale</span>
            {editSale && (
              <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
                Editing: {editSale.invoiceNumber || `INV-${editSale.id}`}
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            {editSale ? 'Edit and update the sale' : 'Add products and complete the sale'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">Time: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden min-h-0">
        {/* Product Search + Billing List - Left Side */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden min-h-0">
          <div className="mb-3 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {searchQuery.trim() && (
              <div className="mt-3 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                {filteredProducts.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    {filteredProducts.slice(0, 8).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          addToCart(product);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-white border-b border-gray-200 last:border-b-0"
                      >
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-teal-600">Rs {product.price.toFixed(2)}</div>
                          <div className="text-[11px] text-gray-500">Stock {product.stock}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-sm text-gray-500">No matching products found.</div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 border border-dashed border-gray-300 rounded-xl">
                <ShoppingCart className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">Billing list is empty</p>
                <p className="text-sm">Use the search bar to add products</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.sku}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500">Unit price</div>
                        <div className="text-sm font-semibold text-teal-600">Rs {item.price.toFixed(2)}</div>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="text-xs text-gray-500">Line total</div>
                        <div className="text-sm font-bold text-gray-800">Rs {(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart - Right Side */}
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h2 className="text-lg font-semibold">Current Sale</h2>
            <ShoppingCart className="w-5 h-5 text-teal-600" />
          </div>
          
          <div className="mb-4 flex-shrink-0">
            <button
              onClick={() => setShowCustomerModal(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-left flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className={selectedCustomer ? 'text-gray-800' : 'text-gray-500'}>
                  {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
                </span>
              </div>
              <span className="text-teal-600 text-sm">Change</span>
            </button>
            {selectedCustomer && (
              <div className="mt-2 text-xs text-gray-600 px-2">
                <p>📧 {selectedCustomer.email}</p>
                <p>📱 {selectedCustomer.phone}</p>
              </div>
            )}
          </div>

          {/* Compact cart summary */}
          <div className="flex-1 border-t border-b py-4 mb-4 overflow-y-auto min-h-0">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="w-16 h-16 mb-2" />
                <p className="text-center">Cart is empty</p>
                <p className="text-sm text-center">Click on products to add</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">Selected Products</div>
                  <div className="mt-2 text-lg font-bold text-gray-800">{cart.length} items</div>
                  <div className="mt-3 text-sm text-gray-600 leading-6">
                    {cart.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2 mb-4 flex-shrink-0">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">Rs {calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold">Rs {calculateTax().toFixed(2)}</span>
            </div>
            
            {/* Discount Input */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Discount:</span>
              <input
                type="number"
                min="0"
                max={calculateSubtotal() + calculateTax()}
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-teal-500"
                placeholder="0.00"
              />
            </div>
            
            <div className="flex justify-between text-lg pt-2 border-t font-bold">
              <span>Total:</span>
              <span className="text-teal-600">Rs {calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 flex-shrink-0">
            <button 
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className={`w-full px-4 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2 ${
                cart.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>Complete Sale</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button 
                disabled={cart.length === 0}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  cart.length === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Save Draft
              </button>
              <button 
                onClick={clearCart}
                disabled={cart.length === 0}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  cart.length === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Customer</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <button
                onClick={() => selectCustomer(null)}
                className={`w-full p-3 mb-2 border rounded-lg text-left hover:border-teal-500 transition-colors ${
                  !selectedCustomer ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                }`}
              >
                <p className="font-semibold">Walk-in Customer</p>
                <p className="text-sm text-gray-500">No customer information</p>
              </button>
              {customersLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No customers found</p>
                </div>
              ) : (
                customers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => selectCustomer(customer)}
                    className={`w-full p-3 mb-2 border rounded-lg text-left hover:border-teal-500 transition-colors ${
                      selectedCustomer?.id === customer.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                    }`}
                  >
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

     
 {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700 flex-shrink-0">
              <h3 className="text-xl font-semibold text-white">Complete Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {/* Payment Summary */}
              <div className="bg-white rounded-lg p-4 mb-6 shadow-md border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase">Payment Summary</h4>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">Rs {calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600">Tax (18%):</span>
                  <span className="font-semibold">Rs {calculateTax().toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600 text-sm">
                    <span>Discount:</span>
                    <span className="font-semibold">- Rs {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t text-lg font-bold mt-2">
                  <span>Total:</span>
                  <span className="text-teal-600">Rs {calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                          paymentMethod === method.id
                            ? `${method.color} border-transparent text-white`
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-semibold">{method.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Amount Paid Input (for Cash) */}
              {paymentMethod === 'CASH' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg"
                    placeholder="0.00"
                    autoFocus
                  />
                  {paidAmount && parseFloat(paidAmount) >= calculateTotal() && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-green-700">Change:</span>
                        <span className="text-xl font-bold text-green-600">
                          Rs {calculateChange().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="3"
                  placeholder="Add any notes about this sale..."
                />
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirm Payment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && lastInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {editSale ? 'Sale Updated!' : 'Payment Successful!'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {editSale ? 'Sale has been updated successfully' : 'Transaction completed successfully'}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Invoice Number</p>
                <p className="text-base font-bold text-teal-600">{lastInvoice.invoiceNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-left mb-4">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="font-bold text-sm">Rs {lastInvoice.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="font-bold text-sm">{lastInvoice.paymentMethod}</p>
                </div>
                {lastInvoice.paymentMethod === 'CASH' && (
                  <>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
                      <p className="font-bold text-sm">Rs {lastInvoice.paidAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-xs text-gray-500 mb-1">Change</p>
                      <p className="font-bold text-sm text-green-600">
                        Rs {((lastInvoice.paidAmount || 0) - (lastInvoice.totalAmount || 0)).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-500">Closing in 3 seconds...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
