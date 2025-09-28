# Firebase Deployment Setup - Abhyatus

## 🚀 Current Workflow Configuration

### Active Workflows:

1. **`firebase-hosting-merge.yml`** ✅ **MAIN DEPLOYMENT**
   - **Triggers**: Push to `main` or `master` branch
   - **Action**: Deploys to live Firebase Hosting
   - **URL**: https://abhyatus.firebaseapp.com/

2. **`firebase-hosting-pull-request.yml`** ✅ **PREVIEW DEPLOYMENTS**
   - **Triggers**: Pull requests
   - **Action**: Creates preview deployments for testing
   - **URL**: Preview URLs for each PR

3. **`deploy.yml`** ⚠️ **LEGACY (GitHub Pages)**
   - **Triggers**: Push to `master` branch
   - **Action**: Deploys to GitHub Pages (legacy)
   - **Status**: Can be disabled if using Firebase only

## 🔧 Required Setup:

### GitHub Secrets:
- `FIREBASE_SERVICE_ACCOUNT_ABHYATUS`: Firebase service account JSON

### Firebase Configuration:
- **Project ID**: `abhyatus`
- **Public Directory**: `dist/abhyatus/browser`
- **SPA Routing**: All routes → `index.html`

## 📋 Deployment Flow:

1. **Push to `main` branch** → Auto-deploys to Firebase Hosting
2. **Create Pull Request** → Creates preview deployment
3. **Merge PR** → Deploys to live site

## 🎯 What Happens on Push:

```bash
git push origin main
```

**Automatic Process:**
1. GitHub Actions triggers `firebase-hosting-merge.yml`
2. Installs dependencies (`npm ci`)
3. Builds Angular app (`npm run build`)
4. Deploys to Firebase Hosting
5. Your app is live at: https://abhyatus.firebaseapp.com/

## ✅ Ready to Deploy:

Your Firebase setup is complete! Just push to `main` branch and your Abhyatus app will automatically deploy.
