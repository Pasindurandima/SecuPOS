import React, { useEffect, useState } from 'react';
import { saleService, purchaseService, expenseService, productService } from '../services/apiService';
import { formatCurrency } from './Reports/reportUtils';

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesData, purchaseData, expenseData, productData] = await Promise.all([
          saleService.getAll(),
          purchaseService.getAll(),
          expenseService.getAll(),
          productService.getAll(),
        ]);

        setSales(salesData || []);
        setPurchases(purchaseData || []);
        setExpenses(expenseData || []);
        setProducts(productData || []);
      } catch (error) {
        console.error('Failed to load report summary:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const revenue = sales
    .filter((sale) => sale?.status === 'COMPLETED' || sale?.status === 'completed')
    .reduce((sum, sale) => sum + Number(sale?.total || sale?.paidAmount || 0), 0);

  const costOfGoods = purchases
    .filter((purchase) => purchase?.status === 'RECEIVED' || purchase?.status === 'received')
    .reduce((sum, purchase) => sum + Number(purchase?.total || 0), 0);

  const operationalExpenses = expenses.reduce((sum, expense) => sum + Number(expense?.amount || 0), 0);
  const lowStock = products.filter((product) => Number(product?.quantity || 0) <= Number(product?.alertQuantity || 0)).length;
  const totalInventoryValue = products.reduce((sum, product) => sum + Number(product?.quantity || 0) * Number(product?.sellingPrice || product?.costPrice || 0), 0);
  const netProfit = revenue - costOfGoods - operationalExpenses;

  const summaryCards = [
    { label: 'Revenue', value: formatCurrency(revenue), accent: 'bg-blue-500' },
    { label: 'Cost of goods', value: formatCurrency(costOfGoods), accent: 'bg-orange-500' },
    { label: 'Expenses', value: formatCurrency(operationalExpenses), accent: 'bg-red-500' },
    { label: 'Net profit', value: formatCurrency(netProfit), accent: 'bg-emerald-500' },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600 mt-2">Live business overview from sales, purchases, inventory, and expenses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div key={card.label} className={`${card.accent} text-white p-5 rounded-xl shadow-md`}>
            <div className="text-sm opacity-90">{card.label}</div>
            <div className="text-2xl font-bold mt-2">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="text-sm text-gray-500">Products</div>
          <div className="text-3xl font-bold text-gray-800 mt-2">{products.length}</div>
          <div className="text-sm text-gray-500 mt-2">Active items in stock</div>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <div className="text-sm text-gray-500">Inventory value</div>
          <div className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(totalInventoryValue)}</div>
          <div className="text-sm text-gray-500 mt-2">Based on current stock</div>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <div className="text-sm text-gray-500">Low stock alerts</div>
          <div className="text-3xl font-bold text-amber-600 mt-2">{lowStock}</div>
          <div className="text-sm text-gray-500 mt-2">Products needing attention</div>
        </div>
      </div>
    </div>
  );
}
