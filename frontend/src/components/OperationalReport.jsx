import React, { useEffect, useMemo, useState } from 'react';
import { expenseService, productService, purchaseService, saleService, stockAdjustmentService } from '../services/apiService';
import { formatCurrency } from '../pages/Reports/reportUtils';

const money = (value) => formatCurrency(Number(value || 0));
const dateText = (value) => value ? new Date(value).toLocaleDateString() : '-';
const isCompletedSale = (sale) => sale?.status === 'COMPLETED' || sale?.status === 'completed';
const isReceivedPurchase = (purchase) => purchase?.status === 'RECEIVED' || purchase?.status === 'received';

export default function OperationalReport({ mode }) {
  const [data, setData] = useState({ sales: [], purchases: [], expenses: [], products: [], adjustments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const requests = [saleService.getAll(), purchaseService.getAll(), expenseService.getAll(), productService.getAll()];
    if (mode === 'adjustments') requests.push(stockAdjustmentService.getAll());
    Promise.all(requests)
      .then(([sales, purchases, expenses, products, adjustments = []]) => setData({ sales: sales || [], purchases: purchases || [], expenses: expenses || [], products: products || [], adjustments: adjustments || [] }))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Failed to load report data'))
      .finally(() => setLoading(false));
  }, [mode]);

  const rows = useMemo(() => {
    if (mode === 'product-purchase' || mode === 'product-sell') {
      const map = new Map();
      const source = mode === 'product-purchase' ? data.purchases.filter(isReceivedPurchase) : data.sales.filter(isCompletedSale);
      source.forEach((record) => (record.items || []).forEach((item) => {
        const product = item.product || {};
        const key = product.id || product.sku || product.name;
        const current = map.get(key) || { product: product.name || 'Unknown product', sku: product.sku || '-', quantity: 0, value: 0, cost: 0 };
        const quantity = Number(item.quantity || 0);
        const value = Number(item.total || item.subtotal || item.lineTotal || 0);
        current.quantity += quantity;
        current.value += value;
        current.cost += quantity * Number(product.costPrice || item.unitCost || 0);
        map.set(key, current);
      }));
      return [...map.values()].map((row) => ({ ...row, average: row.quantity ? row.value / row.quantity : 0, profit: row.value - row.cost }));
    }
    if (mode === 'adjustments') return data.adjustments.map((item) => ({ date: item.adjustmentDate, reference: item.referenceNumber, location: item.location, type: (item.items || []).some((row) => row.adjustmentType === 'SUBTRACT') ? 'Decrease' : 'Increase', quantity: item.totalQuantity, amount: item.totalAmount, reason: item.reason }));
    if (mode === 'items') return data.products.filter((product) => !search || `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase())).map((product) => ({ code: product.sku, name: product.name, category: product.category?.name || 'Uncategorized', price: product.sellingPrice || product.costPrice, quantity: product.quantity, value: Number(product.quantity || 0) * Number(product.sellingPrice || product.costPrice || 0) }));
    if (mode === 'purchase-payments') { const map = new Map(); data.purchases.forEach((purchase) => { const name = purchase.supplier?.name || 'Unassigned Supplier'; const row = map.get(name) || { name, total: 0, paid: 0 }; row.total += Number(purchase.total || 0); row.paid += Number(purchase.paidAmount || 0); map.set(name, row); }); return [...map.values()].map((row) => ({ ...row, due: row.total - row.paid })); }
    if (mode === 'sell-payments') { const map = new Map(); data.sales.filter(isCompletedSale).forEach((sale) => { const name = sale.customer?.name || 'Walk-in Customer'; const row = map.get(name) || { name, total: 0, received: 0 }; row.total += Number(sale.total || 0); row.received += Number(sale.paidAmount || 0); map.set(name, row); }); return [...map.values()].map((row) => ({ ...row, due: row.total - row.received })); }
    if (mode === 'register') { const map = new Map(); data.sales.filter(isCompletedSale).forEach((sale) => { const method = sale.paymentMethod || 'UNKNOWN'; const row = map.get(method) || { method, count: 0, amount: 0 }; row.count += 1; row.amount += Number(sale.paidAmount || sale.total || 0); map.set(method, row); }); return [...map.values()]; }
    if (mode === 'activity') return [...data.sales.map((item) => ({ date: item.createdAt || item.saleDate, action: 'Sale recorded', details: `${item.invoiceNumber || 'Sale'} - ${money(item.total)}` })), ...data.purchases.map((item) => ({ date: item.createdAt || item.purchaseDate, action: 'Purchase recorded', details: `${item.purchaseNumber || 'Purchase'} - ${money(item.total)}` })), ...data.expenses.map((item) => ({ date: item.createdAt || item.expenseDate, action: 'Expense recorded', details: `${item.referenceNo || 'Expense'} - ${item.title}` }))].sort((a, b) => new Date(b.date) - new Date(a.date));
    return [];
  }, [data, mode, search]);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading report...</div>;
  if (error) return <div className="p-6"><div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div></div>;

  const titles = { 'product-purchase': 'Product Purchase Report', 'product-sell': 'Product Sell Report', adjustments: 'Stock Adjustment Report', items: 'Items Report', 'purchase-payments': 'Purchase Payment Report', 'sell-payments': 'Sell Payment Report', register: 'Register Report', activity: 'Activity Log' };
  const title = titles[mode];
  return <div className="p-6"><div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">{title}</h1><p className="mt-2 text-gray-600">Live data calculated from the database transaction records.</p></div><div className="mb-6 rounded-lg bg-white p-4 shadow"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search report..." className="rounded border px-3 py-2" /></div><div className="overflow-x-auto rounded-lg bg-white p-6 shadow"><table className="min-w-full divide-y"><thead><tr>{headers(mode).map((header) => <th key={header} className="px-4 py-3 text-left text-xs uppercase text-gray-500">{header}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={headers(mode).length} className="p-8 text-center text-gray-500">No database records found</td></tr> : rows.map((row, index) => <Row key={`${row.reference || row.name || row.code || row.action}-${index}`} mode={mode} row={row} />)}</tbody></table></div></div>;
}

function headers(mode) { if (mode === 'product-purchase') return ['Product', 'SKU', 'Purchased', 'Purchase Value', 'Average Price']; if (mode === 'product-sell') return ['Product', 'SKU', 'Sold', 'Revenue', 'Profit']; if (mode === 'adjustments') return ['Date', 'Reference', 'Location', 'Type', 'Quantity', 'Amount', 'Reason']; if (mode === 'items') return ['Item Code', 'Item Name', 'Category', 'Unit Price', 'Stock Qty', 'Total Value']; if (mode === 'purchase-payments') return ['Supplier', 'Total Purchase', 'Paid', 'Due']; if (mode === 'sell-payments') return ['Customer', 'Total Sales', 'Received', 'Due']; if (mode === 'register') return ['Payment Method', 'Transactions', 'Amount']; return ['Date', 'Action', 'Details']; }
function Row({ mode, row }) { if (mode === 'product-purchase') return <tr><Cell value={row.product} /><Cell value={row.sku} /><Cell value={row.quantity} /><Cell value={money(row.value)} /><Cell value={money(row.average)} /></tr>; if (mode === 'product-sell') return <tr><Cell value={row.product} /><Cell value={row.sku} /><Cell value={row.quantity} /><Cell value={money(row.value)} /><Cell value={money(row.profit)} /></tr>; if (mode === 'adjustments') return <tr><Cell value={dateText(row.date)} /><Cell value={row.reference} /><Cell value={row.location} /><Cell value={row.type} /><Cell value={row.quantity} /><Cell value={money(row.amount)} /><Cell value={row.reason} /></tr>; if (mode === 'items') return <tr><Cell value={row.code} /><Cell value={row.name} /><Cell value={row.category} /><Cell value={money(row.price)} /><Cell value={row.quantity} /><Cell value={money(row.value)} /></tr>; if (mode === 'purchase-payments' || mode === 'sell-payments') return <tr><Cell value={row.name} /><Cell value={money(row.total)} /><Cell value={money(row.paid || row.received)} /><Cell value={money(row.due)} /></tr>; if (mode === 'register') return <tr><Cell value={row.method} /><Cell value={row.count} /><Cell value={money(row.amount)} /></tr>; return <tr><Cell value={dateText(row.date)} /><Cell value={row.action} /><Cell value={row.details} /></tr>; }
function Cell({ value }) { return <td className="px-4 py-3 text-sm">{value ?? '-'}</td>; }
