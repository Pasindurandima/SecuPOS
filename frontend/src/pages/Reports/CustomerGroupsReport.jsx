import React, { useEffect, useMemo, useState } from 'react';
import { customerService, saleService } from '../../services/apiService';
import { formatCurrency } from './reportUtils';

const CustomerGroupsReport = () => {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerData, saleData] = await Promise.all([
          customerService.getAll(),
          saleService.getAll(),
        ]);
        setCustomers(customerData || []);
        setSales(saleData || []);
      } catch (error) {
        console.error('Failed to load customer group report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const reportData = useMemo(() => {
    const map = new Map();

    customers.forEach((customer) => {
      const group = customer?.customerGroup || 'General';
      const current = map.get(group) || { group, customerCount: 0, totalSales: 0, salesCount: 0 };
      current.customerCount += 1;
      map.set(group, current);
    });

    sales.forEach((sale) => {
      const customer = sale?.customer;
      const group = customer?.customerGroup || 'General';
      const current = map.get(group) || { group, customerCount: 0, totalSales: 0, salesCount: 0 };
      current.totalSales += Number(sale?.total || 0);
      current.salesCount += 1;
      map.set(group, current);
    });

    return Array.from(map.values()).map((row) => ({
      ...row,
      avgSale: row.salesCount ? row.totalSales / row.salesCount : 0,
    })).sort((a, b) => b.totalSales - a.totalSales);
  }, [customers, sales]);

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Groups Report</h1>
        <p className="text-gray-600 mt-2">Sales analysis by customer group from live customer data.</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Customers</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg. Sale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reportData.map((row) => (
              <tr key={row.group}>
                <td className="px-6 py-4 text-sm">{row.group}</td>
                <td className="px-6 py-4 text-sm text-right">{row.customerCount}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(row.totalSales)}</td>
                <td className="px-6 py-4 text-sm text-right">{formatCurrency(row.avgSale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerGroupsReport;
