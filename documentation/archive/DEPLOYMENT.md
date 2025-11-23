# Abhyatus - Firebase Deployment Guide

## 🚀 Quick Deployment

### Manual Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

3. **Your app will be live at:** https://abhyatus.firebaseapp.com/

### Automated Deployment (GitHub Actions)

The app is configured for automatic deployment via GitHub Actions when you push to the `main` branch.

**Required GitHub Secrets:**
- `FIREBASE_SERVICE_ACCOUNT_ABHYATUS`: Firebase service account JSON key

**To set up:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Add the JSON content as a GitHub secret named `FIREBASE_SERVICE_ACCOUNT_ABHYATUS`

## 🔧 Configuration Files

- `firebase.json`: Firebase hosting configuration
- `.firebaserc`: Firebase project settings
- `.github/workflows/firebase-deploy.yml`: GitHub Actions workflow
- `deploy.sh`: Manual deployment script

## 📁 Build Output

The Angular app builds to `dist/abhyatus/browser/` which contains:
- `index.html`: Main app entry point
- `main-*.js`: Angular application bundle
- `styles-*.css`: Application styles
- `chunk-*.js`: Lazy-loaded feature modules
- `manifest.webmanifest`: PWA manifest
- `icons/`: App icons for PWA

## 🌐 Live App Features

- **First-time users**: See marketing page with Sanskrit wisdom
- **Returning users**: Go directly to goals page
- **PWA support**: Can be installed as a mobile app
- **Offline functionality**: Works without internet connection
- **Responsive design**: Works on all devices

## 🐛 Troubleshooting

**If you see "Firebase Hosting Setup Complete":**
- Check that `firebase.json` points to `dist/abhyatus/browser`
- Ensure the build completed successfully
- Verify Firebase project ID matches `.firebaserc`

**If deployment fails:**
- Run `firebase login` first
- Check Firebase project permissions
- Verify build output exists in correct directory
