# POS System API Documentation

Base URL: `http://localhost:8080/api`

## Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@pos.com",
  "password": "password123",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+1234567890",
  "address": "123 Main St",
  "role": "ADMIN"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "admin",
    "email": "admin@pos.com",
    "role": "ADMIN"
  }
}
```

## Product Management

### Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Laptop",
  "sku": "LAP-001",
  "description": "High-performance laptop",
  "categoryId": 1,
  "brandId": 1,
  "unit": "PCS",
  "costPrice": 800.00,
  "sellingPrice": 1200.00,
  "quantity": 50,
  "alertQuantity": 10,
  "barcode": "1234567890123",
  "imageUrl": "https://example.com/laptop.jpg",
  "taxRate": 18.00
}
```

### Get All Products
```http
GET /api/products
Authorization: Bearer {token}
```

### Search Products
```http
GET /api/products/search?name=laptop
Authorization: Bearer {token}
```

### Get Low Stock Products
```http
GET /api/products/low-stock
Authorization: Bearer {token}
```

### Get Product by ID
```http
GET /api/products/{id}
Authorization: Bearer {token}
```

### Update Product
```http
PUT /api/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Laptop",
  "sku": "LAP-001",
  "description": "Updated description",
  "categoryId": 1,
  "brandId": 1,
  "unit": "PCS",
  "costPrice": 850.00,
  "sellingPrice": 1250.00,
  "quantity": 45,
  "alertQuantity": 10,
  "taxRate": 18.00
}
```

### Delete Product (Soft Delete)
```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

## Category Management

### Create Category
```http
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and gadgets"
}
```

### Get All Categories
```http
GET /api/categories
Authorization: Bearer {token}
```

### Get Category by ID
```http
GET /api/categories/{id}
Authorization: Bearer {token}
```

### Update Category
```http
PUT /api/categories/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Electronics Updated",
  "description": "Updated description"
}
```

### Delete Category
```http
DELETE /api/categories/{id}
Authorization: Bearer {token}
```

## Brand Management

### Create Brand
```http
POST /api/brands
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dell",
  "description": "Dell Inc. computer products"
}
```

### Get All Brands
```http
GET /api/brands
Authorization: Bearer {token}
```

## Customer Management

### Create Customer
```http
POST /api/customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Customer St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "customerGroup": "RETAIL"
}
```

### Get All Customers
```http
GET /api/customers
Authorization: Bearer {token}
```

### Search Customers
```http
GET /api/customers/search?name=john
Authorization: Bearer {token}
```

## Supplier Management

### Create Supplier
```http
POST /api/suppliers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Tech Suppliers Inc",
  "email": "contact@techsuppliers.com",
  "phone": "+1234567890",
  "address": "456 Supplier Rd",
  "city": "Los Angeles",
  "state": "CA",
  "zipCode": "90001",
  "contactPerson": "Jane Smith"
}
```

### Get All Suppliers
```http
GET /api/suppliers
Authorization: Bearer {token}
```

## Sales (POS Transactions)

### Create Sale
```http
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": 1,
  "saleDate": "2025-11-04T08:30:00",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 1200.00,
      "taxRate": 18.00
    },
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 500.00,
      "taxRate": 18.00
    }
  ],
  "discount": 100.00,
  "paymentMethod": "CASH",
  "paidAmount": 3000.00,
  "notes": "Customer requested gift wrapping"
}

