# Real POS System - API Integration Guide

## ✅ Implementation Overview

This document provides a complete guide for implementing real data fetching from the backend database to the frontend React application.

## 📁 Files Created

### 1. API Configuration (`src/config/api.js`)
- **Purpose**: Axios instance configuration with interceptors
- **Features**:
  - Base URL configuration: `http://localhost:8080/api`
  - Request interceptor: Automatically adds JWT token to headers
  - Response interceptor: Handles 401 (Unauthorized) and 403 (Forbidden) errors
  - Auto-redirect to login on authentication failure

### 2. API Services (`src/services/apiService.js`)
- **Purpose**: Centralized API service layer
- **Services Included**:
  1. **authService**: Login, Register, Logout, Get Current User
  2. **productService**: CRUD operations, Search, Low Stock
  3. **saleService**: CRUD operations, Today's Sales, Total Revenue
  4. **customerService**: CRUD operations, Search
  5. **supplierService**: CRUD operations
  6. **purchaseService**: CRUD operations
  7. **categoryService**: CRUD operations
  8. **brandService**: CRUD operations
  9. **expenseService**: CRUD operations, Total Expenses
  10. **dashboardService**: Statistics, Recent Sales, Top Products

## 🔧 Backend REST API Endpoints

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
```

### Product Endpoints
```
GET    /api/products               - Get all products
GET    /api/products/{id}          - Get product by ID
POST   /api/products               - Create new product
PUT    /api/products/{id}          - Update product
DELETE /api/products/{id}          - Delete product
GET    /api/products/search?query= - Search products
GET    /api/products/low-stock     - Get low stock products
```

### Sale Endpoints
```
GET    /api/sales                  - Get all sales
GET    /api/sales/{id}             - Get sale by ID
POST   /api/sales                  - Create new sale
PUT    /api/sales/{id}             - Update sale
DELETE /api/sales/{id}             - Delete sale
GET    /api/sales/today            - Get today's sales
GET    /api/sales/revenue          - Get total revenue
```

### Customer Endpoints
```
GET    /api/customers              - Get all customers
GET    /api/customers/{id}         - Get customer by ID
POST   /api/customers              - Create new customer
PUT    /api/customers/{id}         - Update customer
DELETE /api/customers/{id}         - Delete customer
GET    /api/customers/search?query=- Search customers
```

### Supplier Endpoints
```
GET    /api/suppliers              - Get all suppliers
GET    /api/suppliers/{id}         - Get supplier by ID
POST   /api/suppliers              - Create new supplier
PUT    /api/suppliers/{id}         - Update supplier
DELETE /api/suppliers/{id}         - Delete supplier
```

### Purchase Endpoints
```
GET    /api/purchases              - Get all purchases
GET    /api/purchases/{id}         - Get purchase by ID
POST   /api/purchases              - Create new purchase
PUT    /api/purchases/{id}         - Update purchase
DELETE /api/purchases/{id}         - Delete purchase
```

### Category Endpoints
```
GET    /api/categories             - Get all categories
GET    /api/categories/{id}        - Get category by ID
POST   /api/categories             - Create new category
PUT    /api/categories/{id}        - Update category
DELETE /api/categories/{id}        - Delete category
```

### Brand Endpoints
```
GET    /api/brands                 - Get all brands
GET    /api/brands/{id}            - Get brand by ID
POST   /api/brands                 - Create new brand
PUT    /api/brands/{id}            - Update brand
DELETE /api/brands/{id}            - Delete brand
```

### Expense Endpoints
```
GET    /api/expenses               - Get all expenses
GET    /api/expenses/{id}          - Get expense by ID
POST   /api/expenses               - Create new expense
PUT    /api/expenses/{id}          - Update expense
DELETE /api/expenses/{id}          - Delete expense
GET    /api/expenses/total         - Get total expenses
```

### Dashboard Endpoints
```
GET    /api/dashboard/statistics   - Get dashboard statistics
GET    /api/dashboard/recent-sales - Get recent sales
GET    /api/dashboard/top-products - Get top products
```

## 📊 Dashboard Implementation

### Updated Features:
1. **Real-time Statistics**:
   - Total Sales (calculated from all sales)
   - Net Profit (Total Sales - Total Purchase - Total Expenses)
   - Invoice Due (sum of pending/partial payments)
   - Total Purchase
   - Total Expense
   - Product Count

2. **Monthly Sales Chart**:
   - Data grouped by month from actual sales
   - Dynamic calculation based on sale dates
   - Shows current year sales

3. **Loading State**:
   - Spinner animation while fetching data
   - User-friendly loading message

### Data Flow:
```
Component Mount → fetchDashboardData() → API Calls → Data Processing → State Update → UI Render
```

## 🎯 Next Steps to Complete Implementation

### 1. Update ListProduct Component
```javascript
import { useState, useEffect } from 'react';
import { productService } from '../services/apiService';

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await productService.delete(id);
        fetchProducts(); // Refresh list
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // ... rest of component
};
```

### 2. Update AddProduct Component
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await productService.create(productData);
    alert('Product created successfully!');
    navigate('/products/list');
  } catch (error) {
    console.error('Error creating product:', error);
    alert('Failed to create product');
  }
};
```

