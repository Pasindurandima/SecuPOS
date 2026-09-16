# API Test Script

# Test the authentication and basic CRUD operations

$baseUrl = "http://localhost:8080/api"

# Colors for output
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Cyan"

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "`n=== Testing: $Name ===" -ForegroundColor $infoColor
    Write-Host "Method: $Method" -ForegroundColor $infoColor
    Write-Host "URL: $Url" -ForegroundColor $infoColor
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "Request Body: $($params.Body)" -ForegroundColor $infoColor
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✓ SUCCESS" -ForegroundColor $successColor
        Write-Host "Response:" -ForegroundColor $successColor
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor $successColor
        return $response
    }
    catch {
        Write-Host "✗ FAILED" -ForegroundColor $errorColor
        Write-Host "Error: $_" -ForegroundColor $errorColor
        Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor $errorColor
        return $null
    }
}

# Test 1: Register Admin User
$registerResponse = Test-Endpoint `
    -Name "Register Admin User" `
    -Method "POST" `
    -Url "$baseUrl/auth/register" `
    -Body @{
        username = "admin"
        email = "admin@pos.com"
        password = "admin123"
        firstName = "Admin"
        lastName = "User"
        phone = "+1234567890"
        address = "123 Admin St"
        role = "ADMIN"
    }

# Test 2: Login
$loginResponse = Test-Endpoint `
    -Name "Login as Admin" `
    -Method "POST" `
    -Url "$baseUrl/auth/login" `
    -Body @{
        username = "admin"
        password = "admin123"
    }

if ($loginResponse -and $loginResponse.data.token) {
    $token = $loginResponse.data.token
    $authHeader = @{
        "Authorization" = "Bearer $token"
    }
    
    Write-Host "`n========================================" -ForegroundColor $infoColor
    Write-Host "TOKEN OBTAINED - Testing Protected Endpoints" -ForegroundColor $infoColor
    Write-Host "========================================" -ForegroundColor $infoColor
    
    # Test 3: Create Category
    $categoryResponse = Test-Endpoint `
        -Name "Create Category" `
        -Method "POST" `
        -Url "$baseUrl/categories" `
        -Body @{
            name = "Electronics"
            description = "Electronic devices and gadgets"
        } `
        -Headers $authHeader
    
    $categoryId = if ($categoryResponse) { $categoryResponse.data.id } else { $null }
    
    # Test 4: Create Brand
    $brandResponse = Test-Endpoint `
        -Name "Create Brand" `
        -Method "POST" `
        -Url "$baseUrl/brands" `
        -Body @{
            name = "Dell"
            description = "Dell Inc. computer products"
        } `
        -Headers $authHeader
    
    $brandId = if ($brandResponse) { $brandResponse.data.id } else { $null }
    
    # Test 5: Create Product
    if ($categoryId -and $brandId) {
        $productResponse = Test-Endpoint `
            -Name "Create Product" `
            -Method "POST" `
            -Url "$baseUrl/products" `
            -Body @{
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
            } `
            -Headers $authHeader
        
        $productId = if ($productResponse) { $productResponse.data.id } else { $null }
    }
    
    # Test 6: Get All Products
    Test-Endpoint `
        -Name "Get All Products" `
        -Method "GET" `
        -Url "$baseUrl/products" `
        -Headers $authHeader
    
    # Test 7: Create Customer
    $customerResponse = Test-Endpoint `
        -Name "Create Customer" `
        -Method "POST" `
        -Url "$baseUrl/customers" `
        -Body @{
            name = "John Doe"
            email = "john@example.com"
            phone = "+1234567890"
            address = "123 Customer St"
            city = "New York"
            state = "NY"
            zipCode = "10001"
            customerGroup = "RETAIL"
        } `
        -Headers $authHeader
    
    $customerId = if ($customerResponse) { $customerResponse.data.id } else { $null }
    
    # Test 8: Create Sale (if we have customer and product)
    if ($customerId -and $productId) {
        $saleResponse = Test-Endpoint `
            -Name "Create Sale" `
            -Method "POST" `
            -Url "$baseUrl/sales" `
            -Body @{
                customerId = $customerId
                saleDate = (Get-Date).ToString("yyyy-MM-dd'T'HH:mm:ss")
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
            } `
            -Headers $authHeader
    }
    
    # Test 9: Get Dashboard Stats
    Test-Endpoint `
        -Name "Get Dashboard Statistics" `
        -Method "GET" `
        -Url "$baseUrl/dashboard/stats" `
        -Headers $authHeader
    
    # Test 10: Get All Categories
    Test-Endpoint `
        -Name "Get All Categories" `
        -Method "GET" `
        -Url "$baseUrl/categories" `
        -Headers $authHeader
    
    # Test 11: Get All Customers
    Test-Endpoint `
        -Name "Get All Customers" `
        -Method "GET" `
        -Url "$baseUrl/customers" `
        -Headers $authHeader
    
    Write-Host "`n========================================" -ForegroundColor $successColor
    Write-Host "ALL TESTS COMPLETED!" -ForegroundColor $successColor
    Write-Host "========================================" -ForegroundColor $successColor
    Write-Host "`nYour POS Backend is fully operational!" -ForegroundColor $successColor
    Write-Host "API Documentation: D:\Games\secU-dashboard\demo\API_DOCUMENTATION.md" -ForegroundColor $infoColor
    Write-Host "Base URL: $baseUrl" -ForegroundColor $infoColor
}
else {
    Write-Host "`n✗ FAILED TO OBTAIN TOKEN - Cannot test protected endpoints" -ForegroundColor $errorColor
}
