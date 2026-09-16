import React, { useEffect, useMemo, useState } from 'react';
import { saleService } from '../../services/apiService';
import { formatCurrency } from './reportUtils';

const TrendingProductsReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await saleService.getAll();
        setSales(data || []);
      } catch (error) {
        console.error('Failed to load trending products report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  const trendingProducts = useMemo(() => {
    const map = new Map();
    sales.forEach((sale) => {
      (sale?.items || []).forEach((item) => {
        const name = item?.product?.name || 'Unknown product';
        const category = item?.product?.category?.name || 'Uncategorized';
        const quantity = Number(item?.quantity || 0);
        const total = Number(item?.subtotal || item?.total || 0);
        const current = map.get(name) || { name, category, quantity: 0, revenue: 0 };
        current.quantity += quantity;
        current.revenue += total;
        map.set(name, current);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 10).map((item, index) => ({ ...item, rank: index + 1 }));
  }, [sales]);

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Trending Products</h1>
        <p className="text-gray-600 mt-2">Best-selling products from live sales records.</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Units Sold</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trendingProducts.map((product) => (
              <tr key={product.name}>
                <td className="px-6 py-4 text-sm font-bold">{product.rank}</td>
                <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                <td className="px-6 py-4 text-sm">{product.category}</td>
                <td className="px-6 py-4 text-sm text-right">{product.quantity}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">{formatCurrency(product.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrendingProductsReport;
