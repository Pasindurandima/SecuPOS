import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, CheckSquare, Edit, Trash2 } from 'lucide-react';
import { roleService } from '../../services/apiService';

const Roles = () => {
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    permissions: {
      dashboard: false,
      products: false,
      categories: false,
      brands: false,
      units: false,
      customers: false,
      suppliers: false,
      sales: false,
      purchases: false,
      expenses: false,
      reports: false,
      users: false,
      roles: false,
      settings: false
    }
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAll();
      console.log('Fetched roles:', data);
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
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

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(formData.permissions).every(val => val);
    const newPermissions = {};
    Object.keys(formData.permissions).forEach(key => {
      newPermissions[key] = !allSelected;
    });
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Convert permissions object to array of permission names
      const selectedPermissions = Object.keys(formData.permissions)
        .filter(key => formData.permissions[key]);
      
      if (selectedPermissions.length === 0) {
        alert('Please select at least one permission');
        return;
      }

      const roleData = {
        name: formData.roleName,
        description: formData.description,
        permissions: selectedPermissions
      };

      console.log('Submitting role data:', roleData);

      if (editingRole) {
        await roleService.update(editingRole.id, roleData);
        alert('Role updated successfully!');
      } else {
        await roleService.create(roleData);
        alert('Role created successfully!');
      }
      
      // Reset form and close modal
      resetForm();
      setShowAddRoleModal(false);
      setShowEditRoleModal(false);
      setEditingRole(null);
      
      // Refresh roles list
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error saving role: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role) => {
    // Convert permissions array to object
    const permissionsObj = {
      dashboard: false,
      products: false,
      categories: false,
      brands: false,
      units: false,
      customers: false,
      suppliers: false,
      sales: false,
      purchases: false,
      expenses: false,
      reports: false,
      users: false,
      roles: false,
      settings: false
    };
    
    if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach(permission => {
        if (permissionsObj.hasOwnProperty(permission)) {
          permissionsObj[permission] = true;
        }
      });
    }

    setFormData({
      roleName: role.name,
      description: role.description,
      permissions: permissionsObj
    });
    
    setEditingRole(role);
    setShowEditRoleModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the role "${name}"?`)) {
      try {
        setLoading(true);
        await roleService.delete(id);
        alert('Role deleted successfully!');
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error deleting role: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      roleName: '',
      description: '',
      permissions: {
        dashboard: false,
        products: false,
        categories: false,
        brands: false,
        units: false,
        customers: false,
        suppliers: false,
        sales: false,
        purchases: false,
        expenses: false,
        reports: false,
        users: false,
        roles: false,
        settings: false
      }
    });
  };

  const permissionsList = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: 'Products' },
    { key: 'categories', label: 'Categories' },
    { key: 'brands', label: 'Brands' },
    { key: 'units', label: 'Units' },
    { key: 'customers', label: 'Customers' },
    { key: 'suppliers', label: 'Suppliers' },
    { key: 'sales', label: 'Sales' },
    { key: 'purchases', label: 'Purchases' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'reports', label: 'Reports' },
    { key: 'users', label: 'Users' },
    { key: 'roles', label: 'Roles' },
    { key: 'settings', label: 'Settings' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Roles</h1>
        <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Role List</h2>
          <button 
            onClick={() => {
              resetForm();
              setEditingRole(null);
              setShowAddRoleModal(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>Add New Role</span>
          </button>
        </div>
        
        {loading && <p className="text-center py-4">Loading roles...</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{role.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions && role.permissions.length > 0 ? (
                    role.permissions.slice(0, 3).map((permission, index) => (
                      <span key={index} className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
                        {permission}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No permissions</span>
                  )}
                  {role.permissions && role.permissions.length > 3 && (
                    <span className="text-xs text-gray-500">+{role.permissions.length - 3} more</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{role.userCount || 0} users</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(role)}
                    className="text-teal-600 hover:text-teal-900 text-sm flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(role.id, role.name)}
                    className="text-red-600 hover:text-red-900 text-sm flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {!loading && roles.length === 0 && (
          <p className="text-center text-gray-500 py-8">No roles found. Create a new role to get started.</p>
        )}
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Add New Role</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddRoleModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                {/* Role Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="roleName"
                      value={formData.roleName}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter role name (e.g., Manager, Cashier)"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Describe the role and its responsibilities"
                      rows="3"
                      required
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Permissions <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center space-x-1"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>{Object.values(formData.permissions).every(val => val) ? 'Deselect All' : 'Select All'}</span>
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {permissionsList.map((permission) => (
                        <div key={permission.key} className="flex items-center">
                          <input
                            type="checkbox"
                            id={permission.key}
                            checked={formData.permissions[permission.key]}
                            onChange={() => handlePermissionChange(permission.key)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                          />
                          <label
                            htmlFor={permission.key}
                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the permissions that users with this role will have access to
                  </p>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRoleModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Role'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-white" />
                <h3 className="text-xl font-semibold text-white">Edit Role</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditRoleModal(false);
                  setEditingRole(null);
                  resetForm();
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                {/* Role Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="roleName"
                      value={formData.roleName}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter role name (e.g., Manager, Cashier)"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the role and its responsibilities"
                      rows="3"
                      required
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Permissions <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>{Object.values(formData.permissions).every(val => val) ? 'Deselect All' : 'Select All'}</span>
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {permissionsList.map((permission) => (
                        <div key={permission.key} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`edit-${permission.key}`}
                            checked={formData.permissions[permission.key]}
                            onChange={() => handlePermissionChange(permission.key)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`edit-${permission.key}`}
                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                          >
                            {permission.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the permissions that users with this role will have access to
                  </p>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditRoleModal(false);
                    setEditingRole(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50"
                >
                  <Shield className="w-4 h-4" />
                  <span>{loading ? 'Updating...' : 'Update Role'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