### 3. Update POS Component
```javascript
const [products, setProducts] = useState([]);

useEffect(() => {
  fetchProducts();
}, []);

const fetchProducts = async () => {
  try {
    const data = await productService.getAll();
    setProducts(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

const handleCompleteSale = async () => {
  try {
    const saleData = {
      customerId: selectedCustomer?.id,
      saleDate: new Date().toISOString(),
      totalAmount: calculateTotal(),
      paidAmount: paidAmount,
      paymentStatus: paidAmount >= calculateTotal() ? 'PAID' : 'PARTIAL',
      paymentMethod: paymentMethod,
      saleItems: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity
      }))
    };
    
    await saleService.create(saleData);
    alert('Sale completed successfully!');
    // Clear cart
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to complete sale');
  }
};
```

### 4. Update Customers Component
```javascript
useEffect(() => {
  fetchCustomers();
}, []);

const fetchCustomers = async () => {
  try {
    const data = await customerService.getAll();
    setCustomers(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

const handleAddCustomer = async (customerData) => {
  try {
    await customerService.create(customerData);
    fetchCustomers(); // Refresh
    alert('Customer added successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 5. Update Sales List Component
```javascript
useEffect(() => {
  fetchSales();
}, []);

const fetchSales = async () => {
  try {
    const data = await saleService.getAll();
    setSales(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🔐 Authentication Flow

### Login Process:
```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await authService.login({
      username: username,
      password: password
    });
    // Token automatically stored in localStorage
    navigate('/dashboard');
  } catch (error) {
    alert('Login failed');
  }
};
```

### Protected Routes:
```javascript
// Add to App.jsx or routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" />;
};
```

## 📦 Required NPM Package

Make sure axios is installed:
```bash
npm install axios
```

## 🚀 Usage Pattern for All Components

### Standard Pattern:
```javascript
import { useState, useEffect } from 'react';
import { serviceNameService } from '../services/apiService';

const Component = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await serviceNameService.getAll();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newData) => {
    try {
      await serviceNameService.create(newData);
      fetchData(); // Refresh
      alert('Created successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to create');
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await serviceNameService.update(id, updatedData);
      fetchData(); // Refresh
      alert('Updated successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await serviceNameService.delete(id);
        fetchData(); // Refresh
        alert('Deleted successfully!');
      } catch (err) {
        console.error('Error:', err);
        alert('Failed to delete');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    // Your JSX
  );
};
```

## 🔍 Error Handling

All API calls are wrapped in try-catch blocks:
- **401 Unauthorized**: Auto-redirect to login
- **403 Forbidden**: Log error to console
- **Network errors**: Display error message to user
- **Validation errors**: Show specific field errors

## 📱 Backend Requirements

Ensure your Spring Boot backend has:
1. **CORS configured** for `http://localhost:5173`
2. **JWT Security** enabled
3. **All REST controllers** properly mapped
4. **Database** connected and seeded with sample data

## 🎨 UI Enhancements

- Loading spinners for all data fetch operations
- Success/Error toast notifications
- Confirmation dialogs for delete operations
- Form validation before submission
- Empty state messages when no data

## 📈 Performance Optimization

- Data caching with React Query (recommended future enhancement)
- Pagination for large datasets
- Debounced search inputs
- Lazy loading for images

---

**Implementation Status**: Core API layer complete. Update individual components following the patterns above.
