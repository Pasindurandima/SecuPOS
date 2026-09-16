import React, { useEffect, useMemo, useState } from 'react';
import { productService } from '../../services/apiService';
import { formatCurrency } from './reportUtils';

const StockReport = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data || []);
      } catch (error) {
        console.error('Failed to load stock report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !search || product?.name?.toLowerCase().includes(search.toLowerCase()) || product?.sku?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || product?.category?.name === category || product?.categoryId === Number(category) || (category === 'uncategorized' && !product?.category);
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const totalItems = products.reduce((sum, product) => sum + Number(product?.quantity || 0), 0);
  const stockValue = products.reduce((sum, product) => sum + Number(product?.quantity || 0) * Number(product?.sellingPrice || product?.costPrice || 0), 0);
  const lowStock = products.filter((product) => Number(product?.quantity || 0) <= Number(product?.alertQuantity || 0)).length;
  const outOfStock = products.filter((product) => Number(product?.quantity || 0) === 0).length;

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Report</h1>
        <p className="text-gray-600 mt-2">Current inventory and stock levels from the live product catalog.</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Categories</option>
              <option value="uncategorized">Uncategorized</option>
              {Array.from(new Set(products.map((product) => product?.category?.name).filter(Boolean))).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Total Items</div><div className="text-2xl font-bold text-blue-600">{totalItems}</div></div>
        <div className="bg-green-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Stock Value</div><div className="text-2xl font-bold text-green-600">{formatCurrency(stockValue)}</div></div>
        <div className="bg-orange-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Low Stock</div><div className="text-2xl font-bold text-orange-600">{lowStock}</div></div>
        <div className="bg-red-50 p-4 rounded-lg"><div className="text-sm text-gray-600">Out of Stock</div><div className="text-2xl font-bold text-red-600">{outOfStock}</div></div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const qty = Number(product?.quantity || 0);
              const unitPrice = Number(product?.sellingPrice || product?.costPrice || 0);
              const totalValue = qty * unitPrice;
              const status = qty === 0 ? 'Out of Stock' : qty <= Number(product?.alertQuantity || 0) ? 'Low Stock' : 'In Stock';
              const badge = qty === 0 ? 'bg-red-100 text-red-800' : qty <= Number(product?.alertQuantity || 0) ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';

              return (
                <tr key={product?.id || product?.sku}>
                  <td className="px-6 py-4 text-sm">{product?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-right">{product?.sku || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right">{qty}</td>
                  <td className="px-6 py-4 text-sm text-right">{formatCurrency(unitPrice)}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(totalValue)}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${badge}`}>{status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockReport;
