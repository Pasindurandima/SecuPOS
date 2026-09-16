import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { purchaseService, saleService } from '../../services/apiService';
import { formatCurrency } from './reportUtils';

const PurchaseSaleReport = () => {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesData, purchaseData] = await Promise.all([
          saleService.getAll(),
          purchaseService.getAll(),
        ]);
        setSales(salesData || []);
        setPurchases(purchaseData || []);
      } catch (error) {
        console.error('Failed to load purchase/sale report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const summary = useMemo(() => {
    const completedSales = sales.filter((sale) => sale?.status === 'COMPLETED' || sale?.status === 'completed');
    const receivedPurchases = purchases.filter((purchase) => purchase?.status === 'RECEIVED' || purchase?.status === 'received');

    const totalSales = completedSales.reduce((sum, sale) => sum + Number(sale?.total || 0), 0);
    const totalPurchases = receivedPurchases.reduce((sum, purchase) => sum + Number(purchase?.total || 0), 0);

    const monthlyMap = new Map();
    [...completedSales, ...receivedPurchases].forEach((entry) => {
      const key = entry?.saleDate ? 'sale' : 'purchase';
      const date = new Date(entry?.saleDate || entry?.purchaseDate || Date.now());
      const month = date.toLocaleString('en-US', { month: 'short' });
      const current = monthlyMap.get(month) || { month, purchases: 0, sales: 0 };
      if (key === 'sale') current.sales += Number(entry?.total || 0);
      else current.purchases += Number(entry?.total || 0);
      monthlyMap.set(month, current);
    });

    const comparisonData = Array.from(monthlyMap.values()).slice(0, 6);

    const supplierTotals = new Map();
    receivedPurchases.forEach((purchase) => {
      const supplierName = purchase?.supplier?.name || 'Unassigned Supplier';
      supplierTotals.set(supplierName, (supplierTotals.get(supplierName) || 0) + Number(purchase?.total || 0));
    });

    const customerTotals = new Map();
    completedSales.forEach((sale) => {
      const customerName = sale?.customer?.name || 'Walk-in Customer';
      customerTotals.set(customerName, (customerTotals.get(customerName) || 0) + Number(sale?.total || 0));
    });

    return {
      totalSales,
      totalPurchases,
      comparisonData,
      topPurchases: Array.from(supplierTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topSales: Array.from(customerTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [sales, purchases]);

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Purchase & Sale Report</h1>
        <p className="text-gray-600 mt-2">Comparative analysis of purchases and sales from live records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Total Purchases</div>
          <div className="text-3xl font-bold">{formatCurrency(summary.totalPurchases)}</div>
          <div className="text-sm opacity-75 mt-2">Transactions: {purchases.length}</div>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Total Sales</div>
          <div className="text-3xl font-bold">{formatCurrency(summary.totalSales)}</div>
          <div className="text-sm opacity-75 mt-2">Transactions: {sales.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Purchase vs Sale Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summary.comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="purchases" fill="#f97316" name="Purchases" />
            <Bar dataKey="sales" fill="#14b8a6" name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Purchases</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Supplier</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.topPurchases.map(([name, amount]) => (
                  <tr key={name}>
                    <td className="px-4 py-2 text-sm">{name}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Sales</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.topSales.map(([name, amount]) => (
                  <tr key={name}>
                    <td className="px-4 py-2 text-sm">{name}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSaleReport;
