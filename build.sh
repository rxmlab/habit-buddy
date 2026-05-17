#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing frontend dependencies..."
npm install

echo "Building Angular frontend..."
npm run build

echo "Installing backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt
