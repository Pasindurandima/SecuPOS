export const PERMISSIONS = {
  dashboard: 'dashboard',
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  units: 'units',
  customers: 'customers',
  suppliers: 'suppliers',
  sales: 'sales',
  purchases: 'purchases',
  expenses: 'expenses',
  reports: 'reports',
  users: 'users',
  roles: 'roles',
  settings: 'settings',
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const normalizePermission = (permission) => String(permission || '').trim().toLowerCase();

export const hasPermission = (permission, user = getCurrentUser()) => {
  if (!user) return false;
  if (normalizePermission(user.role) === 'admin') return true;
  const requiredPermission = normalizePermission(permission);
  return Array.isArray(user.permissions)
    && user.permissions.some(item => normalizePermission(item) === requiredPermission);
};

export const permissionForPath = (pathname) => {
  if (pathname === '/') return PERMISSIONS.dashboard;
  if (pathname.startsWith('/user-management/roles')) return PERMISSIONS.roles;
  if (pathname.startsWith('/user-management')) return PERMISSIONS.users;
  if (pathname.startsWith('/contacts/suppliers')) return PERMISSIONS.suppliers;
  if (pathname.startsWith('/contacts/customers') || pathname.startsWith('/contacts')) return PERMISSIONS.customers;
  if (pathname.startsWith('/expenses')) return PERMISSIONS.expenses;
  if (pathname.includes('/categories')) return PERMISSIONS.categories;
  if (pathname.includes('/brands')) return PERMISSIONS.brands;
  if (pathname.includes('/units')) return PERMISSIONS.units;
  if (pathname.startsWith('/products')) return PERMISSIONS.products;
  if (pathname.startsWith('/purchases')) return PERMISSIONS.purchases;
  if (pathname.startsWith('/sell')) return PERMISSIONS.sales;
  if (pathname.startsWith('/reports')) return PERMISSIONS.reports;
  if (pathname.startsWith('/settings')) return PERMISSIONS.settings;
  if (pathname.startsWith('/payment-accounts')) return PERMISSIONS.settings;
  if (pathname.startsWith('/notification-templates')) return PERMISSIONS.settings;
  if (pathname.startsWith('/stock-transfers') || pathname.startsWith('/stock-adjustment')) return PERMISSIONS.products;
  if (pathname.startsWith('/hrm') || pathname.startsWith('/essentials')) return PERMISSIONS.dashboard;
  return null;
};

export const getFirstAccessiblePath = (user = getCurrentUser()) => {
  if (normalizePermission(user?.role) === 'admin') return '/';

  const preferredPaths = [
    ['dashboard', '/'],
    ['sales', '/sell'],
    ['products', '/products'],
    ['customers', '/contacts/customers'],
    ['suppliers', '/contacts/suppliers'],
    ['purchases', '/purchases'],
    ['expenses', '/expenses'],
    ['reports', '/reports'],
    ['users', '/user-management/users'],
    ['roles', '/user-management/roles'],
    ['settings', '/settings'],
  ];

  const permissions = Array.isArray(user?.permissions)
    ? user.permissions.map(normalizePermission)
    : [];
  return preferredPaths.find(([permission]) => permissions.includes(permission))?.[1] || '/sign-in';
};
