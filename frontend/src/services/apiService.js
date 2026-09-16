import api from '../config/api';

// Auth Services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Backend returns data nested in response.data.data
    const { data } = response.data;
    if (data && data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.id || data.userId,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || data.roleName,
        permissions: data.permissions || []
      }));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// User Management Services
export const userService = {
  getCurrent: async () => {
    const response = await api.get('/users/me');
    return response?.data?.data;
  },
  updateCurrent: async (userData) => {
    const response = await api.put('/users/me', userData);
    return response?.data?.data;
  },
  changePassword: async (passwordData) => {
    const response = await api.put('/users/me/password', passwordData);
    return response?.data;
  },
  getAll: async () => {
    const response = await api.get('/users');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response?.data?.data || response?.data;
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response?.data?.data || response?.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response?.data?.data || response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response?.data;
  },
};

// Product Services
export const productService = {
  getAll: async () => {
    const response = await api.get('/products');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response?.data?.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response?.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response?.data;
  },

  search: async (searchTerm) => {
    const response = await api.get(`/products/search?query=${searchTerm}`);
    return response?.data?.data || [];
  },

  getLowStock: async () => {
    const response = await api.get('/products/low-stock');
    return response?.data?.data || [];
  },
};

// Sale Services
export const saleService = {
  getAll: async () => {
    const response = await api.get('/sales');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response?.data?.data;
  },

  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response?.data;
  },

  update: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response?.data;
  },

  getToday: async () => {
    const response = await api.get('/sales/today');
    return response?.data?.data || [];
  },

  getTotalRevenue: async () => {
    const response = await api.get('/sales/revenue');
    return response?.data?.data;
  },
};

// Sale Return Services
export const saleReturnService = {
  getAll: async () => {
    const response = await api.get('/sale-returns');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/sale-returns/${id}`);
    return response?.data?.data;
  },

  create: async (returnData) => {
    const response = await api.post('/sale-returns', returnData);
    return response?.data?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sale-returns/${id}`);
    return response?.data;
  },
};

// Shipment Services
export const shipmentService = {
  getAll: async () => {
    const response = await api.get('/shipments');
    return response?.data?.data || [];
  },
  getById: async (id) => {
    const response = await api.get(`/shipments/${id}`);
    return response?.data?.data;
  },
  create: async (shipmentData) => {
    const response = await api.post('/shipments', shipmentData);
    return response?.data?.data;
  },
  update: async (id, shipmentData) => {
    const response = await api.put(`/shipments/${id}`, shipmentData);
    return response?.data?.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/shipments/${id}/status`, { status });
    return response?.data?.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/shipments/${id}`);
    return response?.data;
  },
};

// Draft Services (Drafts are sales with status = DRAFT)
export const draftService = {
  getAll: async () => {
    const response = await api.get('/sales');
    // Filter only drafts on frontend
    const allSales = response?.data?.data || [];
    return allSales.filter(sale => sale.status === 'DRAFT');
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response?.data?.data;
  },

  create: async (draftData) => {
    // Set status to DRAFT
    const response = await api.post('/sales', {
      ...draftData,
      status: 'DRAFT'
    });
    return response?.data;
  },

  update: async (id, draftData) => {
    const response = await api.put(`/sales/${id}`, {
      ...draftData,
      status: 'DRAFT'
    });
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response?.data;
  },

  convertToSale: async (id, saleData) => {
    // Update draft status to COMPLETED
    const response = await api.put(`/sales/${id}`, {
      ...saleData,
      status: 'COMPLETED'
    });
    return response?.data;
  },
};

// Quotation Services - NEW dedicated quotations table
export const quotationService = {
  getAll: () => api.get('/quotations'),
  
  getById: (id) => api.get(`/quotations/${id}`),

  create: (quotationData) => api.post('/quotations', quotationData),

  update: (id, quotationData) => api.put(`/quotations/${id}`, quotationData),

  delete: (id) => api.delete(`/quotations/${id}`),

  convertToSale: (id) => api.post(`/quotations/${id}/convert-to-sale`),
  
  updateStatus: (id, status) => api.put(`/quotations/${id}/status?status=${status}`),
  
  searchQuotations: (searchTerm) => api.get(`/quotations/search?searchTerm=${searchTerm}`),
  
  getByCustomer: (customerId) => api.get(`/quotations/customer/${customerId}`),
  
  getByStatus: (status) => api.get(`/quotations/status/${status}`)
};

// Customer Services
export const customerService = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response?.data?.data;
  },

  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response?.data;
  },

  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response?.data;
  },

  search: async (searchTerm) => {
    const response = await api.get(`/customers/search?query=${searchTerm}`);
    return response?.data?.data || [];
  },
};

