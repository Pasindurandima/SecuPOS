import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { expenseService } from '../../services/apiService';
import { expenseCategoryService } from '../../services/apiService';
import { formatCurrency, formatDate } from '../../context/BusinessSettingsContext';

const ListExpenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [viewExpense, setViewExpense] = useState(null);

  useEffect(() => {
    fetchExpenses();
    expenseCategoryService.getAll().then(setCategories).catch((err) => console.error('Error fetching expense categories:', err));
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getAll();
      setExpenses(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    navigate('/expenses/add', { state: { editExpense: expense } });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.delete(id);
        fetchExpenses();
      } catch (err) {
        console.error('Error deleting expense:', err);
        alert('Failed to delete expense');
      }
    }
  };

  const formatCategory = (category) => {
    if (!category) return 'N/A';
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';
    return method.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getDocumentType = (documentUrl) => {
    if ((documentUrl || '').startsWith('data:image/')) return 'image';
    if ((documentUrl || '').startsWith('data:application/pdf')) return 'pdf';
    const cleanUrl = (documentUrl || '').split('?')[0].toLowerCase();
    if (/\.(png|jpe?g|gif|webp|bmp)$/.test(cleanUrl)) return 'image';
    if (cleanUrl.endsWith('.pdf')) return 'pdf';
    return 'other';
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = 
      expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    const matchesDateRange = 
      (!fromDate || new Date(expense.expenseDate) >= new Date(fromDate)) &&
      (!toDate || new Date(expense.expenseDate) <= new Date(toDate));
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  const calculateTotal = () => {
    return filteredExpenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      const tax = parseFloat(expense.taxAmount) || 0;
      return sum + amount + tax;
    }, 0);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expenses List</h1>
        <p className="text-gray-600 mt-2">View and manage all expense records</p>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => <option key={category.id} value={category.code}>{category.name}</option>)}
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="From Date"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="To Date"
            />
          </div>
          <button 
            onClick={() => navigate('/expenses/add')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            {searchTerm || categoryFilter || fromDate || toDate
              ? 'No expenses found matching your filters'
              : 'No expenses found. Click "Add Expense" to create one.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense For</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => {
                    const amount = parseFloat(expense.amount) || 0;
                    const tax = parseFloat(expense.taxAmount) || 0;
                    const total = amount + tax;
                    
                    return (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(expense.expenseDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">
                          {expense.referenceNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {formatCategory(expense.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="font-medium">{expense.title || 'N/A'}</div>
                          {expense.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {expense.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {expense.businessLocation || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatPaymentMethod(expense.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatCurrency(tax)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-teal-600">
                          {formatCurrency(total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setViewExpense(expense)}
                            className="mr-3 text-teal-600 hover:text-teal-900"
                            title="View details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(expense)}
                            className="mr-3 text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-teal-600">
                      ${calculateTotal().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredExpenses.length} of {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              </div>
            </div>
          </>
        )}
      </div>

      {viewExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Expense Details</h2>
                <p className="mt-1 text-sm text-gray-500">{viewExpense.referenceNo || 'Expense'} • {formatDate(viewExpense.expenseDate)}</p>
              </div>
              <button onClick={() => setViewExpense(null)} className="text-gray-500 hover:text-gray-900">Close</button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><span className="text-sm text-gray-500">Expense For</span><p className="font-medium text-gray-900">{viewExpense.title || 'N/A'}</p></div>
              <div><span className="text-sm text-gray-500">Category</span><p className="font-medium text-gray-900">{formatCategory(viewExpense.category)}</p></div>
              <div><span className="text-sm text-gray-500">Business Location</span><p className="font-medium text-gray-900">{viewExpense.businessLocation || 'N/A'}</p></div>
              <div><span className="text-sm text-gray-500">Payment Method</span><p className="font-medium text-gray-900">{formatPaymentMethod(viewExpense.paymentMethod)}</p></div>
              <div><span className="text-sm text-gray-500">Payment Account</span><p className="font-medium text-gray-900">{viewExpense.paymentAccount || 'N/A'}</p></div>
              <div><span className="text-sm text-gray-500">Expense Contact</span><p className="font-medium text-gray-900">{viewExpense.expenseContact || 'N/A'}</p></div>
              <div><span className="text-sm text-gray-500">Amount</span><p className="font-semibold text-gray-900">${(Number(viewExpense.amount) || 0).toFixed(2)}</p></div>
              <div><span className="text-sm text-gray-500">Tax</span><p className="font-semibold text-gray-900">${(Number(viewExpense.taxAmount) || 0).toFixed(2)} ({viewExpense.taxPercent || 0}%)</p></div>
              <div className="md:col-span-2"><span className="text-sm text-gray-500">Description</span><p className="whitespace-pre-wrap text-gray-900">{viewExpense.description || 'N/A'}</p></div>
              <div className="md:col-span-2"><span className="text-sm text-gray-500">Additional Notes</span><p className="whitespace-pre-wrap text-gray-900">{viewExpense.additionalNotes || 'N/A'}</p></div>
            </div>

            <div className="mt-6 border-t pt-5">
              <h3 className="mb-3 font-semibold text-gray-900">Attached Document</h3>
              {!viewExpense.documentUrl ? (
                <p className="text-sm text-gray-500">No document attached.</p>
              ) : getDocumentType(viewExpense.documentUrl) === 'image' ? (
                <img src={viewExpense.documentUrl} alt="Expense attachment" className="max-h-[32rem] max-w-full rounded border object-contain" />
              ) : getDocumentType(viewExpense.documentUrl) === 'pdf' ? (
                <iframe src={viewExpense.documentUrl} title="Expense PDF attachment" className="h-[32rem] w-full rounded border" />
              ) : (
                <a href={viewExpense.documentUrl} target="_blank" rel="noreferrer" className="text-teal-700 underline">Open attached document</a>
              )}
              {viewExpense.documentUrl && !viewExpense.documentUrl.startsWith('data:') && (
                <p className="mt-2 break-all text-xs text-gray-500">{viewExpense.documentUrl}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListExpenses;
