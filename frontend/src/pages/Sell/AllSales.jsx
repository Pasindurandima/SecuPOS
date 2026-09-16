import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Printer, Trash2, Search, ChevronDown, Edit, Truck, FileText, Package, DollarSign, RotateCcw, Link, Bell } from 'lucide-react';
import { saleService } from '../../services/apiService';
import { formatCurrency } from '../../context/BusinessSettingsContext';

const AllSales = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const result = await saleService.getAll();
      console.log('Fetched sales from backend:', result);
      
      // Map backend response to frontend format
      const mappedSales = (result || []).map(sale => ({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        saleDate: sale.saleDate,
        customerId: sale.customer?.id || null,
        customerName: sale.customer?.name || 'Walk-In Customer',
        customerPhone: sale.customer?.mobile || sale.customer?.phone || '-',
        customerAddress: sale.customer?.address || '-',
        items: (sale.items || []).map(item => ({
          id: item.id,
          productId: item.product?.id,
          productName: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          tax: item.taxAmount,
          priceIncTax: item.unitPrice,
          subtotal: item.subtotal
        })),
        subtotal: sale.subtotal,
        totalAmount: sale.total,
        paidAmount: sale.paidAmount,
        paymentMethod: sale.paymentMethod || 'CASH',
        paymentStatus: sale.paidAmount >= sale.total ? 'PAID' : sale.paidAmount > 0 ? 'PARTIAL' : 'PENDING',
        discount: sale.discount || 0,
        discountPercent: sale.subtotal > 0 ? (sale.discount / sale.subtotal * 100).toFixed(2) : 0,
        orderTax: sale.tax || 0,
        returnDue: 0,
        totalItems: sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        itemCount: sale.items?.length || 0,
        sellNote: sale.notes || '',
        staffNote: '',
        shippingStatus: 'PENDING',
        shippingCost: 0,
        roundOff: 0,
        addedBy: 'Admin',
        createdBy: 'Admin',
        status: sale.status
      }));
      
      setSales(mappedSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = () => {
    navigate('/sell/pos');
  };

  const handleDelete = async (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await saleService.delete(saleId);
        fetchSales(); // Refresh the list
        alert('Sale deleted successfully!');
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Failed to delete sale');
      }
    }
  };

  const handleView = (sale) => {
    setSelectedSale(sale);
    setViewModalOpen(true);
  };

  const handleEdit = (sale) => {
    // Navigate to POS page with sale data for editing
    navigate('/sell/pos', { state: { editSale: sale } });
  };

  const handleEditShipping = (sale) => {
    const newStatus = prompt('Enter new shipping status (PENDING/PROCESSING/SHIPPED/DELIVERED):', sale.shippingStatus || 'PENDING');
    if (newStatus) {
      alert(`Shipping status updated to: ${newStatus}\n(Backend integration pending)`);
      // Update via API: await saleService.updateShipping(sale.id, newStatus);
    }
  };

  const handlePrintInvoice = (sale) => {
    alert(`Printing invoice for:\n${sale.invoiceNumber || `INV-${sale.id}`}\n\nPDF generation will be implemented soon!`);
    // Generate and print PDF invoice
    console.log('Print Invoice:', sale);
  };

  const handlePackingSlip = (sale) => {
    alert(`Generating packing slip for:\n${sale.invoiceNumber || `INV-${sale.id}`}\n\nPDF generation will be implemented soon!`);
    console.log('Packing Slip:', sale);
  };

  const handleDeliveryNote = (sale) => {
    alert(`Generating delivery note for:\n${sale.invoiceNumber || `INV-${sale.id}`}\n\nPDF generation will be implemented soon!`);
    console.log('Delivery Note:', sale);
  };

  const handleViewPayments = (sale) => {
    alert(`Payment Details:\n\nTotal Amount: ${formatCurrency(sale.totalAmount)}\nTotal Paid: ${formatCurrency(sale.paidAmount)}\nDue Amount: ${formatCurrency((sale.totalAmount || 0) - (sale.paidAmount || 0))}\nPayment Method: ${sale.paymentMethod || 'CASH'}`);
  };

  const handleSellReturn = (sale) => {
    if (window.confirm(`Process return for sale ${sale.invoiceNumber || `INV-${sale.id}`}?`)) {
      alert('Return processing will be implemented soon!');
      // navigate(`/sell/return/${sale.id}`);
    }
  };

  const handleInvoiceURL = (sale) => {
    const invoiceURL = `${window.location.origin}/invoice/${sale.id}`;
    navigator.clipboard.writeText(invoiceURL).then(() => {
      alert(`Invoice URL copied to clipboard!\n\n${invoiceURL}`);
    }).catch(() => {
      alert(`Invoice URL:\n\n${invoiceURL}\n\n(Copy failed, please copy manually)`);
    });
  };

  const handleNotification = (sale) => {
    if (window.confirm(`Send sale notification to customer ${sale.customerName || 'Walk-in Customer'}?`)) {
      alert('Notification sent successfully!\n\n(Email/SMS integration will be implemented soon)');
      console.log('Send notification for sale:', sale);
    }
  };

  // Filter sales based on search and date
  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = !dateFilter || 
      (sale.saleDate && new Date(sale.saleDate).toISOString().split('T')[0] === dateFilter);
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">All Sales</h1>
        <p className="text-gray-600 mt-2">View all sales transactions - Total: {sales.length}</p>
      </div>
      
      {/* Filters Section - Fixed */}
      <div className="flex-shrink-0 px-6 pb-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by invoice or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {(searchQuery || dateFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDateFilter('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <button 
              onClick={handleAddSale}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>New Sale (POS)</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Table Section - Scrollable */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sales...</p>
              </div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold">No sales found</p>
                <p className="text-sm mt-2">
                  {searchQuery || dateFilter ? 'Try adjusting your filters' : 'Start by creating a new sale'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Due</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Return Due</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales
                  .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
                  .map((sale) => {
                    const dueAmount = (sale.totalAmount || 0) - (sale.paidAmount || 0);
                    return (
                      <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                        {/* Actions Dropdown */}
                        <td className="px-2 py-4 whitespace-nowrap text-center relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === sale.id ? null : sale.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 mx-auto text-xs"
                          >
                            <span className="font-medium">Actions</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          {openDropdown === sale.id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                            >
                              <div className="py-1">
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleView(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleEdit(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleDelete(sale.id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </button>
                                <hr className="my-1" />
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleEditShipping(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Truck className="w-4 h-4 mr-2" />
                                  Edit Shipping
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handlePrintInvoice(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Printer className="w-4 h-4 mr-2" />
                                  Print Invoice
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handlePackingSlip(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Packing Slip
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleDeliveryNote(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Delivery Note
                                </button>
                                <hr className="my-1" />
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleViewPayments(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  View Payments
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleSellReturn(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Sell Return
                                </button>
                                <hr className="my-1" />
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleInvoiceURL(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Link className="w-4 h-4 mr-2" />
                                  Invoice URL
                                </button>
                                <button 
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    handleNotification(sale);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Bell className="w-4 h-4 mr-2" />
                                  New Sale Notification
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A'}
                          <br />
                          <span className="text-xs text-gray-400">
                            {sale.saleDate ? new Date(sale.saleDate).toLocaleTimeString() : ''}
                          </span>
                        </td>

                        {/* Invoice No. */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-teal-600">
                          {sale.invoiceNumber || `INV-${sale.id}`}
                        </td>

                        {/* Customer Name */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.customerName || 'Walk-in Customer'}
                        </td>

                        {/* Payment Method */}
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sale.paymentMethod === 'CASH'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {sale.paymentMethod || 'CASH'}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                          Rs {(sale.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Total Paid */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                          Rs {(sale.paidAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Sell Due */}
                        <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-semibold ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          Rs {dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Sell Return Due */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                          Rs {(sale.returnDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Total Items */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {sale.totalItems || sale.itemCount || 0}
                        </td>

                        {/* Added By */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {sale.addedBy || sale.createdBy || 'Admin'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Sale Details Modal */}
      {viewModalOpen && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold">
                Sell Details (Invoice No: {selectedSale.invoiceNumber || `INV-${selectedSale.id}`})
              </h2>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Sale Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 font-medium">Date:</span>
                    <p className="text-gray-900">
                      {selectedSale.saleDate ? new Date(selectedSale.saleDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Invoice No.:</span>
                    <p className="text-teal-600 font-semibold">
                      #{selectedSale.invoiceNumber || `INV-${selectedSale.id}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Status:</span>
                    <p className="text-gray-900">Final</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Payment Status:</span>
                    <p>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedSale.paymentStatus === 'PAID' 
                          ? 'bg-green-100 text-green-800'
                          : selectedSale.paymentStatus === 'PARTIAL'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedSale.paymentStatus || 'PENDING'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 font-medium">Customer name:</span>
                    <p className="text-gray-900">{selectedSale.customerName || 'Walk-In Customer'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Address:</span>
                    <p className="text-gray-900">{selectedSale.customerAddress || 'Walk-In Customer'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Shipping:</span>
                    <p className="text-gray-900">
                      {selectedSale.shippingStatus ? (
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedSale.shippingStatus === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : selectedSale.shippingStatus === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedSale.shippingStatus}
                        </span>
                      ) : '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Products:</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price inc. tax</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedSale.items && selectedSale.items.length > 0 ? (
                        selectedSale.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.productName || 'Product'}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity || 0} Pc(s)</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₨ {(item.unitPrice || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₨ {(item.discount || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₨ {(item.tax || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₨ {(item.priceIncTax || item.unitPrice || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">₨ {(item.subtotal || 0).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                            No product details available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment info:</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference No</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payment mode</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment note</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">1</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {selectedSale.saleDate ? new Date(selectedSale.saleDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          SP{new Date().getFullYear()}/{selectedSale.invoiceNumber || selectedSale.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          ₨ {(selectedSale.paidAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedSale.paymentMethod === 'CASH'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {selectedSale.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">--</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 font-medium">Sell note:</span>
                    <p className="text-gray-900">{selectedSale.sellNote || '--'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Staff note:</span>
                    <p className="text-gray-900">{selectedSale.staffNote || '--'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total:</span>
                    <span className="font-semibold">₨ {(selectedSale.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Discount:</span>
                    <span className="text-gray-700">(-) {selectedSale.discountPercent || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Order Tax:</span>
                    <span className="text-gray-700">(+) ₨ {(selectedSale.orderTax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Shipping:</span>
                    <span className="text-gray-700">(+) ₨ {(selectedSale.shippingCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Round Off:</span>
                    <span className="text-gray-700">₨ {(selectedSale.roundOff || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-bold text-gray-900">₨ {(selectedSale.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-green-700">Total paid:</span>
                    <span className="font-semibold text-green-700">₨ {(selectedSale.paidAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-semibold ${((selectedSale.totalAmount || 0) - (selectedSale.paidAmount || 0)) > 0 ? 'text-red-700' : 'text-green-700'}`}>
                      Total remaining:
                    </span>
                    <span className={`font-semibold ${((selectedSale.totalAmount || 0) - (selectedSale.paidAmount || 0)) > 0 ? 'text-red-700' : 'text-green-700'}`}>
                      ₨ {((selectedSale.totalAmount || 0) - (selectedSale.paidAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Activities:</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {selectedSale.saleDate ? new Date(selectedSale.saleDate).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">Added</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{selectedSale.addedBy || selectedSale.createdBy || 'Admin'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>Status: <span className="font-semibold">Final</span></div>
                            <div>Total: <span className="font-semibold">₨ {(selectedSale.totalAmount || 0).toFixed(2)}</span></div>
                            <div>Payment Status: <span className="font-semibold">{selectedSale.paymentStatus || 'PENDING'}</span></div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 sticky bottom-0">
              <button
                onClick={() => handlePrintInvoice(selectedSale)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSales;
