import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Eye, MapPin, Package, Plus, Trash2, Truck, X } from 'lucide-react';
import { saleService, shipmentService } from '../../services/apiService';

const initialForm = {
  invoiceNumber: '', carrier: '', trackingNumber: '', shipmentDate: new Date().toISOString().split('T')[0],
  expectedDelivery: '', shippingAddress: '', shippingCost: '0', itemCount: 0, notes: ''
};

const statusLabels = { PENDING: 'Pending', PROCESSING: 'Processing', IN_TRANSIT: 'In Transit', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
const statusColors = { PENDING: 'bg-yellow-100 text-yellow-800', PROCESSING: 'bg-blue-100 text-blue-800', IN_TRANSIT: 'bg-purple-100 text-purple-800', DELIVERED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800' };

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [shipmentData, saleData] = await Promise.all([shipmentService.getAll(), saleService.getAll()]);
      setShipments(Array.isArray(shipmentData) ? shipmentData : []);
      setSales(Array.isArray(saleData) ? saleData : []);
    } catch (err) {
      setError(`Failed to load shipments: ${err.response?.data?.message || err.message}`);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredShipments = shipments.filter(shipment => {
    const search = searchTerm.toLowerCase();
    return (!search || shipment.shipmentNumber?.toLowerCase().includes(search) || shipment.invoiceNumber?.toLowerCase().includes(search) || shipment.customer?.toLowerCase().includes(search) || shipment.trackingNumber?.toLowerCase().includes(search))
      && (!statusFilter || shipment.status === statusFilter)
      && (!carrierFilter || shipment.carrier === carrierFilter);
  });

  const carriers = [...new Set(shipments.map(shipment => shipment.carrier).filter(Boolean))];
  const totals = useMemo(() => ({
    pending: shipments.filter(item => item.status === 'PENDING').length,
    transit: shipments.filter(item => item.status === 'IN_TRANSIT').length,
    delivered: shipments.filter(item => item.status === 'DELIVERED').length,
    items: shipments.reduce((sum, item) => sum + Number(item.itemCount || 0), 0),
    cost: shipments.reduce((sum, item) => sum + Number(item.shippingCost || 0), 0)
  }), [shipments]);

  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const openAdd = () => { setFormData(initialForm); setShowModal(true); setError(null); };
  const handleInvoiceChange = (invoiceNumber) => {
    const sale = sales.find(item => item.invoiceNumber === invoiceNumber);
    updateForm('invoiceNumber', invoiceNumber);
    if (sale) {
      updateForm('itemCount', (sale.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0));
      updateForm('shippingAddress', sale.customer?.address || '');
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const saved = await shipmentService.create({ ...formData, shippingCost: Number(formData.shippingCost), itemCount: Number(formData.itemCount) });
      setShipments(prev => [saved, ...prev]);
      setShowModal(false);
    } catch (err) { setError(`Failed to save shipment: ${err.response?.data?.message || err.message}`); }
    finally { setSaving(false); }
  };

  const handleStatus = async (shipment, status) => {
    try {
      const updated = await shipmentService.updateStatus(shipment.id, status);
      setShipments(prev => prev.map(item => item.id === updated.id ? updated : item));
      setSelectedShipment(updated);
    } catch (err) { setError(`Failed to update shipment: ${err.response?.data?.message || err.message}`); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipment?')) return;
    try { await shipmentService.delete(id); setShipments(prev => prev.filter(item => item.id !== id)); setSelectedShipment(null); }
    catch (err) { setError(`Failed to delete shipment: ${err.response?.data?.message || err.message}`); }
  };

  return <div className="p-6">
    <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Shipments</h1><p className="mt-2 text-gray-600">Track and manage shipments</p></div>
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search shipments..." className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-teal-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 px-4 py-2"><option value="">All Status</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
          <select value={carrierFilter} onChange={e => setCarrierFilter(e.target.value)} className="rounded-lg border border-gray-300 px-4 py-2"><option value="">All Carriers</option>{carriers.map(carrier => <option key={carrier} value={carrier}>{carrier}</option>)}</select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-white hover:bg-teal-700"><Plus className="h-4 w-4" />Add Shipment</button>
      </div>
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700"><AlertCircle className="mr-2 inline h-5 w-5" />{error}<button onClick={loadData} className="float-right font-semibold">Retry</button></div>}
      {loading ? <div className="py-12 text-center text-gray-600">Loading shipments...</div> : filteredShipments.length === 0 ? <div className="py-12 text-center text-gray-600">No shipments found.</div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr>{['Shipment Info','Customer','Carrier & Tracking','Dates','Destination','Details','Status','Actions'].map(title => <th key={title} className="px-3 py-3 text-left text-xs uppercase text-gray-500">{title}</th>)}</tr></thead><tbody className="divide-y divide-gray-200">{filteredShipments.map(shipment => <tr key={shipment.id} className="hover:bg-gray-50"><td className="px-3 py-3"><div className="font-medium text-teal-600">{shipment.shipmentNumber}</div><div className="text-xs text-blue-600">{shipment.invoiceNumber}</div></td><td className="px-3 py-3">{shipment.customer || 'Walk-in Customer'}</td><td className="px-3 py-3"><div>{shipment.carrier}</div><div className="font-mono text-xs text-gray-500">{shipment.trackingNumber || '-'}</div></td><td className="px-3 py-3 text-xs"><div>Ship: {shipment.shipmentDate}</div><div><Clock className="mr-1 inline h-3 w-3" />ETA: {shipment.expectedDelivery || '-'}</div></td><td className="px-3 py-3 text-xs"><MapPin className="mr-1 inline h-3 w-3" />{shipment.shippingAddress}</td><td className="px-3 py-3 text-xs"><div>{shipment.itemCount} items</div><div>Rs {Number(shipment.shippingCost || 0).toFixed(2)}</div></td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[shipment.status] || 'bg-gray-100 text-gray-800'}`}>{statusLabels[shipment.status] || shipment.status}</span></td><td className="px-3 py-3"><button onClick={() => setSelectedShipment(shipment)} className="mr-2 text-blue-600" title="View shipment"><Eye className="inline h-4 w-4" /></button><button onClick={() => handleStatus(shipment, shipment.status === 'PENDING' ? 'PROCESSING' : shipment.status === 'PROCESSING' ? 'IN_TRANSIT' : shipment.status === 'IN_TRANSIT' ? 'DELIVERED' : shipment.status)} className="mr-2 text-teal-600" title="Advance status"><CheckCircle className="inline h-4 w-4" /></button><button onClick={() => handleDelete(shipment.id)} className="text-red-600" title="Delete shipment"><Trash2 className="inline h-4 w-4" /></button></td></tr>)}</tbody></table></div>}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5"><div className="rounded bg-yellow-50 p-4"><div className="text-sm text-yellow-600">Pending</div><div className="text-2xl font-bold">{totals.pending}</div></div><div className="rounded bg-purple-50 p-4"><div className="text-sm text-purple-600">In Transit</div><div className="text-2xl font-bold">{totals.transit}</div></div><div className="rounded bg-green-50 p-4"><div className="text-sm text-green-600">Delivered</div><div className="text-2xl font-bold">{totals.delivered}</div></div><div className="rounded bg-blue-50 p-4"><div className="text-sm text-blue-600">Total Items</div><div className="text-2xl font-bold">{totals.items}</div></div><div className="rounded bg-teal-50 p-4"><div className="text-sm text-teal-600">Total Cost</div><div className="text-2xl font-bold">Rs {totals.cost.toFixed(2)}</div></div></div>
    </div>

    {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={handleSave} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"><div className="flex items-center justify-between bg-teal-600 px-6 py-4 text-white"><h2 className="text-xl font-bold"><Truck className="mr-2 inline h-5 w-5" />Add Shipment</h2><button type="button" onClick={() => setShowModal(false)}><X /></button></div><div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2"><label>Invoice Number<select required value={formData.invoiceNumber} onChange={e => handleInvoiceChange(e.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Select Invoice</option>{sales.map(sale => <option key={sale.id} value={sale.invoiceNumber}>{sale.invoiceNumber} - {sale.customer?.name || 'Walk-in Customer'}</option>)}</select></label><label>Carrier<select required value={formData.carrier} onChange={e => updateForm('carrier', e.target.value)} className="mt-1 w-full rounded border p-2"><option value="">Select Carrier</option>{['DHL Express','FedEx','Aramex','UPS','Other'].map(carrier => <option key={carrier}>{carrier}</option>)}</select></label><label>Tracking Number<input value={formData.trackingNumber} onChange={e => updateForm('trackingNumber', e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label>Shipment Date<input required type="date" value={formData.shipmentDate} onChange={e => updateForm('shipmentDate', e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label>Expected Delivery<input type="date" value={formData.expectedDelivery} onChange={e => updateForm('expectedDelivery', e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label>Shipping Cost<input type="number" min="0" step="0.01" value={formData.shippingCost} onChange={e => updateForm('shippingCost', e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="md:col-span-2">Shipping Address<textarea required value={formData.shippingAddress} onChange={e => updateForm('shippingAddress', e.target.value)} rows="3" className="mt-1 w-full rounded border p-2" /></label><label className="md:col-span-2">Notes<textarea value={formData.notes} onChange={e => updateForm('notes', e.target.value)} rows="3" className="mt-1 w-full rounded border p-2" /></label></div><div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4"><button type="button" onClick={() => setShowModal(false)} className="rounded border px-4 py-2">Cancel</button><button disabled={saving} className="rounded bg-teal-600 px-4 py-2 text-white">{saving ? 'Saving...' : 'Save Shipment'}</button></div></form></div>}

    {selectedShipment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-lg bg-white shadow-xl"><div className="flex items-center justify-between bg-teal-600 px-6 py-4 text-white"><div><h2 className="text-xl font-bold">Shipment Details</h2><p>{selectedShipment.shipmentNumber}</p></div><button onClick={() => setSelectedShipment(null)}><X /></button></div><div className="grid grid-cols-2 gap-4 p-6 text-sm"><div><span className="text-gray-500">Invoice</span><p>{selectedShipment.invoiceNumber}</p></div><div><span className="text-gray-500">Customer</span><p>{selectedShipment.customer}</p></div><div><span className="text-gray-500">Carrier</span><p>{selectedShipment.carrier}</p></div><div><span className="text-gray-500">Tracking</span><p>{selectedShipment.trackingNumber || '-'}</p></div><div><span className="text-gray-500">Status</span><p>{statusLabels[selectedShipment.status]}</p></div><div><span className="text-gray-500">ETA</span><p>{selectedShipment.expectedDelivery || '-'}</p></div><div className="col-span-2"><span className="text-gray-500">Address</span><p>{selectedShipment.shippingAddress}</p></div></div><div className="flex justify-end gap-3 border-t px-6 py-4"><select value={selectedShipment.status} onChange={e => handleStatus(selectedShipment, e.target.value)} className="rounded border p-2">{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button onClick={() => handleDelete(selectedShipment.id)} className="rounded bg-red-600 px-4 py-2 text-white">Delete</button></div></div></div>}
  </div>;
};

export default Shipments;
