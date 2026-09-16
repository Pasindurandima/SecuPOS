import React, { useEffect, useState } from 'react';
import { X, User, Mail, Phone, MapPin, Lock, UserCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { roleService, userService } from '../../services/apiService';

const Users = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Basic Information
    prefix: '',
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
    
    // Service Staff Pin
    enableServiceStaffPin: false,
    
    // Roles and Permissions
    allowLogin: true,
    username: '',
    password: '',
    confirmPassword: '',
    role: 'CASHIER',
    
    // Access Locations
    accessAllLocations: true,
    selectedLocations: [],
    
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setError('');
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Unable to load users');
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const data = await roleService.getAll();
      const activeRoles = data.filter(role => role.isActive !== false);
      setRoles(activeRoles);
      setFormData(prev => ({
        ...prev,
        role: activeRoles.some(role => role.name?.toLowerCase() === prev.role?.toLowerCase())
          ? activeRoles.find(role => role.name?.toLowerCase() === prev.role?.toLowerCase()).name
          : activeRoles[0]?.name || ''
      }));
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err.response?.data?.message || 'Unable to load roles');
    } finally {
      setRolesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      prefix: user.prefix || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      isActive: user.isActive ?? true,
      enableServiceStaffPin: user.enableServiceStaffPin ?? false,
      allowLogin: user.allowLogin ?? true,
      username: user.username || '',
      password: '',
      confirmPassword: '',
      role: user.role || roles[0]?.name || '',
      accessAllLocations: user.accessAllLocations ?? true,
      selectedLocations: []
    }));
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!selectedUser) return;

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const userPayload = {
        username: formData.username || formData.email.split('@')[0],
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName || formData.firstName,
        prefix: formData.prefix,
        isActive: formData.isActive,
        allowLogin: formData.allowLogin,
        accessAllLocations: formData.accessAllLocations,
        roleName: formData.role,
      };

      if (formData.password) {
        userPayload.password = formData.password;
      }

      await userService.update(selectedUser.id, userPayload);
      setShowEditUserModal(false);
      setSelectedUser(null);
      setFormData({
        prefix: '', firstName: '', lastName: '', email: '', isActive: true,
        enableServiceStaffPin: false, allowLogin: true, username: '', password: '',
        confirmPassword: '', role: roles[0]?.name || '', accessAllLocations: true, selectedLocations: [],
      });
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || err.message || 'Unable to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${user.username || user.email}"?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');
      await userService.delete(user.id);
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || err.message || 'Unable to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const username = formData.username.trim() || formData.email.split('@')[0];
    const selectedRole = roles.find(role => role.name === formData.role);
    try {
      setLoading(true);
      setError('');
      await userService.create({
        username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName || formData.firstName,
        prefix: formData.prefix,
        isActive: formData.isActive,
        enableServiceStaffPin: formData.enableServiceStaffPin,
        allowLogin: formData.allowLogin,
        accessAllLocations: formData.accessAllLocations,
        roleId: selectedRole?.id,
        roleName: selectedRole?.name || formData.role,
      });
      setFormData({
        prefix: '', firstName: '', lastName: '', email: '', isActive: true,
        enableServiceStaffPin: false, allowLogin: true, username: '', password: '',
        confirmPassword: '', role: roles[0]?.name || '', accessAllLocations: true, selectedLocations: [],
      });
      setShowAddUserModal(false);
      await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || err.message || 'Unable to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <p className="text-gray-600 mt-2">Manage system users</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User List</h2>
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <User className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && users.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No users found</td></tr>
              ) : users.map((currentUser) => (
                <tr key={currentUser.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {[currentUser.prefix, currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') || currentUser.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{currentUser.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{currentUser.role || 'No Role'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currentUser.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {currentUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleViewUser(currentUser)}
                        className="text-teal-600 hover:text-teal-900 px-2 py-1 hover:bg-teal-50 rounded transition-colors flex items-center space-x-1"
                        title="View"
                      >
                        <Eye className="w-4 h-4" /><span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditUser(currentUser)}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 hover:bg-blue-50 rounded transition-colors flex items-center space-x-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" /><span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(currentUser)}
                        className="text-red-600 hover:text-red-900 px-2 py-1 hover:bg-red-50 rounded transition-colors flex items-center space-x-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" /><span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showViewUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <h3 className="text-xl font-semibold text-white">User Details</h3>
              <button
                onClick={() => setShowViewUserModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold text-gray-900">Name:</span> {selectedUser.prefix ? `${selectedUser.prefix} ` : ''}{selectedUser.firstName || selectedUser.username} {selectedUser.lastName || ''}</div>
                <div><span className="font-semibold text-gray-900">Username:</span> {selectedUser.username || 'N/A'}</div>
                <div className="col-span-2"><span className="font-semibold text-gray-900">Email:</span> {selectedUser.email || 'N/A'}</div>
                <div><span className="font-semibold text-gray-900">Role:</span> {selectedUser.role || 'No Role'}</div>
                <div><span className="font-semibold text-gray-900">Status:</span> {selectedUser.isActive ? 'Active' : 'Inactive'}</div>
                <div><span className="font-semibold text-gray-900">Login Allowed:</span> {selectedUser.allowLogin ? 'Yes' : 'No'}</div>
                <div><span className="font-semibold text-gray-900">Access All Locations:</span> {selectedUser.accessAllLocations ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowViewUserModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <h3 className="text-xl font-semibold text-white">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prefix</label>
                  <select
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    name="isActive"
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="allowLogin"
                      checked={formData.allowLogin}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Allow login</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="accessAllLocations"
                      checked={formData.accessAllLocations}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Access all locations</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <h3 className="text-xl font-semibold text-white">Add New User</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Prefix */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Prefix</label>
                      <select
                        name="prefix"
                        value={formData.prefix}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>

                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter last name"
                      />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter email"
                        required
                      />
                    </div>

                    {/* Is Active */}
                    <div className="md:col-span-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Is Active?</span>
                      </label>
                    </div>

                    {/* Enable Service Staff Pin */}
                    <div className="md:col-span-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="enableServiceStaffPin"
                          checked={formData.enableServiceStaffPin}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Enable service staff pin</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Roles and Permissions Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Roles and Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Allow Login */}
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="allowLogin"
                          checked={formData.allowLogin}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Allow login</span>
                      </label>
                    </div>

                    {/* Username */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Leave blank to auto generate username"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave blank to auto generate username</p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter password"
                        required
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Confirm password"
                        required
                      />
                    </div>

                    {/* Role */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                        disabled={rolesLoading || roles.length === 0}
                      >
                        {rolesLoading ? (
                          <option value="">Loading roles...</option>
                        ) : roles.length === 0 ? (
                          <option value="">No roles available</option>
                        ) : (
                          roles.map(role => (
                            <option key={role.id} value={role.name}>
                              {role.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Access Locations Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Access locations</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="accessAllLocations"
                        checked={formData.accessAllLocations}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">All Locations</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">SecU Engineering (BL0001)</span>
                    </label>
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
