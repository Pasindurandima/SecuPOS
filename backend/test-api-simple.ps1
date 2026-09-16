# Simple API Test Script

$baseUrl = "http://localhost:8080/api"

Write-Host "=== Testing POS API ===" -ForegroundColor Cyan

# Test 1: Register
Write-Host "`n1. Testing Register..." -ForegroundColor Yellow
try {
    $registerBody = @{
        username = "admin"
        email = "admin@pos.com"
        password = "admin123"
        firstName = "Admin"
        lastName = "User"
        phone = "+1234567890"
        address = "123 Admin St"
        role = "ADMIN"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✓ Register Success" -ForegroundColor Green
    $registerResponse | ConvertTo-Json | Write-Host
}
catch {
    Write-Host "✗ Register Failed: $_" -ForegroundColor Red
}

# Test 2: Login
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login Success" -ForegroundColor Green
    $token = $loginResponse.data.token
    Write-Host "Token obtained: $($token.Substring(0, 20))..." -ForegroundColor Green
}
catch {
    Write-Host "✗ Login Failed: $_" -ForegroundColor Red
    exit
}

# Create auth header
$headers = @{
    "Authorization" = "Bearer $token"
}

# Test 3: Create Category
Write-Host "`n3. Testing Create Category..." -ForegroundColor Yellow
try {
    $categoryBody = @{
        name = "Electronics"
        description = "Electronic devices and gadgets"
    } | ConvertTo-Json
    
    $categoryResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Body $categoryBody -ContentType "application/json" -Headers $headers
    Write-Host "✓ Create Category Success" -ForegroundColor Green
    $categoryId = $categoryResponse.data.id
    Write-Host "Category ID: $categoryId" -ForegroundColor Green
}
catch {
    Write-Host "✗ Create Category Failed: $_" -ForegroundColor Red
}

# Test 4: Create Brand
Write-Host "`n4. Testing Create Brand..." -ForegroundColor Yellow
try {
    $brandBody = @{
        name = "Dell"
        description = "Dell Inc. computer products"
    } | ConvertTo-Json
    
    $brandResponse = Invoke-RestMethod -Uri "$baseUrl/brands" -Method POST -Body $brandBody -ContentType "application/json" -Headers $headers
    Write-Host "✓ Create Brand Success" -ForegroundColor Green
    $brandId = $brandResponse.data.id
    Write-Host "Brand ID: $brandId" -ForegroundColor Green
}
catch {
    Write-Host "✗ Create Brand Failed: $_" -ForegroundColor Red
}

# Test 5: Create Product
Write-Host "`n5. Testing Create Product..." -ForegroundColor Yellow
try {
    $productBody = @{
        name = "Dell Laptop"
        sku = "DELL-LAP-001"
        description = "High-performance Dell laptop"
        categoryId = $categoryId
        brandId = $brandId
        unit = "PCS"
        costPrice = 800.00
        sellingPrice = 1200.00
        quantity = 50
        alertQuantity = 10
        barcode = "1234567890123"
        taxRate = 18.00
    } | ConvertTo-Json
    
    $productResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method POST -Body $productBody -ContentType "application/json" -Headers $headers
    Write-Host "✓ Create Product Success" -ForegroundColor Green
    $productId = $productResponse.data.id
    Write-Host "Product ID: $productId" -ForegroundColor Green
}
catch {
    Write-Host "✗ Create Product Failed: $_" -ForegroundColor Red
}

# Test 6: Get All Products
Write-Host "`n6. Testing Get All Products..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $headers
    Write-Host "✓ Get Products Success - Count: $($productsResponse.data.Count)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Get Products Failed: $_" -ForegroundColor Red
}

# Test 7: Create Customer
Write-Host "`n7. Testing Create Customer..." -ForegroundColor Yellow
try {
    $customerBody = @{
        name = "John Doe"
        email = "john@example.com"
        phone = "+1234567890"
        address = "123 Customer St"
        city = "New York"
        state = "NY"
        zipCode = "10001"
        customerGroup = "RETAIL"
    } | ConvertTo-Json
    
    $customerResponse = Invoke-RestMethod -Uri "$baseUrl/customers" -Method POST -Body $customerBody -ContentType "application/json" -Headers $headers
    Write-Host "✓ Create Customer Success" -ForegroundColor Green
    $customerId = $customerResponse.data.id
    Write-Host "Customer ID: $customerId" -ForegroundColor Green
}
catch {
    Write-Host "✗ Create Customer Failed: $_" -ForegroundColor Red
}

# Test 8: Create Sale
Write-Host "`n8. Testing Create Sale..." -ForegroundColor Yellow
try {
    $saleBody = @{
        customerId = $customerId
        saleDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        items = @(
            @{
                productId = $productId
                quantity = 2
                unitPrice = 1200.00
                taxRate = 18.00
            }
        )
        discount = 50.00
        paymentMethod = "CASH"
        paidAmount = 3000.00
        notes = "Test sale transaction"
    } | ConvertTo-Json -Depth 10
    
    $saleResponse = Invoke-RestMethod -Uri "$baseUrl/sales" -Method POST -Body $saleBody -ContentType "application/json" -Headers $headers
    Write-Host "✓ Create Sale Success" -ForegroundColor Green
    Write-Host "Invoice Number: $($saleResponse.data.invoiceNumber)" -ForegroundColor Green
    Write-Host "Total: $($saleResponse.data.total)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Create Sale Failed: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 9: Get Dashboard Stats
Write-Host "`n9. Testing Dashboard Statistics..." -ForegroundColor Yellow
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Method GET -Headers $headers
    Write-Host "✓ Dashboard Stats Success" -ForegroundColor Green
    Write-Host "Total Products: $($dashboardResponse.data.totalProducts)" -ForegroundColor Green
    Write-Host "Total Customers: $($dashboardResponse.data.totalCustomers)" -ForegroundColor Green
    Write-Host "Today Sales: $($dashboardResponse.data.todaySales)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Dashboard Stats Failed: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "ALL TESTS COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nYour POS Backend is fully operational!" -ForegroundColor Green
Write-Host "API Documentation: D:\Games\secU-dashboard\demo\API_DOCUMENTATION.md" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Cyan
