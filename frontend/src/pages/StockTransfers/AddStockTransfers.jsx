import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Trash2 } from 'lucide-react';
import { productService, stockTransferService } from '../../services/apiService';
import BusinessLocationSelect from '../../components/BusinessLocationSelect';

const emptyForm = {
  transferDate: new Date().toISOString().split('T')[0],
  fromLocation: '',
  toLocation: '',
  status: 'PENDING',
  notes: '',
};

const AddStockTransfers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editTransfer = location.state?.editTransfer;

  const [formData, setFormData] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [transferItems, setTransferItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();

    if (editTransfer) {
      setFormData({
        transferDate: editTransfer.transferDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        fromLocation: editTransfer.fromLocation || '',
        toLocation: editTransfer.toLocation || '',
        status: editTransfer.status || 'PENDING',
        notes: editTransfer.notes || '',
      });

      if (editTransfer.items?.length) {
        const loadedItems = editTransfer.items.map((item) => ({
          productId: item.product?.id || item.productId,
          product: item.product,
          sku: item.product?.sku || '',
          name: item.product?.name || '',
          availableQty: item.currentStock || 0,
          quantity: item.quantity || 1,
          unitCost: Number(item.unitCost || 0),
          subtotal: Number(item.subtotal || 0),
        }));
        setTransferItems(loadedItems);
      }
    }
  }, [editTransfer]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please check your backend connection.');
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter((product) => {
      const text = `${product.name || ''} ${product.sku || ''}`.toLowerCase();
      return text.includes(value.toLowerCase());
    });

    setFilteredProducts(filtered);
  };

  const addProductToTransfer = (product) => {
    if (transferItems.some((item) => item.productId === product.id)) {
      alert('Product already added');
      return;
    }

    setTransferItems((prev) => [
      ...prev,
      {
        productId: product.id,
        product,
        sku: product.sku,
        name: product.name,
        availableQty: Number(product.quantity || 0),
        quantity: 1,
        unitCost: Number(product.costPrice || 0),
        subtotal: Number(product.costPrice || 0),
      },
    ]);

    setSearchTerm('');
    setFilteredProducts([]);
  };

  const updateTransferItem = (index, field, value) => {
    const updated = [...transferItems];
    updated[index][field] = value;

    if (field === 'quantity' || field === 'unitCost') {
      const quantity = Number(updated[index].quantity || 0);
      const unitCost = Number(updated[index].unitCost || 0);
      updated[index].subtotal = quantity * unitCost;
    }

    setTransferItems(updated);
  };

  const removeItem = (index) => {
    setTransferItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fromLocation || !formData.toLocation) {
      alert('Please select both source and destination locations');
      return;
    }

    if (formData.fromLocation === formData.toLocation) {
      alert('Source and destination locations must be different');
      return;
    }

    if (transferItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        transferDate: new Date(`${formData.transferDate}T12:00:00`).toISOString(),
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        status: formData.status,
        notes: formData.notes,
        items: transferItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      };

      if (editTransfer) {
        await stockTransferService.update(editTransfer.id, requestData);
      } else {
        await stockTransferService.create(requestData);
      }

      navigate('/stock-transfers/list');
    } catch (error) {
      console.error('Error saving stock transfer:', error);
      alert(error.response?.data?.message || 'Failed to save stock transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {editTransfer ? 'Edit' : 'Add'} Stock Transfer
        </h1>
        <p className="text-gray-600 mt-2">Transfer inventory between warehouse locations</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transfer No *</label>
              <input
                type="text"
                value={editTransfer?.transferNumber || 'Auto generated'}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Date *</label>
              <input
                type="date"
                name="transferDate"
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Location *</label>
              <BusinessLocationSelect
                value={formData.fromLocation}
                onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                required
                allLabel="Select Source Location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Location *</label>
              <BusinessLocationSelect
                value={formData.toLocation}
                onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                required
                allLabel="Select Destination Location"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Products</label>
            <div className="border rounded-lg p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products by name or SKU"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {filteredProducts.length > 0 && (
                <div className="mb-4 border rounded-lg max-h-48 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => addProductToTransfer(product)}
                      className="w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Qty: {product.quantity}</span>
                        <Plus className="h-4 w-4 text-teal-600" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Available</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit Cost</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subtotal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transferItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No products added yet
                      </td>
                    </tr>
                  ) : (
                    transferItems.map((item, index) => (
                      <tr key={`${item.productId}-${index}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.availableQty}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateTransferItem(index, 'quantity', Number(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateTransferItem(index, 'unitCost', Number(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {(Number(item.subtotal) || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Add transfer notes..."
            ></textarea>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Transfer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/stock-transfers/list')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockTransfers;
