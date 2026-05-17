#!/bin/bash

# HabitBuddy FREE Deployment Script
# Deploys Angular frontend to Firebase Hosting (FREE)

set -e

echo "🚀 Deploying HabitBuddy (100% FREE)..."

# Check prerequisites
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install: npm install -g firebase-tools"
    exit 1
fi

if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Run: firebase login"
    exit 1
fi



# Build frontend (dist folder will be automatically cleared)
echo "🏗️ Building Angular frontend..."
npm run build || exit 1

# Deploy frontend to Firebase Hosting (FREE)
echo "🔥 Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting || exit 1

echo ""
echo "✅ Frontend deployed! Available at: https://abhyatus.web.app"
echo ""
echo "📋 Next steps for complete deployment:"

echo "2. Configure Firebase Authentication:"
echo "   - Enable Google Sign-In in Firebase Console"
echo "   - Add your domain to authorized domains"
echo ""
echo "🎉 Your app is now live and FREE!"
