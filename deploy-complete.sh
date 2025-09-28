#!/bin/bash

# HabitBuddy Complete Deployment Script
# Deploys both backend (Vercel) and frontend (Firebase) automatically

set -e

echo "🚀 Deploying HabitBuddy Complete Stack..."

# Check prerequisites
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install: npm install -g firebase-tools"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install: npm install -g vercel"
    exit 1
fi

if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Run: firebase login"
    exit 1
fi

# Deploy backend to Vercel
echo "🔧 Deploying backend to Vercel..."
cd vercel-backend
vercel --prod --yes || exit 1
cd ..

# Update API URL from latest Vercel deployment
echo "🔄 Updating API URL from latest Vercel deployment..."
if command -v node &> /dev/null; then
    node update-api-url.js || echo "⚠️  Warning: Could not auto-update API URL. Please update manually."
else
    echo "⚠️  Warning: Node.js not found. Please update API URL manually in environment.ts"
fi

# Build frontend
echo "🏗️ Building Angular frontend..."
npm run build || exit 1

# Deploy frontend to Firebase Hosting
echo "🔥 Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting || exit 1

echo ""
echo "✅ Complete deployment successful!"
echo "🌐 Frontend: https://abhyatus.web.app"
echo "🔧 Backend: Check Vercel dashboard for URL"
echo ""
echo "🎉 Your app is now live and FREE!"
