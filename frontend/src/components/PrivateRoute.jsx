import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getFirstAccessiblePath, hasPermission, permissionForPath } from '../utils/permissions';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  // Check if user is authenticated
  const isAuthenticated = token && user;
  
  if (!isAuthenticated) {
    // Redirect to sign-in page if not authenticated
    return <Navigate to="/sign-in" replace />;
  }

  const requiredPermission = permissionForPath(location.pathname);
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (location.pathname === '/') {
      return <Navigate to={getFirstAccessiblePath()} replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access denied</h1>
          <p className="mt-2 text-gray-600">Your role does not have permission to view this page.</p>
          <button
            type="button"
            onClick={() => window.location.assign('/sign-in')}
            className="mt-4 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700"
          >
            Sign in with another account
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
