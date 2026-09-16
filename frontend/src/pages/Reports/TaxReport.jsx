import React, { useEffect, useState } from 'react';
import { purchaseService, saleService } from '../../services/apiService';
import { formatCurrency } from './reportUtils';

const TaxReport = () => {
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
        console.error('Failed to load tax report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const taxCollected = sales.reduce((sum, sale) => sum + Number(sale?.tax || 0), 0);
  const taxPaid = purchases.reduce((sum, purchase) => sum + Number(purchase?.tax || 0), 0);
  const netTaxPayable = taxCollected - taxPaid;

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tax Report</h1>
        <p className="text-gray-600 mt-2">Tax collected against tax paid from live sales and purchase records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Tax Collected</div>
          <div className="text-3xl font-bold">{formatCurrency(taxCollected)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Tax Paid</div>
          <div className="text-3xl font-bold">{formatCurrency(taxPaid)}</div>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-lg shadow-md">
          <div className="text-sm opacity-90 mb-2">Net Tax</div>
          <div className="text-3xl font-bold">{formatCurrency(netTaxPayable)}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax Collected</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tax Paid</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm font-medium">Sales & Purchases</td>
              <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">{formatCurrency(taxCollected)}</td>
              <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">{formatCurrency(taxPaid)}</td>
              <td className={`px-6 py-4 text-sm text-right font-bold ${netTaxPayable >= 0 ? 'text-teal-600' : 'text-red-600'}`}>{formatCurrency(netTaxPayable)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxReport;