// Supplier Services
export const supplierService = {
  getAll: async () => {
    const response = await api.get('/suppliers');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response?.data?.data;
  },

  create: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response?.data;
  },

  update: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response?.data;
  },
};

// Purchase Services
export const purchaseService = {
  getAll: async () => {
    const response = await api.get('/purchases');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response?.data?.data;
  },

  create: async (purchaseData) => {
    const response = await api.post('/purchases', purchaseData);
    return response?.data;
  },

  update: async (id, purchaseData) => {
    const response = await api.put(`/purchases/${id}`, purchaseData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/purchases/${id}`);
    return response?.data;
  },

  recordPayment: async (id, paymentData) => {
    const response = await api.put(`/purchases/${id}/payment`, paymentData);
    return response?.data?.data;
  },
};

// Purchase Return Services
export const purchaseReturnService = {
  getAll: async () => {
    const response = await api.get('/purchase-returns');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/purchase-returns/${id}`);
    return response?.data?.data;
  },

  create: async (purchaseReturnData) => {
    const response = await api.post('/purchase-returns', purchaseReturnData);
    return response?.data;
  },

  update: async (id, purchaseReturnData) => {
    const response = await api.put(`/purchase-returns/${id}`, purchaseReturnData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/purchase-returns/${id}`);
    return response?.data;
  },
};

// Category Services
export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response?.data?.data;
  },

  create: async (categoryData) => {
    console.log('categoryService.create - Sending data:', categoryData);
    const response = await api.post('/categories', categoryData);
    console.log('categoryService.create - Response:', response);
    return response?.data;
  },

  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response?.data;
  },
};

// Brand Services
export const brandService = {
  getAll: async () => {
    const response = await api.get('/brands');
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },

  getById: async (id) => {
    const response = await api.get(`/brands/${id}`);
    return response?.data?.data;
  },

  create: async (brandData) => {
    console.log('brandService.create - Sending data:', brandData);
    console.log('brandService.create - JSON:', JSON.stringify(brandData));
    const response = await api.post('/brands', brandData);
    console.log('brandService.create - Response:', response);
    return response?.data;
  },

  update: async (id, brandData) => {
    const response = await api.put(`/brands/${id}`, brandData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/brands/${id}`);
    return response?.data;
  },
};

// Expense Services
export const expenseService = {
  getAll: async () => {
    const response = await api.get('/expenses');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response?.data?.data;
  },

  create: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response?.data;
  },

  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response?.data;
  },

  getTotalExpenses: async () => {
    const response = await api.get('/expenses/total');
    return response?.data?.data;
  },
};

