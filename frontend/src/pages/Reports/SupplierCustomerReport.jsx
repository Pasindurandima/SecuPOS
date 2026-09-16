import React, { useEffect, useMemo, useState } from 'react';
import { customerService, purchaseService, saleService, supplierService } from '../../services/apiService';
import { formatCurrency } from './reportUtils';

const SupplierCustomerReport = () => {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [saleData, purchaseData, customerData, supplierData] = await Promise.all([
          saleService.getAll(),
          purchaseService.getAll(),
          customerService.getAll(),
          supplierService.getAll(),
        ]);

        setSales(saleData || []);
        setPurchases(purchaseData || []);
        setCustomers(customerData || []);
        setSuppliers(supplierData || []);
      } catch (error) {
        console.error('Failed to load supplier/customer report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const supplierSummary = useMemo(() => {
    const map = new Map();
    purchases.forEach((purchase) => {
      const supplier = purchase?.supplier?.name || 'Unassigned Supplier';
      const current = map.get(supplier) || { name: supplier, purchases: 0, due: 0 };
      current.purchases += Number(purchase?.total || 0);
      current.due += Number(purchase?.paymentDue || 0);
      map.set(supplier, current);
    });
    return Array.from(map.values()).sort((a, b) => b.purchases - a.purchases).slice(0, 5);
  }, [purchases]);

  const customerSummary = useMemo(() => {
    const map = new Map();
    sales.forEach((sale) => {
      const customer = sale?.customer?.name || 'Walk-in Customer';
      const current = map.get(customer) || { name: customer, sales: 0, due: 0 };
      current.sales += Number(sale?.total || 0);
      current.due += Math.max(Number(sale?.total || 0) - Number(sale?.paidAmount || 0), 0);
      map.set(customer, current);
    });
    return Array.from(map.values()).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [sales]);

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Supplier & Customer Report</h1>
        <p className="text-gray-600 mt-2">Live transaction balances for suppliers and customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Top Suppliers</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Supplier Name</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Purchases</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {supplierSummary.map((row) => (
                <tr key={row.name}>
                  <td className="px-4 py-3 text-sm">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(row.purchases)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(row.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Top Customers</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Customer Name</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Sales</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customerSummary.map((row) => (
                <tr key={row.name}>
                  <td className="px-4 py-3 text-sm">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(row.sales)}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(row.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierCustomerReport;
