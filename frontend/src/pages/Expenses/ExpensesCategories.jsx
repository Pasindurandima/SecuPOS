import React, { useEffect, useState } from 'react';
import { expenseCategoryService } from '../../services/apiService';

const emptyForm = { name: '', code: '', description: '' };

const ExpensesCategories = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      setCategories(await expenseCategoryService.getAll());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load expense categories');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const saved = editingId
        ? await expenseCategoryService.update(editingId, formData)
        : await expenseCategoryService.create(formData);
      setCategories((current) => editingId
        ? current.map((category) => category.id === editingId ? saved : category)
        : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setFormData(emptyForm);
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save expense category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name || '', code: category.code || '', description: category.description || '' });
    setError('');
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete ${category.name}? Existing expenses will remain linked to this code.`)) return;
    try {
      await expenseCategoryService.delete(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      if (editingId === category.id) {
        setEditingId(null);
        setFormData(emptyForm);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete expense category');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expense Categories</h1>
        <p className="mt-2 text-gray-600">Manage the categories used when recording expenses</p>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Category Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Office Supplies" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Category Code *</label>
              <input name="code" value={formData.code} onChange={handleChange} required placeholder="e.g., OFFICE_SUPPLIES" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Brief description of category" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:bg-gray-400">{saving ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData(emptyForm); }} className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">Cancel</button>}
            </div>
          </form>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Existing Categories</h2>
          {loading ? <p className="py-8 text-center text-gray-500">Loading categories...</p> : categories.length === 0 ? <p className="py-8 text-center text-gray-500">No expense categories created yet.</p> : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100">
                  <div>
                    <h3 className="font-medium text-gray-800">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.code}</p>
                    {category.description && <p className="mt-1 text-xs text-gray-600">{category.description}</p>}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button onClick={() => handleDelete(category)} className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesCategories;
