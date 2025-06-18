#!/bin/bash

# Application Setup Script
# Sets up the Next.js app with PM2

set -e

APP_DIR="/var/www/doctl-admin"
DOMAIN="admin.realproductpat.com"

echo "🔧 Setting up DigitalOcean Admin Panel application..."

# Navigate to app directory
cd $APP_DIR

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Create environment file
echo "📝 Creating environment configuration..."
cat > .env.production << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
EOF

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'doctl-admin',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/doctl-admin-error.log',
    out_file: '/var/log/pm2/doctl-admin-out.log',
    log_file: '/var/log/pm2/doctl-admin.log',
    time: true
  }]
}
EOF

# Create log directory
mkdir -p /var/log/pm2
chown -R www-data:www-data /var/log/pm2

# Start application with PM2
echo "🚀 Starting application with PM2..."
su -s /bin/bash www-data -c "cd $APP_DIR && pm2 start ecosystem.config.js"
su -s /bin/bash www-data -c "pm2 save"

echo "✅ Application setup complete!"
echo "🌐 App running on port 3000"