import React, { useState, useEffect } from 'react';
import { X, Users, User, Mail, Phone, MapPin, CreditCard, Calendar, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { customerService } from '../../services/apiService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showViewCustomerModal, setShowViewCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    customerGroup: '',
    taxNumber: '',
    creditLimit: '',
    paymentTerms: '30',
    dateOfBirth: '',
    notes: ''
  });

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      console.log('Customers loaded:', response);
      setCustomers(response || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      alert('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare customer data matching backend CustomerRequest DTO
      const customerData = {
        name: formData.customerName,
        email: formData.email || null,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        country: formData.country || null,
        customerGroup: formData.customerGroup ? formData.customerGroup.toUpperCase() : 'REGULAR',
        taxNumber: formData.taxNumber || null,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0.0,
        paymentTerms: formData.paymentTerms ? parseInt(formData.paymentTerms) : 30,
        dateOfBirth: formData.dateOfBirth || null,
        notes: formData.notes || null
      };

      console.log('Creating customer:', customerData);
      const response = await customerService.create(customerData);
      console.log('Customer created:', response);
      
      alert('Customer created successfully!');
      
      // Refresh customer list
      await fetchCustomers();
      
      // Reset form and close modal
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        customerGroup: '',
        taxNumber: '',
        creditLimit: '',
        paymentTerms: '30',
        dateOfBirth: '',
        notes: ''
      });
      setShowAddCustomerModal(false);
    } catch (err) {
      console.error('Error creating customer:', err);
      alert(`Failed to create customer: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setShowViewCustomerModal(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      customerName: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      alternatePhone: customer.alternatePhone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      country: customer.country || '',
      customerGroup: customer.customerGroup?.toLowerCase() || '',
      taxNumber: customer.taxNumber || '',
      creditLimit: customer.creditLimit || '',
      paymentTerms: customer.paymentTerms?.toString() || '30',
      dateOfBirth: customer.dateOfBirth || '',
      notes: customer.notes || ''
    });
    setShowEditCustomerModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const customerData = {
        name: formData.customerName,
        email: formData.email || null,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        country: formData.country || null,
        customerGroup: formData.customerGroup ? formData.customerGroup.toUpperCase() : 'REGULAR',
        taxNumber: formData.taxNumber || null,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0.0,
        paymentTerms: formData.paymentTerms ? parseInt(formData.paymentTerms) : 30,
        dateOfBirth: formData.dateOfBirth || null,
        notes: formData.notes || null
      };

      console.log('Updating customer:', selectedCustomer.id, customerData);
      const response = await customerService.update(selectedCustomer.id, customerData);
      console.log('Customer updated:', response);
      
      alert('Customer updated successfully!');
      
      await fetchCustomers();
      
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        customerGroup: '',
        taxNumber: '',
        creditLimit: '',
        paymentTerms: '30',
        dateOfBirth: '',
        notes: ''
      });
      setSelectedCustomer(null);
      setShowEditCustomerModal(false);
    } catch (err) {
      console.error('Error updating customer:', err);
      alert(`Failed to update customer: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customer.name}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('Deleting customer:', customer.id);
      await customerService.delete(customer.id);
      
      alert('Customer deleted successfully!');
      await fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert(`Failed to delete customer: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <p className="text-gray-600 mt-2">Manage customer contacts and information</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customer List</h2>
          <button 
            onClick={() => setShowAddCustomerModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      <span className="ml-3">Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No customers found</p>
                    <p className="text-sm">Click "Add New Customer" to create your first customer</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Rs {customer.totalDue ? parseFloat(customer.totalDue).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleView(customer)}
                        className="text-teal-600 hover:text-teal-900 mr-3 inline-flex items-center"
                        title="View Customer"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button 
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(customer)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Add New Customer</h3>
              </div>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter customer name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter email"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>

                    {/* Alternate Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alternate Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="alternatePhone"
                          value={formData.alternatePhone}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter alternate phone"
                        />
                      </div>
                    </div>

                    {/* Customer Group */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Customer Group
                      </label>
                      <select
                        name="customerGroup"
                        value={formData.customerGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Group</option>
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="vip">VIP</option>
                        <option value="regular">Regular</option>
                      </select>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter street address"
                          rows="2"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter city"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter state"
                      />
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zip/Postal Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter zip code"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tax Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tax Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter tax number"
                        />
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Terms (Days)
                      </label>
                      <select
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="0">Due on Receipt</option>
                        <option value="7">Net 7 Days</option>
                        <option value="15">Net 15 Days</option>
                        <option value="30">Net 30 Days</option>
                        <option value="45">Net 45 Days</option>
                        <option value="60">Net 60 Days</option>
                      </select>
                    </div>

                    {/* Credit Limit */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Credit Limit
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          name="creditLimit"
                          value={formData.creditLimit}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Add any additional notes about this customer"
                    rows="3"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Users className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Customer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {showViewCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Customer Details</h3>
              </div>
              <button
                onClick={() => {
                  setShowViewCustomerModal(false);
                  setSelectedCustomer(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase border-b pb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Customer Name</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Email</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Phone</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Alternate Phone</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.alternatePhone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Customer Group</label>
                    <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedCustomer.customerGroup === 'VIP' ? 'bg-purple-100 text-purple-800' :
                      selectedCustomer.customerGroup === 'WHOLESALE' ? 'bg-blue-100 text-blue-800' :
                      selectedCustomer.customerGroup === 'RETAIL' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCustomer.customerGroup || 'REGULAR'}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Date of Birth</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.dateOfBirth || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase border-b pb-2">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 uppercase">Street Address</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">City</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.city || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">State/Province</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.state || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Zip/Postal Code</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.zipCode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Country</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.country || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase border-b pb-2">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Tax Number</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.taxNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Payment Terms</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedCustomer.paymentTerms ? `${selectedCustomer.paymentTerms} Days` : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Credit Limit</label>
                    <p className="text-base font-semibold text-teal-600 mt-1">Rs {selectedCustomer.creditLimit ? parseFloat(selectedCustomer.creditLimit).toFixed(2) : '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Total Due</label>
                    <p className="text-base font-semibold text-red-600 mt-1">Rs {selectedCustomer.totalDue ? parseFloat(selectedCustomer.totalDue).toFixed(2) : '0.00'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase border-b pb-2">Notes</h4>
                  <p className="text-base text-gray-900 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-semibold">Created:</span> {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Last Updated:</span> {selectedCustomer.updatedAt ? new Date(selectedCustomer.updatedAt).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${selectedCustomer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewCustomerModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewCustomerModal(false);
                    handleEdit(selectedCustomer);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Customer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Edit Customer</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditCustomerModal(false);
                  setSelectedCustomer(null);
                  setFormData({
                    customerName: '',
                    email: '',
                    phone: '',
                    alternatePhone: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                    customerGroup: '',
                    taxNumber: '',
                    creditLimit: '',
                    paymentTerms: '30',
                    dateOfBirth: '',
                    notes: ''
                  });
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Same form as Add Customer */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleUpdate}>
                {/* Basic Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter customer name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter email"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>

                    {/* Alternate Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alternate Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="alternatePhone"
                          value={formData.alternatePhone}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter alternate phone"
                        />
                      </div>
                    </div>

                    {/* Customer Group */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Customer Group
                      </label>
                      <select
                        name="customerGroup"
                        value={formData.customerGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Group</option>
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="vip">VIP</option>
                        <option value="regular">Regular</option>
                      </select>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter street address"
                          rows="2"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter city"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter state"
                      />
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zip/Postal Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter zip code"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tax Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tax Number
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter tax number"
                        />
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Terms (Days)
                      </label>
                      <select
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">Due on Receipt</option>
                        <option value="7">Net 7 Days</option>
                        <option value="15">Net 15 Days</option>
                        <option value="30">Net 30 Days</option>
                        <option value="45">Net 45 Days</option>
                        <option value="60">Net 60 Days</option>
                      </select>
                    </div>

                    {/* Credit Limit */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Credit Limit
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          name="creditLimit"
                          value={formData.creditLimit}
                          onChange={handleInputChange}
                          className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional notes about this customer"
                    rows="3"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCustomerModal(false);
                    setSelectedCustomer(null);
                    setFormData({
                      customerName: '',
                      email: '',
                      phone: '',
                      alternatePhone: '',
                      address: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      country: '',
                      customerGroup: '',
                      taxNumber: '',
                      creditLimit: '',
                      paymentTerms: '30',
                      dateOfBirth: '',
                      notes: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" />
                  <span>{loading ? 'Updating...' : 'Update Customer'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
