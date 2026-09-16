import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Edit, Trash2, CheckCircle, Eye, X } from 'lucide-react';
import { draftService, customerService } from '../../services/apiService';

const ListDraft = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDraft, setViewingDraft] = useState(null);

  useEffect(() => {
    fetchDrafts();
    fetchCustomers();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      console.log('Fetching drafts...');
      const response = await draftService.getAll();
      console.log('Drafts loaded:', response);
      setDrafts(response || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(`Failed to load drafts: ${err.message}`);
    } finally {
      setLoading(false);
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

  const handleAddDraft = () => {
    navigate('/sell/add-draft');
  };

  const handleEditDraft = (id) => {
    navigate(`/sell/add-draft?id=${id}`);
  };

  const handleConvertToSale = async (draft) => {
    if (window.confirm('Convert this draft to a completed sale? This will update inventory.')) {
      try {
        setLoading(true);
        console.log('Converting draft to sale:', draft.id);
        
        // Update the draft to completed sale
        await draftService.convertToSale(draft.id, {
          ...draft,
          status: 'COMPLETED',
          paidAmount: draft.total,
          changeAmount: 0
        });
        
        alert('Draft converted to sale successfully!');
        fetchDrafts();
      } catch (err) {
        console.error('Error converting draft:', err);
        alert(`Failed to convert draft: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteDraft = async (id) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        setLoading(true);
        console.log('Deleting draft:', id);
        await draftService.delete(id);
        alert('Draft deleted successfully!');
        fetchDrafts();
      } catch (err) {
        console.error('Error deleting draft:', err);
        alert(`Failed to delete draft: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDraft = async (id) => {
    try {
      setLoading(true);
      const draft = await draftService.getById(id);
      setViewingDraft(draft);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error loading draft:', err);
      alert(`Failed to load draft details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter drafts based on search and filters
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = searchTerm === '' || 
      draft.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = selectedCustomer === '' || 
      draft.customer?.id === parseInt(selectedCustomer);
    
    const matchesDate = selectedDate === '' || 
      new Date(draft.saleDate).toISOString().split('T')[0] === selectedDate;
    
    return matchesSearch && matchesCustomer && matchesDate;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Drafts</h1>
        <p className="text-gray-600 mt-2">Manage your saved sales drafts</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search drafts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select 
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddDraft}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:bg-gray-400"
          >
            <FileText className="w-4 h-4" />
            <span>Add Draft</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading && (
            <div className="text-center py-8 text-gray-600">Loading drafts...</div>
          )}
          
          {error && (
            <div className="text-center py-8 text-red-600">{error}</div>
          )}

          {!loading && !error && filteredDrafts.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No drafts found. Click "Add Draft" to create one.
            </div>
          )}

          {!loading && !error && filteredDrafts.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draft No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrafts.map((draft) => (
                  <tr key={draft.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">
                      {draft.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {draft.customer?.name || `${draft.customer?.firstName || ''} ${draft.customer?.lastName || ''}`.trim() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(draft.saleDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {draft.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      Rs {draft.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {draft.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDraft(draft.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                          disabled={loading}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDraft(draft.id)}
                          className="text-teal-600 hover:text-teal-800"
                          title="Edit"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConvertToSale(draft)}
                          className="text-green-600 hover:text-green-800"
                          title="Convert to Sale"
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Drafts</div>
            <div className="text-2xl font-bold text-blue-900">{filteredDrafts.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total Items</div>
            <div className="text-2xl font-bold text-green-900">
              {filteredDrafts.reduce((sum, draft) => sum + (draft.items?.length || 0), 0)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Total Value</div>
            <div className="text-2xl font-bold text-purple-900">
              Rs {filteredDrafts.reduce((sum, draft) => sum + (draft.total || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* View Draft Modal */}
        {showViewModal && viewingDraft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
                <h3 className="text-xl font-semibold text-white">Draft Details</h3>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingDraft(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Draft No</p>
                    <p className="font-semibold">{viewingDraft.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">
                      {viewingDraft.customer?.name || `${viewingDraft.customer?.firstName || ''} ${viewingDraft.customer?.lastName || ''}`.trim() || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{new Date(viewingDraft.saleDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-teal-600">Rs {viewingDraft.total?.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {viewingDraft.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.product?.name || 'N/A'}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">Rs {item.unitPrice?.toFixed(2)}</td>
                          <td className="px-4 py-2">Rs {item.subtotal?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {viewingDraft.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-semibold">{viewingDraft.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingDraft(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditDraft(viewingDraft.id);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  Edit Draft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDraft;
