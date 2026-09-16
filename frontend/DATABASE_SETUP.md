# Quick Start Guide - Authentication Testing

## Issue
The backend cannot start because MySQL database is not running.

## Solution 1: Start MySQL Database (Recommended for Production)

### Option A: If MySQL is installed
1. Open Services (Win + R, type `services.msc`)
2. Find "MySQL" service
3. Right-click and select "Start"

### Option B: Using XAMPP
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL

### Option C: Using Command Line
```powershell
# Start MySQL service
net start MySQL
```

## Solution 2: Use H2 In-Memory Database (Quick Testing)

If you just want to test the authentication quickly without setting up MySQL, I can configure the backend to use H2 (in-memory database).

### Steps to switch to H2:
1. I'll update `pom.xml` to include H2 dependency
2. Update `application.properties` to use H2
3. Restart the backend

**Note:** H2 data is temporary and will be lost when the server stops.

## Current Status

The frontend authentication pages are complete and ready:
- ✅ Sign In page (`/sign-in`)
- ✅ Sign Up page (`/sign-up`)
- ✅ Protected routes
- ✅ Logout functionality
- ✅ Auth service updated to handle nested response data

Once the database is running, you can:
1. Navigate to `http://localhost:5174/sign-up`
2. Register a new user
3. Sign in with your credentials
4. Automatically log into the dashboard

## Which solution do you prefer?
1. Start MySQL (best for production use)
2. Use H2 for quick testing (data will be temporary)
