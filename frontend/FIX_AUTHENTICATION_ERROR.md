# Authentication Error Fix - Quick Reference

## Problem Encountered
**Error:** Registration failed with 500 Internal Server Error
```
Illegal base64 character: '-'
```

## Root Cause
The JWT secret key in `application.properties` contained hyphens which are not valid base64 characters:
```properties
jwt.secret=your-256-bit-secret-key-change-this-in-production  ❌ WRONG
```

## Solution Applied

### 1. Fixed JWT Secret Key
**File:** `demo/src/main/resources/application.properties`

**Changed:**
```properties
# OLD (with hyphens - causes error)
jwt.secret=your-256-bit-secret-key-change-this-in-production

# NEW (alphanumeric only - works correctly)
jwt.secret=yourSecretKeyForJWTTokenGenerationAndValidationChangeThisInProduction123456789
```

### 2. Updated CORS Configuration
**File:** `demo/src/main/resources/application.properties`

**Changed:**
```properties
# OLD (missing port 5174)
cors.allowed.origins=http://localhost:5173,http://localhost:3000

# NEW (includes both frontend ports)
cors.allowed.origins=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

## Steps to Apply Fix

1. **Stop the backend** (if running):
   ```bash
   # In PowerShell
   Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Update application.properties** with the correct JWT secret (already done)

3. **Rebuild the project**:
   ```bash
   cd demo
   ./mvnw.cmd clean package -DskipTests
   ```

4. **Restart the backend**:
   ```bash
   ./mvnw.cmd spring-boot:run
   ```

5. **Test registration** at `http://localhost:5174/sign-up`

## Verification

Backend should start successfully with these messages:
```
Tomcat started on port 8080 (http) with context path '/api'
Started DemoApplication in X.XXX seconds
```

## Test Registration

1. Navigate to: `http://localhost:5174/sign-up`
2. Fill in the form:
   - Username: `testuser`
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm Password: `test123`
   - Role: CASHIER
3. Click "Create Account"
4. Should see success screen
5. Auto-redirect to sign-in after 2 seconds

## Expected Response

### Successful Registration:
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Successful Login:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "CASHIER"
  }
}
```

## Important Notes

### JWT Secret Key Requirements:
- ✅ Must be alphanumeric only
- ✅ Recommended length: 64+ characters
- ❌ No hyphens, spaces, or special characters
- ❌ Don't use simple words or patterns

### Production Recommendations:
```properties
# Generate a secure random key for production:
# Use a key generator or run this in terminal:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

jwt.secret=<generated-secure-key-here>
```

### CORS Configuration:
- Include all ports where frontend runs
- Development: 5173, 5174, 3000
- Production: Add your production domain

## Files Modified

1. ✅ `demo/src/main/resources/application.properties`
   - Fixed JWT secret key
   - Updated CORS origins

2. ✅ `AUTHENTICATION_GUIDE.md`
   - Added troubleshooting section
   - Updated environment variables section

## Status

✅ **FIXED** - Backend recompiled and restarted with correct configuration
✅ **TESTED** - Server started successfully on port 8080
✅ **READY** - Authentication endpoints ready for testing

## Next Steps

1. Test user registration
2. Test user login
3. Verify token is stored in localStorage
4. Test protected routes
5. Test logout functionality

---

**Date:** November 6, 2025
**Issue:** JWT Base64 Decoding Error
**Status:** ✅ Resolved
**Backend:** Running on `http://localhost:8080/api`
**Frontend:** Running on `http://localhost:5174`
