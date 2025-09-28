# 🧪 Google Authentication Test

This document provides instructions for testing the Google authentication implementation.

## 📋 Prerequisites

1. **Firebase Project Setup**:
   - Firebase project created
   - Google authentication enabled
   - Firebase configuration updated in environment files

2. **Dependencies Installed**:
   ```bash
   npm install firebase @angular/fire
   ```

## 🚀 Testing Steps

### Step 1: Start the Application

1. **Start the backend** (if testing with authentication):
   ```bash
   cd backend
   py main-simple.py
   ```

2. **Start the frontend**:
   ```bash
   npm start
   ```

3. **Open browser**: Navigate to `http://localhost:4200`

### Step 2: Test Authentication Flow

#### 2.1 First Visit (Marketing Page)
- ✅ Should redirect to marketing page
- ✅ Click "Let's Start Something" button
- ✅ Should redirect to auth page

#### 2.2 Authentication Page
- ✅ Should show email/password form
- ✅ Should show "Continue with Google" button
- ✅ Should toggle between Sign In and Sign Up

#### 2.3 Google Sign-In Test
1. Click "Continue with Google" button
2. Google popup should appear
3. Complete Google authentication
4. Should redirect to goals page

#### 2.4 Email/Password Test
1. Toggle to "Sign Up" mode
2. Enter email and password
3. Click "Create Account"
4. Should redirect to goals page

#### 2.5 Route Protection Test
1. Sign out (if sign-out button exists)
2. Try to navigate to `/goals` directly
3. Should redirect to auth page

### Step 3: Verify Authentication State

#### 3.1 Check Console Logs
- No Firebase errors in browser console
- Authentication state changes logged
- API calls include authentication headers

#### 3.2 Check Network Requests
- API calls include `Authorization: Bearer <token>` header
- Backend responds with user data
- No 401 Unauthorized errors

## 🔧 Troubleshooting

### Common Issues

1. **"Firebase not initialized"**:
   - Check Firebase configuration in environment files
   - Ensure Firebase SDK is installed: `npm install firebase`

2. **"Google sign-in popup blocked"**:
   - Check browser popup settings
   - Try in incognito mode
   - Ensure HTTPS in production

3. **"Invalid API key"**:
   - Verify Firebase configuration
   - Check API key restrictions in Firebase Console

4. **"CORS errors"**:
   - Update CORS settings in backend
   - Check allowed origins in Firebase Console

### Debug Steps

1. **Check Firebase Console**:
   - Go to Authentication → Users
   - Verify users are being created
   - Check sign-in methods

2. **Check Browser Console**:
   - Look for Firebase errors
   - Check authentication state
   - Verify token generation

3. **Check Network Tab**:
   - Verify API calls include auth headers
   - Check response status codes
   - Look for authentication errors

## ✅ Success Criteria

- [ ] Marketing page loads correctly
- [ ] Auth page loads with Google button
- [ ] Google sign-in popup works
- [ ] Email/password sign-up works
- [ ] Authentication state persists
- [ ] Route protection works
- [ ] API calls include auth headers
- [ ] Backend verifies tokens correctly
- [ ] User data is stored in Firebase
- [ ] No console errors

## 🎯 Next Steps

After successful testing:

1. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

2. **Test in Production**:
   - Verify authentication works on live site
   - Test with real Google accounts
   - Check Firebase Console for user data

3. **Add Additional Features**:
   - User profile management
   - Password reset
   - Email verification
   - Additional auth providers

---

**🎉 Congratulations!** If all tests pass, your Google authentication is working correctly!
