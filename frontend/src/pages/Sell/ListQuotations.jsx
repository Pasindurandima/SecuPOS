import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Edit, Trash2, Send, Printer, Eye, Clock, X, CheckCircle } from 'lucide-react';
import { quotationService, customerService } from '../../services/apiService';

const ListQuotations = () => {
  const navigate = useNavigate();
  
  // State management
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Fetch quotations and customers on mount
  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await quotationService.getAll();
      if (response.data && response.data.success) {
        setQuotations(response.data.data || []);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setError('Failed to load quotations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      if (response.data && response.data.success) {
        setCustomers(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  // Parse quotation notes to extract expiry date and terms
  const parseQuotationNotes = (notes) => {
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

  // Filter quotations
  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = searchTerm === '' || 
      quotation.id.toString().includes(searchTerm) ||
      (quotation.customerName && quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (quotation.notes && quotation.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCustomer = filterCustomer === '' || quotation.customerId === parseInt(filterCustomer);
    
    const matchesDateFrom = filterDateFrom === '' || new Date(quotation.quotationDate) >= new Date(filterDateFrom);
    const matchesDateTo = filterDateTo === '' || new Date(quotation.quotationDate) <= new Date(filterDateTo);
    
    return matchesSearch && matchesCustomer && matchesDateFrom && matchesDateTo;
  });

  const handleAddQuotation = () => {
    navigate('/sell/add-quotation');
  };

  const handleView = async (id) => {
    try {
      setLoading(true);
      const response = await quotationService.getById(id);
      if (response.data && response.data.success) {
        setSelectedQuotation(response.data.data);
        setShowViewModal(true);
      }
    } catch (err) {
      console.error('Error fetching quotation details:', err);
      alert('Failed to load quotation details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/sell/add-quotation?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await quotationService.delete(id);
      if (response.data && response.data.success) {
        alert('Quotation deleted successfully!');
        fetchQuotations();
      }
    } catch (err) {
      console.error('Error deleting quotation:', err);
      alert('Failed to delete quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToSale = async (id) => {
    if (!window.confirm('Convert this quotation to a sale?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await quotationService.convertToSale(id);
      if (response.data && response.data.success) {
        alert('Quotation converted to sale successfully!');
        fetchQuotations();
      }
    } catch (err) {
      console.error('Error converting quotation:', err);
      alert('Failed to convert quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (id) => {
    alert(`Send quotation #${id} functionality will be implemented soon.`);
  };

  const handlePrint = (id) => {
    alert(`Print quotation #${id} functionality will be implemented soon.`);
  };

  // Calculate total amount for a quotation
  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
      const tax = subtotal * ((item.taxRate || 0) / 100);
      return sum + subtotal + tax;
    }, 0);
  };

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Statistics
  const stats = {
    total: filteredQuotations.length,
    totalAmount: filteredQuotations.reduce((sum, q) => sum + calculateTotal(q.items), 0)
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">List Quotations</h1>
        <button
          onClick={handleAddQuotation}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:bg-gray-400"
        >
          <FileText className="w-4 h-4" />
          <span>Add Quotation</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Quotations</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Amount</p>
              <p className="text-3xl font-bold mt-2">රු {stats.totalAmount.toFixed(2)}</p>
            </div>
            <FileText className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-600">Loading quotations...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl">No quotations found</p>
              <p className="mt-2">Create your first quotation to get started.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-teal-600 to-blue-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation, index) => {
                  return (
                    <tr key={quotation.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{quotation.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {quotation.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(quotation.quotationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {quotation.expiryDate || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {quotation.items ? quotation.items.length : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        රු {(quotation.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm space-x-2">
                        <button
                          onClick={() => handleView(quotation.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(quotation.id)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors p-1"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(quotation.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleSend(quotation.id)}
                          className="text-teal-600 hover:text-teal-800 transition-colors p-1"
                          title="Send"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handlePrint(quotation.id)}
                          className="text-purple-600 hover:text-purple-800 transition-colors p-1"
                          title="Print"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleConvertToSale(quotation.id)}
                          className="text-green-600 hover:text-green-800 transition-colors p-1"
                          title="Convert to Sale"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-blue-600">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Quotation Details #{selectedQuotation.id}</h3>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedQuotation(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Details */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h4>
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-semibold text-gray-900">{selectedQuotation.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quotation Date</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedQuotation.quotationDate).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quotation Details */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Quotation Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <p className="font-semibold text-gray-900">
                        {selectedQuotation.expiryDate || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-semibold text-gray-900">{selectedQuotation.status}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-semibold text-gray-900">රු {(selectedQuotation.totalAmount || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Terms & Notes */}
              {selectedQuotation.terms && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Terms & Conditions</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-800">{selectedQuotation.terms}</p>
                  </div>
                </div>
              )}
              {selectedQuotation.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Notes</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedQuotation.notes}</p>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Items</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Tax</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedQuotation.items && selectedQuotation.items.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.productName || `Product #${item.productId}`}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right">රු {(item.unitPrice || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{(item.taxRate || 0)}%</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">රු {(item.totalAmount || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          Grand Total:
                        </td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-teal-600">
                          රු {(selectedQuotation.totalAmount || 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedQuotation(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
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

export default ListQuotations;
