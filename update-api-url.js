#!/usr/bin/env node

/**
 * Script to automatically update the API URL in environment files
 * This script gets the latest Vercel deployment URL and updates the environment files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to environment file
const envPath = path.join(__dirname, 'projects', 'habit-buddy', 'src', 'environments', 'environment.ts');

console.log('🔄 Updating API URL in environment files...');

try {
  // Get the latest Vercel deployment URL
  console.log('📡 Getting latest Vercel deployment URL...');
  
  // Run vercel ls to get the latest deployment
  const output = execSync('vercel ls --json', { encoding: 'utf8', cwd: path.join(__dirname, 'vercel-backend') });
  const deployments = JSON.parse(output);
  
  // Find the latest production deployment
  const latestDeployment = deployments.find(dep => dep.state === 'READY' && dep.target === 'production');
  
  if (!latestDeployment) {
    throw new Error('No production deployment found');
  }
  
  const apiUrl = `https://${latestDeployment.url}`;
  console.log(`✅ Found latest deployment: ${apiUrl}`);
  
  // Read the current environment file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update the production API URL
  const updatedContent = envContent.replace(
    /apiUrl:\s*'[^']*',\s*\/\/ Production API URL/g,
    `apiUrl: '${apiUrl}', // Production API URL`
  );
  
  // Write the updated content back
  fs.writeFileSync(envPath, updatedContent);
  
  console.log('✅ Environment file updated successfully!');
  console.log(`📝 Updated API URL to: ${apiUrl}`);
  
} catch (error) {
  console.error('❌ Error updating API URL:', error.message);
  console.log('💡 Make sure you are logged into Vercel CLI and have deployed the backend');
  process.exit(1);
}
