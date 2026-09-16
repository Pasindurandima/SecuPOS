import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, Monitor, Printer, X } from 'lucide-react';
import { saleService } from '../../services/apiService';
import { formatCurrency, formatDate } from '../../context/BusinessSettingsContext';

const ListPOS = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);

  const handleOpenPOS = () => {
    navigate('/sell/pos');
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await saleService.getAll();
      setSales(data || []);
    } catch (err) {
      console.error('Error fetching POS sales:', err);
      setError(`Failed to load POS sales: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const search = searchTerm.toLowerCase();
    return sale.invoiceNumber?.toLowerCase().includes(search)
      || sale.customer?.name?.toLowerCase().includes(search)
      || sale.paymentMethod?.toLowerCase().includes(search);
  });

  const handlePrint = (sale) => {
    const items = (sale.items || []).map(item => `
      <tr><td>${item.product?.name || 'Product'}</td><td>${item.quantity}</td><td>${formatCurrency(item.unitPrice)}</td><td>${formatCurrency(item.total)}</td></tr>
    `).join('');
    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><title>${sale.invoiceNumber}</title><style>body{font-family:Arial;padding:24px}h1{margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}td:nth-child(n+2),th:nth-child(n+2){text-align:right}.total{text-align:right;margin-top:20px;font-size:18px;font-weight:bold}</style></head><body><h1>POS Receipt</h1><p>${sale.invoiceNumber} | ${formatDate(sale.saleDate)}</p><p>Customer: ${sale.customer?.name || 'Walk-in Customer'}</p><table><thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${items}</tbody></table><p class="total">Total: ${formatCurrency(sale.total)}</p><p>Paid: ${formatCurrency(sale.paidAmount)} | Payment: ${sale.paymentMethod || 'N/A'}</p></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">POS Sales List</h1>
        <p className="text-gray-600 mt-2">View all Point of Sale transactions</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search POS sales..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button 
            onClick={handleOpenPOS}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Monitor className="w-4 h-4" />
            <span>Open POS</span>
          </button>
        </div>
        
        {loading && <div className="py-10 text-center text-gray-600">Loading POS sales...</div>}
        {error && !loading && (
          <div className="flex items-center rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{error}</span>
            <button onClick={fetchSales} className="ml-auto font-semibold">Retry</button>
          </div>
        )}
        {!loading && !error && filteredSales.length === 0 && (
          <div className="py-10 text-center text-gray-600">No POS sales found.</div>
        )}
        {!loading && !error && filteredSales.length > 0 && <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(sale.saleDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.invoiceNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sale.customer?.name || 'Walk-in Customer'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Not stored</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatCurrency(sale.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sale.paymentMethod || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => setSelectedSale(sale)} className="mr-3 text-teal-600 hover:text-teal-900" title="View sale"><Eye className="inline h-4 w-4" /></button>
                    <button onClick={() => handlePrint(sale)} className="text-blue-600 hover:text-blue-900" title="Print receipt"><Printer className="inline h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </div>

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between bg-teal-600 px-6 py-4 text-white">
              <div><h2 className="text-xl font-semibold">POS Sale Details</h2><p>{selectedSale.invoiceNumber}</p></div>
              <button onClick={() => setSelectedSale(null)} title="Close details"><X /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              <div><span className="text-sm text-gray-500">Date</span><p>{formatDate(selectedSale.saleDate)}</p></div>
              <div><span className="text-sm text-gray-500">Customer</span><p>{selectedSale.customer?.name || 'Walk-in Customer'}</p></div>
              <div><span className="text-sm text-gray-500">Payment</span><p>{selectedSale.paymentMethod || 'N/A'}</p></div>
            </div>
            <div className="px-6 pb-6"><table className="min-w-full divide-y divide-gray-200"><thead><tr><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Total</th></tr></thead><tbody>{(selectedSale.items || []).map(item => <tr key={item.id}><td className="px-3 py-2">{item.product?.name}</td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(item.total)}</td></tr>)}</tbody></table><div className="mt-4 text-right font-semibold">Total: {formatCurrency(selectedSale.total)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPOS;
