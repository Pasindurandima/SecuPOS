import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaShoppingCart, FaMoneyBillWave, FaUsers, FaChartLine, FaWarehouse } from 'react-icons/fa';
import { dashboardService } from '../services/apiService';
import { formatCurrency, formatDate } from '../context/BusinessSettingsContext';

const emptyOverview = {
  totalProducts: 0,
  totalCustomers: 0,
  lowStockCount: 0,
  todaySalesCount: 0,
  todaySales: 0,
  lowStockProducts: [],
  recentActivities: [],
};

const quickActions = [
  { title: 'Quick Sale', description: 'Process a new sale transaction quickly', label: 'Start Selling', path: '/sell/pos', icon: FaShoppingCart, classes: 'from-teal-500 to-teal-600 text-teal-600' },
  { title: 'Add Product', description: 'Add a new product to inventory', label: 'Add Now', path: '/products/add', icon: FaBox, classes: 'from-blue-500 to-blue-600 text-blue-600' },
  { title: 'Add Customer', description: 'Register a new customer', label: 'Add Customer', path: '/contacts/customers', icon: FaUsers, classes: 'from-purple-500 to-purple-600 text-purple-600' },
  { title: 'Record Expense', description: 'Add a new expense entry', label: 'Record', path: '/expenses/add', icon: FaMoneyBillWave, classes: 'from-orange-500 to-orange-600 text-orange-600' },
  { title: 'Stock Adjustment', description: 'Adjust inventory levels', label: 'Adjust Stock', path: '/stock-adjustment/add', icon: FaWarehouse, classes: 'from-green-500 to-green-600 text-green-600' },
  { title: 'View Reports', description: 'Access business reports', label: 'View Reports', path: '/reports', icon: FaChartLine, classes: 'from-pink-500 to-pink-600 text-pink-600' },
];

const quickLinks = [
  ['POS System', 'Point of Sale', '/sell/pos'],
  ['Inventory', 'Stock Management', '/products/list'],
  ['Invoices', 'Sales and invoices', '/sell/all-sales'],
  ['Analytics', 'Business insights', '/reports'],
  ['Suppliers', 'Manage vendors', '/contacts/suppliers'],
  ['Payments', 'Payment accounts', '/payment-accounts/list'],
];

const activityStyles = {
  sale: ['border-green-500', 'bg-green-50'],
  product: ['border-blue-500', 'bg-blue-50'],
  expense: ['border-orange-500', 'bg-orange-50'],
  stock: ['border-purple-500', 'bg-purple-50'],
};

export default function Essentials() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getEssentialsOverview()
      .then((data) => setOverview({ ...emptyOverview, ...data }))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Failed to load Essentials data'))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    ['Total Products', overview.totalProducts, 'text-blue-600', 'bg-blue-50', FaBox],
    ["Today's Sales", formatCurrency(overview.todaySales), 'text-green-600', 'bg-green-50', FaShoppingCart],
    ['Active Customers', overview.totalCustomers, 'text-purple-600', 'bg-purple-50', FaUsers],
    ['Low Stock Items', overview.lowStockCount, 'text-orange-600', 'bg-orange-50', FaWarehouse],
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Business Essentials</h1>
        <p className="mt-2 text-gray-600">Quick access to essential business tools and live business data</p>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map(({ title, description, label, path, icon: Icon, classes }) => (
          <div key={path} className={`cursor-pointer rounded-lg bg-gradient-to-br p-6 text-white shadow-lg transition-shadow hover:shadow-xl ${classes.split(' ').slice(0, 2).join(' ')}`} onClick={() => navigate(path)}>
            <Icon className="mb-3 text-4xl opacity-80" />
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm opacity-90">{description}</p>
            <button type="button" onClick={(event) => { event.stopPropagation(); navigate(path); }} className={`mt-4 rounded-lg bg-white px-4 py-2 font-semibold transition-colors hover:bg-gray-100 ${classes.split(' ')[2]}`}>{label}</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Stats</h2>
          <div className="space-y-4">
            {stats.map(([label, value, textColor, background, Icon]) => (
              <div key={label} className={`flex items-center justify-between rounded-lg p-3 ${background}`}>
                <div><p className="text-sm text-gray-600">{label}</p><p className={`text-2xl font-bold ${textColor}`}>{loading ? '...' : value}</p></div>
                <Icon className={`text-3xl opacity-70 ${textColor}`} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Recent Activities</h2>
          {loading ? <p className="py-6 text-center text-gray-500">Loading activities...</p> : overview.recentActivities.length === 0 ? <p className="py-6 text-center text-gray-500">No recent activities found.</p> : <div className="space-y-3">{overview.recentActivities.map((activity, index) => { const [border, background] = activityStyles[activity.type] || activityStyles.product; return <div key={`${activity.type}-${activity.date}-${index}`} className={`rounded border-l-4 p-3 ${border} ${background}`}><p className="text-sm font-semibold text-gray-900">{activity.title}</p><p className="text-xs text-gray-600">{activity.detail}{activity.amount != null ? ` - ${formatCurrency(activity.amount)}` : ''}</p><p className="mt-1 text-xs text-gray-500">{formatDate(activity.date)}</p></div>; })}</div>}
        </section>

        <section className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">{quickLinks.map(([title, description, path]) => <button key={path} type="button" onClick={() => navigate(path)} className="rounded-lg border border-gray-300 p-3 text-left transition-colors hover:border-teal-500 hover:bg-teal-50"><p className="text-sm font-semibold text-gray-900">{title}</p><p className="mt-1 text-xs text-gray-500">{description}</p></button>)}</div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Notifications</h2>
          {loading ? <p className="py-6 text-center text-gray-500">Loading notifications...</p> : overview.lowStockProducts.length === 0 ? <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">No low-stock products right now.</div> : <div className="space-y-3"><div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3"><p className="text-sm font-semibold text-yellow-900">Low stock alert</p><p className="mt-1 text-xs text-yellow-700">{overview.lowStockProducts.length} product(s) need restocking.</p></div><button type="button" onClick={() => navigate('/products/list')} className="text-sm font-medium text-teal-700 hover:text-teal-900">View low-stock products</button></div>}
        </section>
      </div>
    </div>
  );
}
