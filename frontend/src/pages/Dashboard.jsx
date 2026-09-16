import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Calendar, Database, FileText, Grid, LogOut, Package, RotateCcw, TrendingUp, Users, DollarSign } from 'lucide-react';
import { authService, dashboardService } from '../services/apiService';
import { formatCurrency, formatDate, useBusinessSettings } from '../context/BusinessSettingsContext';

const emptyOverview = { totalProducts: 0, totalCustomers: 0, totalSuppliers: 0, totalSales: 0, totalPurchases: 0, totalExpenses: 0, invoiceDue: 0, netProfit: 0, totalPurchaseReturns: 0, totalPurchaseReturnsPaid: null, totalSaleReturns: 0, totalSaleReturnsPaid: null, monthlySales: [], recentSales: [] };

export default function Dashboard() {
  const navigate = useNavigate();
  const settings = useBusinessSettings();
  const user = authService.getCurrentUser();
  const [overview, setOverview] = useState(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getOverview()
      .then((data) => setOverview({ ...emptyOverview, ...data }))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    ['TOTAL SALES', formatCurrency(overview.totalSales), FileText, 'bg-green-600', 'bg-green-100'],
    ['NET PROFIT', formatCurrency(overview.netProfit), Database, overview.netProfit >= 0 ? 'bg-purple-600' : 'bg-red-600', overview.netProfit >= 0 ? 'bg-purple-100' : 'bg-red-100'],
    ['INVOICE DUE', formatCurrency(overview.invoiceDue), FileText, 'bg-orange-600', 'bg-orange-100'],
    ['TOTAL PURCHASE', formatCurrency(overview.totalPurchases), Package, 'bg-blue-600', 'bg-blue-100'],
    ['PRODUCT COUNT', overview.totalProducts, Package, 'bg-teal-600', 'bg-teal-100'],
    ['EXPENSE', formatCurrency(overview.totalExpenses), DollarSign, 'bg-red-600', 'bg-red-100'],
    ['CUSTOMER COUNT', overview.totalCustomers, Users, 'bg-indigo-600', 'bg-indigo-100'],
    ['SUPPLIER COUNT', overview.totalSuppliers, Users, 'bg-cyan-600', 'bg-cyan-100'],
  ];

  const returns = [
    ['TOTAL PURCHASE RETURN', overview.totalPurchaseReturns, overview.totalPurchaseReturnsPaid, 'bg-red-600'],
    ['TOTAL SELL RETURN', overview.totalSaleReturns, overview.totalSaleReturnsPaid, 'bg-red-600'],
  ];

  return <div className="flex-1 overflow-y-auto bg-gray-100">
    <div className="bg-gradient-to-r from-teal-600 to-teal-700 shadow-md"><div className="flex items-center justify-between px-6 py-4"><h2 className="text-2xl font-semibold text-white">Welcome {user?.firstName || user?.username || 'User'},</h2><div className="flex items-center space-x-2"><button type="button" title="Customers" onClick={() => navigate('/contacts/customers')} className="rounded-lg bg-blue-600 p-2 hover:bg-blue-700"><Users className="h-5 w-5 text-white" /></button><button type="button" title="Reports" onClick={() => navigate('/reports')} className="rounded-lg bg-pink-600 p-2 hover:bg-pink-700"><TrendingUp className="h-5 w-5 text-white" /></button><button type="button" title="Products" onClick={() => navigate('/products/list')} className="rounded-lg bg-pink-600 p-2 hover:bg-pink-700"><Grid className="h-5 w-5 text-white" /></button><button type="button" title="Open POS" onClick={() => navigate('/sell/pos')} className="rounded-lg bg-pink-600 p-2 font-semibold text-white">POS</button><button type="button" title="Sales" onClick={() => navigate('/sell/all-sales')} className="rounded-lg bg-pink-600 p-2"><FileText className="h-5 w-5 text-white" /></button><button type="button" title="Notifications" onClick={() => navigate('/notification-templates')} className="rounded-lg bg-pink-600 p-2"><Bell className="h-5 w-5 text-white" /></button><button type="button" title="Sign out" onClick={() => navigate('/signout')} className="rounded-lg bg-pink-600 p-2"><LogOut className="h-5 w-5 text-white" /></button></div></div></div>
    <div className="p-6">{error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}{loading ? <div className="flex h-64 items-center justify-center text-gray-600">Loading dashboard...</div> : <>
      <div className="mb-6 flex justify-end"><button type="button" title="Date filter is based on the current financial-year data" className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white"><Calendar className="h-4 w-4" />Current financial year</button></div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{cards.map(([title, value, Icon, color, iconBg]) => <div key={title} className="rounded-lg bg-white p-6 shadow-md"><div className="flex items-center justify-between"><div className={`rounded-lg p-3 ${iconBg}`}><Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} /></div></div><p className="mt-4 text-sm font-semibold uppercase text-gray-600">{title}</p><p className="mt-1 text-2xl font-bold text-gray-900">{value}</p></div>)}</div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">{returns.map(([title, total, paid, color]) => <div key={title} className="rounded-lg bg-white p-6 shadow-md"><div className="mb-4 w-fit rounded-lg bg-red-100 p-3"><RotateCcw className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} /></div><p className="text-sm font-semibold uppercase text-gray-600">{title}</p><p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(total)}</p><div className="mt-4 space-y-1 text-sm text-gray-600"><p>Total Return: {formatCurrency(total)}</p><p>{paid == null ? 'Paid amount is not tracked for returns' : `Paid: ${formatCurrency(paid)}`}</p></div></div>)}</div>
      <section className="rounded-lg bg-white p-6 shadow-md"><h3 className="mb-6 w-fit rounded-lg bg-green-600 px-4 py-2 text-xl font-bold text-white">Sales Current Financial Year</h3><div className="h-96 min-w-0"><ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}><LineChart data={overview.monthlySales}><CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="month" /><YAxis tickFormatter={(value) => formatCurrency(value)} label={{ value: `Total Sales (${settings.currency})`, angle: -90, position: 'insideLeft' }} /><Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `${label} ${new Date().getFullYear()}`} /><Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} /></LineChart></ResponsiveContainer></div></section>
      <section className="mt-6 rounded-lg bg-white p-6 shadow-md"><h3 className="mb-6 w-fit rounded-lg bg-blue-600 px-4 py-2 text-xl font-bold text-white">Recent Sales</h3>{overview.recentSales.length === 0 ? <p className="py-8 text-center text-gray-500">No sales data available</p> : <div className="overflow-x-auto"><table className="w-full"><thead className="border-b bg-gray-50"><tr>{['Invoice No', 'Date', 'Customer', 'Total Amount', 'Paid Amount', 'Payment Status', 'Payment Method'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-200">{overview.recentSales.map((sale) => <tr key={sale.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm font-medium">{sale.invoiceNumber || `INV-${sale.id}`}</td><td className="px-4 py-3 text-sm text-gray-600">{formatDate(sale.saleDate)}</td><td className="px-4 py-3 text-sm text-gray-600">{sale.customerName || 'Walk-in Customer'}</td><td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrency(sale.total)}</td><td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(sale.paidAmount)}</td><td className="px-4 py-3 text-center text-sm">{sale.paymentStatus}</td><td className="px-4 py-3 text-center text-sm text-gray-600">{sale.paymentMethod}</td></tr>)}</tbody></table></div>}</section>
    </>}</div>
  </div>;
}
