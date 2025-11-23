# 🔐 Google Authentication Setup Guide

This guide will help you set up Google authentication for your HabitBuddy application using Firebase Authentication.

## 📋 Prerequisites

- Firebase project created
- Firebase CLI installed (`npm install -g firebase-tools`)
- Angular project with Firebase SDK installed

## 🚀 Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `habit-buddy` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable**
4. Set **Project support email** (your email)
5. Click **Save**

### 1.3 Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register app with nickname: `habit-buddy-web`
5. Copy the Firebase configuration object

## 🔧 Step 2: Update Application Configuration

### 2.1 Update Environment Files

Replace the placeholder values in `projects/habit-buddy/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  appName: 'Abhyatus',
  appDescription: 'Discipline Through Practice - A Sanskrit-inspired habit tracking application',
  appVersion: '1.0.0',
  timezone: 'America/New_York',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  locale: 'en-US',
  firebase: {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

### 2.2 Update Firebase Config

The `projects/habit-buddy/src/firebase.config.ts` file is already configured to use environment variables.

## 🔐 Step 3: Authentication Features

### 3.1 Available Authentication Methods

Your application now supports:

- ✅ **Email/Password Sign-in**
- ✅ **Email/Password Sign-up**
- ✅ **Google Sign-in** (with popup)
- ✅ **Sign-out**
- ✅ **Authentication state management**
- ✅ **Route protection** (AuthGuard)

### 3.2 Authentication Flow

1. **First-time users**: Marketing page → Auth page → Goals page
2. **Returning users**: Auth page → Goals page
3. **Authenticated users**: Direct to Goals page
4. **Protected routes**: Automatically redirect to Auth page if not authenticated

## 🛡️ Step 4: Backend Authentication

### 4.1 Firebase Admin SDK Setup

The backend is already configured to verify Firebase ID tokens:

1. **Token Verification**: All API requests include Firebase ID tokens
2. **User Management**: Automatic user creation/update in database
3. **Protected Routes**: All habit-related endpoints require authentication

### 4.2 Backend Configuration

Update your Firebase project ID in backend files:

1. **Firebase Functions**: Update `functions/main.py` with your project ID
2. **Environment Variables**: Set `FIREBASE_PROJECT_ID` in your deployment environment

## 🧪 Step 5: Testing Authentication

### 5.1 Local Testing

1. **Start the backend**:
   ```bash
   cd backend
   py main-simple.py
   ```

2. **Start the frontend**:
   ```bash
   npm start
   ```

3. **Test authentication**:
   - Visit `http://localhost:4200`
   - Try Google sign-in
   - Try email/password sign-up
   - Test protected routes

### 5.2 Production Testing

1. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

2. **Test on live site**:
   - Visit your Firebase hosting URL
   - Test all authentication methods
   - Verify API calls work with authentication

## 🔧 Step 6: Customization

### 6.1 Authentication UI

The authentication component (`auth.component.html`) includes:
- Email/password form
- Google sign-in button
- Sign-up/Sign-in toggle
- Error handling
- Loading states

### 6.2 Additional Providers

To add more authentication providers:

1. **Enable in Firebase Console**:
   - Go to Authentication → Sign-in method
   - Enable desired providers (Facebook, Twitter, etc.)

2. **Update AuthService**:
   ```typescript
   // Add new provider methods
   async signInWithFacebook(): Promise<AuthUser> {
     const provider = new FacebookAuthProvider();
     const result = await signInWithPopup(auth, provider);
     // ... handle result
   }
   ```

3. **Update AuthComponent**:
   ```html
   <button (click)="signInWithFacebook()" class="auth-button facebook">
     Continue with Facebook
   </button>
   ```

## 🚨 Troubleshooting

### Common Issues

1. **"Firebase not initialized"**:
   - Check Firebase configuration in environment files
   - Ensure Firebase SDK is properly imported

2. **"Google sign-in popup blocked"**:
   - Check browser popup settings
   - Ensure HTTPS in production

3. **"Invalid API key"**:
   - Verify Firebase configuration
   - Check API key restrictions in Firebase Console

4. **"CORS errors"**:
   - Update CORS settings in backend
   - Check allowed origins in Firebase Console

### Debug Mode

Enable debug logging:

```typescript
// In firebase.config.ts
import { connectAuthEmulator } from 'firebase/auth';

if (!environment.production) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Angular Firebase Integration](https://github.com/angular/angularfire)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Google authentication enabled
- [ ] Firebase configuration updated
- [ ] Environment files configured
- [ ] Authentication service working
- [ ] Route protection active
- [ ] Backend token verification working
- [ ] Local testing successful
- [ ] Production deployment working

---

**🎉 Congratulations!** Your HabitBuddy application now has full Google authentication support!