// Expense Category Services
export const expenseCategoryService = {
  getAll: async () => {
    const response = await api.get('/expense-categories');
    return response?.data?.data || [];
  },

  create: async (categoryData) => {
    const response = await api.post('/expense-categories', categoryData);
    return response?.data?.data;
  },

  update: async (id, categoryData) => {
    const response = await api.put(`/expense-categories/${id}`, categoryData);
    return response?.data?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expense-categories/${id}`);
    return response?.data;
  },
};

// Dashboard Statistics
export const dashboardService = {
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response?.data?.data;
  },
  getEssentialsOverview: async () => {
    const response = await api.get('/dashboard/essentials');
    return response?.data?.data;
  },
  getStatistics: async () => {
    const response = await api.get('/dashboard/statistics');
    return response?.data?.data;
  },

  getRecentSales: async () => {
    const response = await api.get('/dashboard/recent-sales');
    return response?.data?.data || [];
  },

  getTopProducts: async () => {
    const response = await api.get('/dashboard/top-products');
    return response?.data?.data || [];
  },
};

// Notification Services
export const notificationService = {
  getTemplates: async () => (await api.get('/notifications/templates')).data?.data || [],
  createTemplate: async (data) => (await api.post('/notifications/templates', data)).data?.data,
  updateTemplate: async (id, data) => (await api.put(`/notifications/templates/${id}`, data)).data?.data,
  deleteTemplate: async (id) => (await api.delete(`/notifications/templates/${id}`)).data,
  getAll: async () => {
    const response = await api.get('/notifications');
    return response?.data?.data || [];
  },

  getUnread: async () => {
    const response = await api.get('/notifications/unread');
    return response?.data?.data || [];
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response?.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response?.data;
  },

  getCount: async () => {
    const response = await api.get('/notifications/count');
    return response?.data?.data;
  },
};

// Label Print Services
export const labelPrintService = {
  create: async (data) => {
    const response = await api.post('/label-prints', data);
    return response?.data?.data;
  },

  getAll: async () => {
    const response = await api.get('/label-prints');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/label-prints/${id}`);
    return response?.data?.data;
  },

  getByProductId: async (productId) => {
    const response = await api.get(`/label-prints/product/${productId}`);
    return response?.data?.data || [];
  },

  getByDateRange: async (startDate, endDate) => {
    const response = await api.get('/label-prints/date-range', {
      params: { startDate, endDate }
    });
    return response?.data?.data || [];
  },

  getTotalForProduct: async (productId) => {
    const response = await api.get(`/label-prints/product/${productId}/total`);
    return response?.data?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/label-prints/${id}`);
    return response?.data;
  },
};

// Unit Services
export const unitService = {
  getAll: async () => {
    const response = await api.get('/units');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/units/${id}`);
    return response?.data?.data;
  },

  create: async (unitData) => {
    const response = await api.post('/units', unitData);
    return response?.data;
  },

  update: async (id, unitData) => {
    const response = await api.put(`/units/${id}`, unitData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/units/${id}`);
    return response?.data;
  },

  search: async (query) => {
    const response = await api.get('/units/search', {
      params: { query }
    });
    return response?.data?.data || [];
  },
};

// Payment Account and Financial Report Services
export const paymentAccountService = {
  getAll: async () => (await api.get('/payment-accounts')).data?.data || [],
  create: async (data) => (await api.post('/payment-accounts', data)).data?.data,
  update: async (id, data) => (await api.put(`/payment-accounts/${id}`, data)).data?.data,
  delete: async (id) => (await api.delete(`/payment-accounts/${id}`)).data,
  getReport: async (params = {}) => (await api.get('/payment-accounts/report', { params })).data?.data,
};

// Business Location Services
export const businessLocationService = {
  getAll: async () => {
    const response = await api.get('/business-locations');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/business-locations/${id}`);
    return response?.data?.data;
  },

  create: async (locationData) => {
    const response = await api.post('/business-locations', locationData);
    return response?.data?.data;
  },

  update: async (id, locationData) => {
    const response = await api.put(`/business-locations/${id}`, locationData);
    return response?.data?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/business-locations/${id}`);
    return response?.data;
  },
};

export const settingsService = {
  getProfile: async () => (await api.get('/settings/profile')).data?.data,
  saveProfile: async (data) => (await api.put('/settings/profile', data)).data?.data,
  getPrinters: async () => (await api.get('/settings/printers')).data?.data || [],
  savePrinter: async (data) => (await api.post('/settings/printers', data)).data?.data,
  deletePrinter: async (id) => (await api.delete(`/settings/printers/${id}`)).data,
  getTaxRates: async () => (await api.get('/settings/tax-rates')).data?.data || [],
  saveTaxRate: async (data) => (await api.post('/settings/tax-rates', data)).data?.data,
  deleteTaxRate: async (id) => (await api.delete(`/settings/tax-rates/${id}`)).data,
};

// Stock Adjustment Services
export const stockAdjustmentService = {
  getAll: async (location = null) => {
    const url = location ? `/stock-adjustments?location=${location}` : '/stock-adjustments';
    const response = await api.get(url);
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/stock-adjustments/${id}`);
    return response?.data?.data;
  },

  create: async (adjustmentData) => {
    const response = await api.post('/stock-adjustments', adjustmentData);
    return response?.data;
  },

  update: async (id, adjustmentData) => {
    const response = await api.put(`/stock-adjustments/${id}`, adjustmentData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/stock-adjustments/${id}`);
    return response?.data;
  },

  getByLocation: async (location) => {
    const response = await api.get(`/stock-adjustments?location=${location}`);
    return response?.data?.data || [];
  },
};

// Stock Transfer Services
export const stockTransferService = {
  getAll: async () => {
    const response = await api.get('/stock-transfers');
    return response?.data?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/stock-transfers/${id}`);
    return response?.data?.data;
  },

  create: async (transferData) => {
    const response = await api.post('/stock-transfers', transferData);
    return response?.data;
  },

  update: async (id, transferData) => {
    const response = await api.put(`/stock-transfers/${id}`, transferData);
    return response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/stock-transfers/${id}`);
    return response?.data;
  },
};

// Role Services
export const roleService = {
  getAll: async () => {
    const response = await api.get('/roles');
    return response?.data?.data || response?.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response?.data?.data || response?.data;
  },

  getByName: async (name) => {
    const response = await api.get(`/roles/name/${name}`);
    return response?.data?.data || response?.data;
  },

  create: async (roleData) => {
    const response = await api.post('/roles', roleData);
    return response?.data?.data || response?.data;
  },

  update: async (id, roleData) => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response?.data?.data || response?.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response?.data;
  },

  initializeDefaults: async () => {
    const response = await api.post('/roles/initialize');
    return response?.data;
  },
};

// Report Services
export const reportService = {
  getProfitLossReport: async (startDate, endDate) => {
    let url = '/reports/profit-loss';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response?.data?.data || {};
  },
};
