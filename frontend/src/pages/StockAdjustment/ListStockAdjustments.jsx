import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockAdjustmentService } from '../../services/apiService';
import BusinessLocationSelect from '../../components/BusinessLocationSelect';
import { formatCurrency, formatDate } from '../../context/BusinessSettingsContext';

const ListStockAdjustments = () => {
  const navigate = useNavigate();

  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const data = await stockAdjustmentService.getAll();
      setAdjustments(data);
    } catch (err) {
      console.error('Failed to load stock adjustments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/stock-adjustment/add');
  };

  const handleView = (adjustment) => {
    setViewItem(adjustment);
  };

  const handleEdit = (adjustment) => {
    navigate('/stock-adjustment/add', { state: { editAdjustment: adjustment } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this adjustment?')) return;
    try {
      await stockAdjustmentService.delete(id);
      setAdjustments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete adjustment');
    }
  };

  const filtered = adjustments.filter(a => {
    const matchesSearch = search
      ? (a.referenceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.reason || '').toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesLocation = locationFilter
      ? a.location === locationFilter
      : true;

    const matchesDate = dateFilter
      ? (a.adjustmentDate || '').split('T')[0] === dateFilter
      : true;

    return matchesSearch && matchesLocation && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const showingFrom = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(filtered.length, page * pageSize);

  const computeNet = (adjustment) => {
    if (!adjustment.items) return 0;
    return adjustment.items.reduce((sum, it) => {
      const qty = it.quantity || 0;
      return sum + (it.adjustmentType === 'ADD' ? qty : -qty);
    }, 0);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Adjustments List</h1>
        <p className="text-gray-600 mt-2">View all stock adjustment records</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search adjustments..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <BusinessLocationSelect
              allLabel="All Locations"
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button onClick={handleAdd} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
            Add Stock Adjustment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center">Loading...</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No adjustments found</td></tr>
              ) : (
                pageData.map(adj => (
                  <tr key={adj.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(adj.adjustmentDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adj.referenceNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{adj.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {computeNet(adj) < 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Decrease</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Increase</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(adj.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{adj.reason?.replaceAll('_', ' ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleView(adj)} className="text-teal-600 hover:text-teal-900 mr-2">View</button>
                      <button onClick={() => handleEdit(adj)} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                      <button onClick={() => handleDelete(adj.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">Showing {showingFrom} to {showingTo} of {filtered.length} results</div>
          <div className="flex gap-2 items-center">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
            <div className="px-3 py-1 border border-gray-300 rounded-lg">{page} / {totalPages}</div>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Adjustment: {viewItem.referenceNumber}</h3>
                <p className="text-sm text-gray-600">{formatDate(viewItem.adjustmentDate)} — {viewItem.location}</p>
              </div>
              <div>
                <button onClick={() => setViewItem(null)} className="text-gray-500 hover:text-gray-800">Close</button>
              </div>
            </div>

            <div className="mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Current Stock</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Adjustment</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {viewItem.items?.map(it => (
                    <tr key={it.id}>
                      <td className="px-4 py-2">{it.product?.name}</td>
                      <td className="px-4 py-2">{it.product?.sku}</td>
                      <td className="px-4 py-2">{it.currentStock}</td>
                      <td className="px-4 py-2">{it.adjustmentType}</td>
                      <td className="px-4 py-2">{it.quantity}</td>
                      <td className="px-4 py-2">{formatCurrency(it.unitCost)}</td>
                      <td className="px-4 py-2">${(Number(it.subtotal) || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{viewItem.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-teal-600">${(Number(viewItem.totalAmount) || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListStockAdjustments;
