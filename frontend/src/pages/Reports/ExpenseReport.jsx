import React, { useEffect, useMemo, useState } from 'react';
import { expenseCategoryService, expenseService } from '../../services/apiService';
import { formatCurrency } from './reportUtils';

const ExpenseReport = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const [data, categoryData] = await Promise.all([
          expenseService.getAll(),
          expenseCategoryService.getAll(),
        ]);
        setExpenses(data || []);
        setCategories(categoryData || []);
      } catch (error) {
        console.error('Failed to load expense report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.code, category.name])),
    [categories]
  );

  const breakdown = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + Number(expense?.amount || 0), 0);
    const grouped = new Map();

    expenses.forEach((expense) => {
      const key = expense?.category || 'OTHER';
      const displayName = categoryNames.get(key) || key.replace(/_/g, ' ');
      const current = grouped.get(key) || { category: displayName, count: 0, total: 0 };
      current.count += 1;
      current.total += Number(expense?.amount || 0);
      grouped.set(key, current);
    });

    return Array.from(grouped.values())
      .map((row) => ({ ...row, percentage: total ? (row.total / total) * 100 : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [categories, categoryNames, expenses]);

  const totalExpenses = breakdown.reduce((sum, row) => sum + row.total, 0);

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expense Report</h1>
        <p className="text-gray-600 mt-2">Live expense analysis by category and amount.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {breakdown.map((row) => (
              <tr key={row.category}>
                <td className="px-6 py-4 text-sm">{row.category}</td>
                <td className="px-6 py-4 text-sm text-right">{row.count}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold">{formatCurrency(row.total)}</td>
                <td className="px-6 py-4 text-sm text-right">{row.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-4 text-sm font-bold">Total</td>
              <td className="px-6 py-4 text-sm text-right font-bold">{expenses.length}</td>
              <td className="px-6 py-4 text-sm text-right font-bold">{formatCurrency(totalExpenses)}</td>
              <td className="px-6 py-4 text-sm text-right font-bold">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ExpenseReport;
