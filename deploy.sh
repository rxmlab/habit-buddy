#!/bin/bash

echo "🚀 Building Abhyatus for Firebase deployment..."

# Build the Angular app
echo "📦 Building Angular application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output: dist/abhyatus/browser"
    
    # Verify the build files exist
    if [ -f "dist/abhyatus/browser/index.html" ]; then
        echo "✅ index.html found in build output"
    else
        echo "❌ index.html not found in build output!"
        exit 1
    fi
    
    # Deploy to Firebase
    echo "🔥 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "🌐 Your app is live at: https://abhyatus.firebaseapp.com/"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
