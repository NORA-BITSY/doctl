#!/bin/bash

# DigitalOcean Admin Panel Deployment Script
# For Debian 12 with Nginx, PM2, and SSL

set -e

echo "🚀 Starting DigitalOcean Admin Panel deployment..."

# Variables
DOMAIN="admin.realproductpat.com"
APP_DIR="/var/www/doctl-admin"
USER="www-data"
NODE_VERSION="18"

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js and npm
echo "📦 Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Install doctl CLI
echo "📦 Installing doctl CLI..."
cd /tmp
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
mv doctl /usr/local/bin/
chmod +x /usr/local/bin/doctl

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
mkdir -p $APP_DIR
chown -R $USER:$USER $APP_DIR

# Create systemd service for PM2
echo "🔧 Creating PM2 systemd service..."
pm2 startup systemd -u $USER --hp /var/www
systemctl enable pm2-www-data

echo "✅ System setup complete!"
echo "📋 Next steps:"
echo "1. Upload your application files to $APP_DIR"
echo "2. Run the app setup script: ./setup-app.sh"
echo "3. Configure SSL: ./setup-ssl.sh"