import React, { useEffect, useState } from 'react';
import BusinessLocationSelect from '../../components/BusinessLocationSelect';
import { paymentAccountService } from '../../services/apiService';
import { formatCurrency } from '../../context/BusinessSettingsContext';

const emptyForm = { name: '', accountNumber: '', type: 'BANK', provider: '', businessLocation: '', openingBalance: '0' };
const money = (value) => formatCurrency(value);

export default function ListAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { setAccounts(await paymentAccountService.getAll()); } catch (e) { setError(e.response?.data?.message || 'Failed to load payment accounts'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const save = async (e) => { e.preventDefault(); setError(''); try { const saved = editingId ? await paymentAccountService.update(editingId, form) : await paymentAccountService.create(form); setAccounts(editingId ? accounts.map((a) => a.id === editingId ? saved : a) : [...accounts, saved]); setForm(emptyForm); setEditingId(null); } catch (err) { setError(err.response?.data?.message || 'Failed to save account'); } };
  const remove = async (account) => { if (!window.confirm(`Delete ${account.name}?`)) return; try { await paymentAccountService.delete(account.id); setAccounts(accounts.filter((a) => a.id !== account.id)); } catch (err) { setError(err.response?.data?.message || 'Failed to delete account'); } };
  const filtered = accounts.filter((a) => (!search || `${a.name} ${a.provider || ''}`.toLowerCase().includes(search.toLowerCase())) && (!type || a.type === type));
  const total = accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const bank = accounts.filter((a) => a.type === 'BANK').reduce((sum, a) => sum + Number(a.balance || 0), 0);
  const cash = accounts.filter((a) => a.type === 'CASH').reduce((sum, a) => sum + Number(a.balance || 0), 0);

  return <div className="p-6"><div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Payment Accounts</h1><p className="mt-2 text-gray-600">Manage real payment accounts and calculated balances</p></div>{error && <div className="mb-4 rounded bg-red-50 p-3 text-red-700">{error}</div>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6"><div className="rounded-lg bg-teal-600 p-5 text-white"><div>Total Balance</div><div className="text-3xl font-bold">{money(total)}</div></div><div className="rounded-lg bg-blue-600 p-5 text-white"><div>Bank Accounts</div><div className="text-3xl font-bold">{money(bank)}</div></div><div className="rounded-lg bg-green-600 p-5 text-white"><div>Cash on Hand</div><div className="text-3xl font-bold">{money(cash)}</div></div></div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]"><form onSubmit={save} className="rounded-lg bg-white p-5 shadow"><h2 className="mb-4 text-lg font-semibold">{editingId ? 'Edit Account' : 'Add Account'}</h2>{['name','accountNumber','provider'].map((name) => <input key={name} name={name} value={form[name]} onChange={change} required={name === 'name'} placeholder={name === 'name' ? 'Account name *' : name === 'accountNumber' ? 'Account number' : 'Bank / provider'} className="mb-3 w-full rounded border px-3 py-2" />)}<select name="type" value={form.type} onChange={change} className="mb-3 w-full rounded border px-3 py-2"><option value="BANK">Bank Account</option><option value="CASH">Cash</option><option value="CREDIT_CARD">Credit Card</option><option value="MOBILE_WALLET">Mobile Wallet</option><option value="OTHER">Other</option></select><BusinessLocationSelect name="businessLocation" value={form.businessLocation} onChange={change} allLabel="No location" className="mb-3 w-full rounded border px-3 py-2" /><input name="openingBalance" type="number" min="0" step="0.01" value={form.openingBalance} onChange={change} placeholder="Opening balance" className="mb-3 w-full rounded border px-3 py-2" /><div className="flex gap-2"><button className="flex-1 rounded bg-teal-600 px-3 py-2 text-white">{editingId ? 'Update' : 'Add Account'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded bg-gray-200 px-3 py-2">Cancel</button>}</div></form>
      <div className="overflow-x-auto rounded-lg bg-white p-5 shadow"><div className="mb-4 flex gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts..." className="rounded border px-3 py-2" /><select value={type} onChange={(e) => setType(e.target.value)} className="rounded border px-3 py-2"><option value="">All Types</option><option value="BANK">Bank</option><option value="CASH">Cash</option><option value="CREDIT_CARD">Credit Card</option><option value="MOBILE_WALLET">Mobile Wallet</option><option value="OTHER">Other</option></select></div><table className="min-w-full divide-y"><thead><tr>{['Account','Number','Type','Provider','Balance','Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs uppercase text-gray-500">{h}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan="6" className="p-6 text-center">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan="6" className="p-6 text-center text-gray-500">No payment accounts found</td></tr> : filtered.map((a) => <tr key={a.id}><td className="px-4 py-3 font-medium">{a.name}</td><td className="px-4 py-3">{a.accountNumber || '-'}</td><td className="px-4 py-3">{a.type}</td><td className="px-4 py-3">{a.provider || '-'}</td><td className="px-4 py-3 font-semibold">{money(a.balance)}</td><td className="px-4 py-3"><button onClick={() => { setEditingId(a.id); setForm({ name: a.name, accountNumber: a.accountNumber || '', type: a.type, provider: a.provider || '', businessLocation: a.businessLocation || '', openingBalance: a.openingBalance || 0 }); }} className="mr-2 text-blue-600">Edit</button><button onClick={() => remove(a)} className="text-red-600">Delete</button></td></tr>)}</tbody></table></div></div>
  </div>;
}
