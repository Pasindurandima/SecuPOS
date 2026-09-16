import { formatCurrency as formatBusinessCurrency } from '../../context/BusinessSettingsContext';

export const formatCurrency = (value) => {
  return formatBusinessCurrency(value);
};

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const toSafeNumber = (value) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getDisplayName = (value, fallback = 'N/A') => {
  if (!value) return fallback;
  if (typeof value === 'string') return value || fallback;
  if (typeof value === 'object') {
    return value.name || value.fullName || value.firstName || value.customerName || value.label || fallback;
  }
  return String(value);
};

export const getNestedValue = (obj, path, fallback = null) => {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
};

export const sortByNewest = (items) =>
  [...items].sort((a, b) => {
    const aDate = new Date(getNestedValue(a, 'createdAt', getNestedValue(a, 'saleDate', getNestedValue(a, 'purchaseDate', getNestedValue(a, 'expenseDate', getNestedValue(a, 'adjustmentDate', 0))))));
    const bDate = new Date(getNestedValue(b, 'createdAt', getNestedValue(b, 'saleDate', getNestedValue(b, 'purchaseDate', getNestedValue(b, 'expenseDate', getNestedValue(b, 'adjustmentDate', 0))))));
    return bDate - aDate;
  });
