import React, { useEffect, useState } from 'react';
import { expenseCategoryService } from '../services/apiService';

const ExpenseCategorySelect = ({ value, onChange, required = false, className }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    expenseCategoryService.getAll()
      .then((data) => {
        if (mounted) setCategories(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error('Failed to load expense categories:', error));
    return () => { mounted = false; };
  }, []);

  return (
    <select
      name="category"
      value={value ?? ''}
      onChange={onChange}
      required={required}
      className={className || 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'}
    >
      <option value="">Select Category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.code}>{category.name}</option>
      ))}
    </select>
  );
};

export default ExpenseCategorySelect;
