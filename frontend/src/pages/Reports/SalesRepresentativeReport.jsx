import React, { useEffect, useMemo, useState } from 'react';
import { saleService } from '../../services/apiService';
import { formatCurrency } from './reportUtils';

const SalesRepresentativeReport = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await saleService.getAll();
        setSales(data || []);
      } catch (error) {
        console.error('Failed to load salesperson report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  const representativeData = useMemo(() => {
    const map = new Map();

    sales.forEach((sale) => {
      const user = sale?.user || sale?.createdBy || null;
      const repName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unassigned' : 'Unassigned';
      const current = map.get(repName) || { name: repName, salesCount: 0, totalRevenue: 0 };
      current.salesCount += 1;
      current.totalRevenue += Number(sale?.total || 0);
      map.set(repName, current);
    });

    return Array.from(map.values()).map((item) => ({
      ...item,
      avgSale: item.salesCount ? item.totalRevenue / item.salesCount : 0,
      commission: item.totalRevenue * 0.05,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sales]);

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Representative Report</h1>
        <p className="text-gray-600 mt-2">Performance from actual recorded sales transactions.</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Representative</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sales Count</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg. Sale</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {representativeData.map((row) => (
              <tr key={row.name}>
                <td className="px-6 py-4 text-sm font-medium">{row.name}</td>
                <td className="px-6 py-4 text-sm text-right">{row.salesCount}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">{formatCurrency(row.totalRevenue)}</td>
                <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.avgSale)}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(row.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesRepresentativeReport;
