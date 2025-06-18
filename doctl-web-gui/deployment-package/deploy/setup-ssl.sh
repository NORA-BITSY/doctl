#!/bin/bash

# SSL Setup Script
# Configures Nginx and obtains SSL certificate

set -e

DOMAIN="admin.realproductpat.com"

echo "🔒 Setting up SSL for $DOMAIN..."

# Install Nginx configuration
echo "⚙️ Installing Nginx configuration..."
cp nginx-config /etc/nginx/sites-available/doctl-admin
ln -sf /etc/nginx/sites-available/doctl-admin /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx

# Obtain SSL certificate
echo "📜 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@realproductpat.com

# Setup auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo "✅ SSL setup complete!"
echo "🌐 Your site is now available at: https://$DOMAIN"