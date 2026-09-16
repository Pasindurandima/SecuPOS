import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../context/BusinessSettingsContext';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { expenseService } from '../../services/apiService';
import BusinessLocationSelect from '../../components/BusinessLocationSelect';
import ExpenseCategorySelect from '../../components/ExpenseCategorySelect';

const AddExpenses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editExpense = location.state?.editExpense;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    businessLocation: '',
    category: '',
    paymentMethod: '',
    paymentAccount: '',
    taxPercent: 0,
    expenseContact: '',
    additionalNotes: '',
    documentUrl: ''
  });

  useEffect(() => {
    if (editExpense) {
      setFormData({
        title: editExpense.title || '',
        description: editExpense.description || '',
        amount: editExpense.amount || '',
        expenseDate: editExpense.expenseDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        businessLocation: editExpense.businessLocation || '',
        category: editExpense.category || '',
        paymentMethod: editExpense.paymentMethod || '',
        paymentAccount: editExpense.paymentAccount || '',
        taxPercent: editExpense.taxPercent || 0,
        expenseContact: editExpense.expenseContact || '',
        additionalNotes: editExpense.additionalNotes || '',
        documentUrl: editExpense.documentUrl || '',
      });
    }
  }, [editExpense]);

  const calculateTax = (amount, taxPercent) => {
    return ((parseFloat(amount) || 0) * (parseFloat(taxPercent) || 0)) / 100;
  };

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const taxAmount = calculateTax(formData.amount, formData.taxPercent);
    return amount + taxAmount;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaxChange = (e) => {
    const taxPercent = parseFloat(e.target.value);
    setFormData(prev => ({
      ...prev,
      taxPercent: taxPercent
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only PDF, JPG, and PNG documents are supported');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('The attached document must be smaller than 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, documentUrl: reader.result }));
    reader.onerror = () => setError('Failed to read the attached document');
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Expense title is required');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Valid amount is required');
      return false;
    }
    if (!formData.expenseDate) {
      setError('Expense date is required');
      return false;
    }
    if (!formData.businessLocation) {
      setError('Business location is required');
      return false;
    }
    if (!formData.category) {
      setError('Expense category is required');
      return false;
    }
    if (!formData.paymentMethod) {
      setError('Payment method is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const taxAmount = calculateTax(formData.amount, formData.taxPercent);
      
      // Convert date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
      const expenseDateTime = formData.expenseDate + 'T00:00:00';
      
      const expenseData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        expenseDate: expenseDateTime,
        businessLocation: formData.businessLocation,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        paymentAccount: formData.paymentAccount || null,
        taxPercent: parseFloat(formData.taxPercent) || 0,
        taxAmount: taxAmount,
        expenseContact: formData.expenseContact || null,
        additionalNotes: formData.additionalNotes || null,
        documentUrl: formData.documentUrl || null
      };

      if (editExpense) {
        await expenseService.update(editExpense.id, expenseData);
      } else {
        await expenseService.create(expenseData);
      }
      navigate('/expenses/list');
    } catch (err) {
      console.error('Error creating expense:', err);
      setError(err.response?.data?.message || 'Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/expenses/list');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{editExpense ? 'Edit Expense' : 'Add Expense'}</h1>
        <p className="text-gray-600 mt-2">Record a new expense transaction</p>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference No *</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                placeholder="Auto generated"
                readOnly
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expense Date *</label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Location *</label>
              <BusinessLocationSelect
                name="businessLocation"
                value={formData.businessLocation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expense Category *</label>
              <ExpenseCategorySelect value={formData.category} onChange={handleInputChange} required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expense For (Title) *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Brief description of expense"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Detailed description..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
              <select 
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Payment Method</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="CHECK">Check</option>
                <option value="ONLINE_PAYMENT">Online Payment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Account</label>
              <input
                name="paymentAccount"
                value={formData.paymentAccount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter payment account"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Tax (%)</label>
              <select 
                name="taxPercent"
                value={formData.taxPercent}
                onChange={handleTaxChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="0">No Tax</option>
                <option value="15">VAT 15%</option>
                <option value="5">VAT 5%</option>
                <option value="18">GST 18%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expense Contact</label>
            <input
              type="text"
              name="expenseContact"
              value={formData.expenseContact}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Contact person or company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Add any additional notes..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attach Document (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({formData.taxPercent}%):</span>
                  <span className="font-medium">{formatCurrency(calculateTax(formData.amount, formData.taxPercent))}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-teal-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : editExpense ? 'Update Expense' : 'Save Expense'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenses;
