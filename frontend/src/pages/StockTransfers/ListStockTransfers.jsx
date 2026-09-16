import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockTransferService } from '../../services/apiService';

const ListStockTransfers = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const data = await stockTransferService.getAll();
      setTransfers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load stock transfers', err);
      alert('Failed to load stock transfers');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer) => {
      const matchesSearch = !search ||
        (transfer.transferNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (transfer.fromLocation || '').toLowerCase().includes(search.toLowerCase()) ||
        (transfer.toLocation || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || transfer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, transfers]);

  const handleAdd = () => navigate('/stock-transfers/add');
  const handleEdit = (transfer) => navigate('/stock-transfers/add', { state: { editTransfer: transfer } });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transfer?')) return;

    try {
      await stockTransferService.delete(id);
      setTransfers((prev) => prev.filter((transfer) => transfer.id !== id));
      if (selectedTransfer?.id === id) setSelectedTransfer(null);
    } catch (error) {
      console.error('Delete failed', error);
      alert(error.response?.data?.message || 'Failed to delete stock transfer');
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    try {
      return new Date(dateValue).toLocaleDateString();
    } catch {
      return dateValue.split('T')[0];
    }
  };

  const statusBadgeClass = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_TRANSIT: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Transfers List</h1>
        <p className="text-gray-600 mt-2">View and manage inventory transfers between locations</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search transfers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            onClick={handleAdd}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add Stock Transfer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No stock transfers found</td>
                </tr>
              ) : (
                filteredTransfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(transfer.transferDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transfer.transferNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transfer.fromLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transfer.toLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transfer.totalQuantity || transfer.items?.length || 0} items</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass[transfer.status] || 'bg-gray-100 text-gray-800'}`}>
                        {transfer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => setSelectedTransfer(transfer)} className="text-teal-600 hover:text-teal-900 mr-2">View</button>
                      <button onClick={() => handleEdit(transfer)} className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                      <button onClick={() => handleDelete(transfer.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedTransfer.transferNumber}</h3>
                <p className="text-sm text-gray-600">{formatDate(selectedTransfer.transferDate)} • {selectedTransfer.fromLocation} → {selectedTransfer.toLocation}</p>
              </div>
              <button onClick={() => setSelectedTransfer(null)} className="text-gray-500 hover:text-gray-800">Close</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(selectedTransfer.items || []).map((item) => (
                    <tr key={item.id || `${item.product?.id}-${item.quantity}`}>
                      <td className="px-4 py-2 text-sm text-gray-800">{item.product?.name || 'Product'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{item.product?.sku || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{Number(item.unitCost || 0).toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{Number(item.subtotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">{selectedTransfer.notes || 'No notes'}</div>
              <div className="text-lg font-bold text-teal-700">Total: {Number(selectedTransfer.totalAmount || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListStockTransfers;
