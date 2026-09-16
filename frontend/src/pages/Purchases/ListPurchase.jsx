import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Trash2, AlertCircle, X, CreditCard } from 'lucide-react';
import { purchaseService } from '../../services/apiService';
import { formatCurrency, formatDate } from '../../context/BusinessSettingsContext';

const ListPurchase = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [paymentPurchase, setPaymentPurchase] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    paymentAccount: '',
    paymentNote: ''
  });

  // Fetch purchases on component mount
  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseService.getAll();
      setPurchases(data);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await purchaseService.delete(id);
        setPurchases(prevPurchases => prevPurchases.filter(purchase => purchase.id !== id));
      } catch (err) {
        console.error('Error deleting purchase:', err);
        const message = err.response?.data?.message || err.message;
        setError(`Failed to delete purchase: ${message}`);
      }
    }
  };

  const handleView = (purchase) => {
    setSelectedPurchase(purchase);
  };

  const handleOpenPayment = (purchase) => {
    const dueAmount = Math.max(0, parseFloat(purchase.paymentDue ?? (purchase.total - (purchase.paidAmount || 0))) || 0);
    setPaymentPurchase(purchase);
    setPaymentForm({
      amount: dueAmount.toFixed(2),
      paymentMethod: purchase.paymentMethod || 'CASH',
      paymentAccount: purchase.paymentAccount || '',
      paymentNote: ''
    });
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    const amount = parseFloat(paymentForm.amount);
    const dueAmount = parseFloat(paymentPurchase.paymentDue ?? (paymentPurchase.total - (paymentPurchase.paidAmount || 0))) || 0;

    if (!amount || amount <= 0 || amount > dueAmount) {
      setError(`Payment must be greater than zero and no more than ${formatCurrency(dueAmount)}.`);
      return;
    }

    try {
      await purchaseService.recordPayment(paymentPurchase.id, {
        amount,
        paymentMethod: paymentForm.paymentMethod,
        paymentAccount: paymentForm.paymentAccount || null,
        paymentNote: paymentForm.paymentNote || null,
        paidOn: new Date().toISOString()
      });
      setPaymentPurchase(null);
      await fetchPurchases();
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(`Failed to record payment: ${message}`);
    }
  };

  // Filter purchases based on search and date
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.purchaseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(purchase.purchaseDate).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      RECEIVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      ORDERED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getPaymentStatus = (total, paid) => {
    const totalAmount = parseFloat(total) || 0;
    const paidAmount = parseFloat(paid) || 0;
    
    if (paidAmount === 0) return { label: 'Unpaid', color: 'bg-red-100 text-red-800' };
    if (paidAmount >= totalAmount) return { label: 'Paid', color: 'bg-green-100 text-green-800' };
    return { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Purchase List</h1>
        <p className="text-gray-600 mt-2">View all purchase orders</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button 
            onClick={() => navigate('/purchases/add')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add Purchase</span>
          </button>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Loading purchases...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={fetchPurchases}
              className="ml-auto text-red-600 hover:text-red-800 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPurchases.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No purchases found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || dateFilter ? 'Try adjusting your filters' : 'Get started by adding your first purchase'}
            </p>
            <button
              onClick={() => navigate('/purchases/add')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add First Purchase
            </button>
          </div>
        )}

        {/* Purchases Table */}
        {!loading && !error && filteredPurchases.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => {
                  const paymentStatus = getPaymentStatus(purchase.total, purchase.paidAmount);
                  const dueAmount = parseFloat(purchase.paymentDue || 0);
                  
                  return (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(purchase.purchaseDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {purchase.purchaseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {purchase.supplier?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {purchase.referenceNo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(purchase.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {formatCurrency(purchase.paidAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(dueAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(purchase.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatus.color}`}>
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleView(purchase)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                        {parseFloat(purchase.paymentDue ?? (purchase.total - (purchase.paidAmount || 0))) > 0 && (
                          <button
                            onClick={() => handleOpenPayment(purchase)}
                            className="mr-3 text-green-600 hover:text-green-900"
                            title="Record Payment"
                          >
                            <CreditCard className="inline h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(purchase.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Footer */}
        {!loading && !error && filteredPurchases.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Showing <span className="font-semibold">{filteredPurchases.length}</span> of <span className="font-semibold">{purchases.length}</span> purchases
              </span>
              <div className="flex gap-4">
                <span className="text-gray-600">
                  Total Amount: <span className="font-semibold text-gray-900">
                    {formatCurrency(filteredPurchases.reduce((sum, p) => sum + parseFloat(p.total || 0), 0))}
                  </span>
                </span>
                <span className="text-gray-600">
                  Total Paid: <span className="font-semibold text-green-600">
                    {formatCurrency(filteredPurchases.reduce((sum, p) => sum + parseFloat(p.paidAmount || 0), 0))}
                  </span>
                </span>
                <span className="text-gray-600">
                  Total Due: <span className="font-semibold text-red-600">
                    {formatCurrency(filteredPurchases.reduce((sum, p) => sum + parseFloat(p.paymentDue || 0), 0))}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {paymentPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <form onSubmit={handlePaymentSubmit} className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b bg-green-600 px-6 py-4 text-white">
              <div>
                <h2 className="text-xl font-semibold">Record Payment</h2>
                <p className="text-sm text-green-100">{paymentPurchase.purchaseNumber}</p>
              </div>
              <button type="button" onClick={() => setPaymentPurchase(null)} className="rounded p-1 hover:bg-green-700" title="Close payment form">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded bg-red-50 p-3 text-sm text-red-700">
                Outstanding balance: <strong>{formatCurrency(paymentPurchase.paymentDue ?? (paymentPurchase.total - (paymentPurchase.paidAmount || 0)))}</strong>
              </div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(event) => setPaymentForm(prev => ({ ...prev, amount: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(event) => setPaymentForm(prev => ({ ...prev, paymentMethod: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Payment Account
                <input
                  type="text"
                  value={paymentForm.paymentAccount}
                  onChange={(event) => setPaymentForm(prev => ({ ...prev, paymentAccount: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Optional"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Note
                <textarea
                  value={paymentForm.paymentNote}
                  onChange={(event) => setPaymentForm(prev => ({ ...prev, paymentNote: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button type="button" onClick={() => setPaymentPurchase(null)} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-100">Cancel</button>
              <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700">Save Payment</button>
            </div>
          </form>
        </div>
      )}

      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b bg-teal-600 px-6 py-4 text-white">
              <div>
                <h2 className="text-xl font-semibold">Purchase Details</h2>
                <p className="text-sm text-teal-100">{selectedPurchase.purchaseNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPurchase(null)}
                className="rounded p-1 hover:bg-teal-700"
                title="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              <div><span className="text-sm text-gray-500">Date</span><p className="font-medium">{formatDate(selectedPurchase.purchaseDate)}</p></div>
              <div><span className="text-sm text-gray-500">Supplier</span><p className="font-medium">{selectedPurchase.supplier?.name || 'N/A'}</p></div>
              <div><span className="text-sm text-gray-500">Reference</span><p className="font-medium">{selectedPurchase.referenceNo || '-'}</p></div>
              <div><span className="text-sm text-gray-500">Status</span><p className="mt-1">{getStatusBadge(selectedPurchase.status)}</p></div>
              <div><span className="text-sm text-gray-500">Payment Method</span><p className="font-medium">{selectedPurchase.paymentMethod || '-'}</p></div>
              <div><span className="text-sm text-gray-500">Business Location</span><p className="font-medium">{selectedPurchase.businessLocation || '-'}</p></div>
            </div>

            <div className="px-6 pb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">Items</h3>
              <div className="overflow-x-auto rounded border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Unit Cost</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(selectedPurchase.items || []).map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">{item.product?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-right text-sm">{item.quantity || 0}</td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(item.unitCostBeforeTax || item.unitCost)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrency(item.total || item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end gap-8 border-t pt-4 text-sm">
                <span>Paid: <strong className="text-green-600">{formatCurrency(selectedPurchase.paidAmount)}</strong></span>
                <span>Due: <strong className="text-red-600">{formatCurrency(selectedPurchase.paymentDue)}</strong></span>
                <span>Total: <strong>{formatCurrency(selectedPurchase.total)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPurchase;