Response:
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "id": 1,
    "invoiceNumber": "INV20251104083000",
    "saleDate": "2025-11-04T08:30:00",
    "subtotal": 2900.00,
    "tax": 522.00,
    "discount": 100.00,
    "total": 3322.00,
    "paidAmount": 3000.00,
    "changeAmount": 0.00,
    "paymentMethod": "CASH",
    "status": "COMPLETED"
  }
}
```

### Get All Sales
```http
GET /api/sales
Authorization: Bearer {token}
```

### Get Sales by Date Range
```http
GET /api/sales/date-range?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer {token}
```

### Get Sale by ID
```http
GET /api/sales/{id}
Authorization: Bearer {token}
```

### Cancel Sale (Restores Stock)
```http
PUT /api/sales/{id}/cancel
Authorization: Bearer {token}
```

### Get Total Sales
```http
GET /api/sales/total?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer {token}
```

### Get Sales Count
```http
GET /api/sales/count?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer {token}
```

## Purchase Orders

### Create Purchase
```http
POST /api/purchases
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplierId": 1,
  "purchaseDate": "2025-11-04T10:00:00",
  "items": [
    {
      "productId": 1,
      "quantity": 100,
      "unitCost": 800.00,
      "taxRate": 18.00
    }
  ],
  "notes": "Bulk order for November"
}
```

### Get All Purchases
```http
GET /api/purchases
Authorization: Bearer {token}
```

### Cancel Purchase
```http
PUT /api/purchases/{id}/cancel
Authorization: Bearer {token}
```

## Expenses

### Create Expense
```http
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Office Rent - November",
  "description": "Monthly office rent payment",
  "category": "RENT",
  "amount": 2000.00,
  "expenseDate": "2025-11-01T00:00:00",
  "paymentMethod": "BANK_TRANSFER",
  "documentUrl": "https://example.com/receipt.pdf"
}
```

### Get All Expenses
```http
GET /api/expenses
Authorization: Bearer {token}
```

### Get Expenses by Date Range
```http
GET /api/expenses/date-range?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer {token}
```

### Get Expenses by Category
```http
GET /api/expenses/category/RENT
Authorization: Bearer {token}
```

### Get Total Expenses
```http
GET /api/expenses/total?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer {token}
```

## Dashboard Statistics

### Get Dashboard Stats
```http
GET /api/dashboard/stats
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalProducts": 150,
    "lowStockProducts": 12,
    "totalCustomers": 45,
    "totalSuppliers": 8,
    "todaySales": 15420.00,
    "todaySalesCount": 23,
    "monthSales": 345678.00,
    "yearSales": 2456789.00,
    "todayPurchases": 48000.00,
    "monthPurchases": 567890.00,
    "yearPurchases": 3456789.00,
    "todayExpenses": 2500.00,
    "monthExpenses": 45000.00,
    "yearExpenses": 234567.00,
    "todayProfit": -35080.00,
    "monthProfit": -267212.00,
    "yearProfit": -1234567.00
  }
}
```

## Enums Reference

### User Roles
- `ADMIN` - Full system access
- `MANAGER` - Management access
- `USER` - Basic user access

### Customer Groups
- `REGULAR` - Regular customers
- `WHOLESALE` - Wholesale customers
- `RETAIL` - Retail customers
- `VIP` - VIP customers

### Payment Methods
- `CASH` - Cash payment
- `CARD` - Card payment
- `MOBILE_PAYMENT` - Mobile payment (e.g., PayPal, Google Pay)
- `BANK_TRANSFER` - Bank transfer

### Sale Status
- `DRAFT` - Draft sale (not completed)
- `COMPLETED` - Completed sale
- `CANCELLED` - Cancelled sale
- `RETURNED` - Returned sale

### Purchase Status
- `PENDING` - Pending purchase
- `RECEIVED` - Received purchase
- `CANCELLED` - Cancelled purchase

### Expense Categories
- `RENT` - Rent expenses
- `UTILITIES` - Utility bills
- `SALARIES` - Employee salaries
- `MARKETING` - Marketing expenses
- `OFFICE_SUPPLIES` - Office supplies
- `MAINTENANCE` - Maintenance expenses
- `OTHER` - Other expenses

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access",
  "data": null
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "data": null
}
```

## Notes

1. **Authentication**: All endpoints except `/auth/register` and `/auth/login` require JWT token in the Authorization header
2. **Date Format**: Use ISO 8601 format (`yyyy-MM-dd'T'HH:mm:ss`)
3. **Decimal Format**: Use decimal numbers with 2 decimal places for money values
4. **Stock Management**: Stock is automatically updated when creating/cancelling sales and purchases
5. **Invoice Numbers**: Automatically generated in format `INV{yyyyMMddHHmmss}`
6. **Purchase Numbers**: Automatically generated in format `PO{yyyyMMddHHmmss}`
7. **Soft Delete**: Delete operations set `isActive` to `false` instead of removing records
8. **CORS**: Enabled for `http://localhost:5173` and `http://localhost:3000`
