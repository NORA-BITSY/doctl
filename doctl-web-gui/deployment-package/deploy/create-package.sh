#!/bin/bash

# Create deployment package
# Run this on your local machine to prepare files for upload

echo "📦 Creating deployment package for DigitalOcean Admin Panel..."

# Create deployment directory
mkdir -p deployment-package
cd deployment-package

# Copy application files (excluding node_modules and build artifacts)
echo "📋 Copying application files..."
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='deploy' --exclude='deployment-package' ../ ./

# Copy deployment scripts
echo "📋 Copying deployment scripts..."
cp -r ../deploy ./

# Make scripts executable
chmod +x deploy/*.sh

# Create archive
echo "📦 Creating deployment archive..."
cd ..
tar -czf doctl-admin-deployment.tar.gz deployment-package/

echo "✅ Deployment package created: doctl-admin-deployment.tar.gz"
echo "📤 Upload this file to your droplet and extract it in /tmp"