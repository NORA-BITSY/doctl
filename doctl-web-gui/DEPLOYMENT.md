# 🚀 DigitalOcean Admin Panel - Production Deployment Guide

Deploy the doctl web GUI to your Debian 12 droplet at **admin.realproductpat.com** with secure authentication and Google Authenticator.

## 📋 Prerequisites

- **Debian 12 droplet** (16GB RAM, 8 CPU, 480GB - NYC1) ✅
- **Domain configured** - Point `admin.realproductpat.com` A record to your droplet IP
- **Root SSH access** to the droplet
- **DigitalOcean API token** for the application

## 🎯 Quick Deploy Steps

### Step 1: Prepare Local Files

```bash
# From your local machine in the doctl-web-gui directory
cd /Users/productpat/Digital-Ocean/doctl/doctl-web-gui
chmod +x deploy/*.sh
./deploy/create-package.sh
```

### Step 2: Upload to Droplet

```bash
# Upload the deployment package to your droplet
scp doctl-admin-deployment.tar.gz root@143.244.162.5:/tmp/

# Connect to your droplet
ssh root@143.244.162.5
```

### Step 3: Extract and Setup System

```bash
# On the droplet
cd /tmp
tar -xzf doctl-admin-deployment.tar.gz
cd deployment-package

# Run system setup (installs Node.js, doctl, Nginx, PM2)
chmod +x deploy/*.sh
./deploy/setup-system.sh
```

### Step 4: Deploy Application

```bash
# Copy application files to web directory
cp -r . /var/www/doctl-admin/
chown -R www-data:www-data /var/www/doctl-admin/

# Setup and start the application
cd /var/www/doctl-admin
./deploy/setup-app.sh
```

### Step 5: Configure SSL and Domain

```bash
# Before running SSL setup, ensure DNS is pointing to your droplet
# Check: dig admin.realproductpat.com

# Setup Nginx and SSL certificate
./deploy/setup-ssl.sh
```

## 🔐 Security Features

### Authentication System
- **Username/Password login** with bcrypt hashing
- **Google Authenticator (TOTP)** two-factor authentication
- **JWT tokens** with HTTP-only cookies
- **Session management** with automatic expiration

### Network Security
- **SSL/TLS encryption** with Let's Encrypt certificates
- **Rate limiting** on login endpoints (5 attempts/minute)
- **Security headers** (HSTS, CSP, X-Frame-Options, etc.)
- **Nginx reverse proxy** with proper headers

### Default Credentials
```
Username: admin
Password: admin123
```
⚠️ **IMPORTANT**: Change these immediately after first login!

## 🔧 Post-Deployment Configuration

### 1. First Login and Security Setup

1. Visit `https://admin.realproductpat.com/login`
2. Login with default credentials
3. **Change admin password immediately**
4. **Setup Google Authenticator**:
   - Navigate to Settings/Security
   - Click "Setup 2FA"
   - Scan QR code with Google Authenticator app
   - Enter verification code to enable

### 2. Add Your DigitalOcean API Token

1. Go to Settings/API Configuration
2. Enter your DigitalOcean API token
3. Test connection to verify access

### 3. Create Additional Users (Optional)

```bash
# Using the API or admin interface
curl -X POST https://admin.realproductpat.com/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"secure_password","role":"user"}'
```

## 🛠️ Management Commands

### Application Management
```bash
# Check application status
sudo -u www-data pm2 status

# Restart application
sudo -u www-data pm2 restart doctl-admin

# View logs
sudo -u www-data pm2 logs doctl-admin

# Monitor resources
sudo -u www-data pm2 monit
```

### SSL Certificate Management
```bash
# Check certificate status
certbot certificates

# Test renewal
certbot renew --dry-run

# Manual renewal (if needed)
certbot renew
```

### Nginx Management
```bash
# Check Nginx status
systemctl status nginx

# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# View access logs
tail -f /var/log/nginx/doctl-admin.access.log
```

## 📊 Monitoring and Logs

### Application Logs
```bash
# PM2 logs
tail -f /var/log/pm2/doctl-admin.log

# Nginx logs
tail -f /var/log/nginx/doctl-admin.access.log
tail -f /var/log/nginx/doctl-admin.error.log

# System logs
journalctl -u nginx -f
```

### Performance Monitoring
```bash
# Server resources
htop
iotop
netstat -tulpn

# Application performance
sudo -u www-data pm2 monit
```

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# 1. Backup current version
cp -r /var/www/doctl-admin /var/www/doctl-admin.backup

# 2. Upload new version
scp new-deployment.tar.gz root@143.244.162.5:/tmp/

# 3. Extract and deploy
cd /tmp && tar -xzf new-deployment.tar.gz
cp -r deployment-package/* /var/www/doctl-admin/
chown -R www-data:www-data /var/www/doctl-admin/

# 4. Rebuild and restart
cd /var/www/doctl-admin
npm install
npm run build
sudo -u www-data pm2 restart doctl-admin
```

### System Updates
```bash
# Update system packages
apt update && apt upgrade -y

# Update Node.js (if needed)
# Follow Node.js upgrade procedures

# Update doctl CLI
wget https://github.com/digitalocean/doctl/releases/latest/download/doctl-linux-amd64.tar.gz
tar -xzf doctl-linux-amd64.tar.gz
mv doctl /usr/local/bin/
```

## 🚨 Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check PM2 status
sudo -u www-data pm2 status

# Check logs for errors
sudo -u www-data pm2 logs doctl-admin

# Restart application
sudo -u www-data pm2 restart doctl-admin
```

**SSL certificate issues:**
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew

# Check Nginx configuration
nginx -t
```

**Cannot access website:**
```bash
# Check if services are running
systemctl status nginx
sudo -u www-data pm2 status

# Check firewall
ufw status

# Check DNS resolution
dig admin.realproductpat.com
```

**Login issues:**
```bash
# Check application logs
sudo -u www-data pm2 logs doctl-admin

# Check if JWT secret is set
grep JWT_SECRET /var/www/doctl-admin/.env.production
```

## 🔒 Security Recommendations

1. **Regular Updates**: Keep system and dependencies updated
2. **Backup Strategy**: Regular backups of application data and configurations
3. **Monitor Access**: Review access logs regularly
4. **Fail2Ban**: Consider installing fail2ban for additional protection
5. **Firewall**: Configure UFW to only allow necessary ports
6. **User Management**: Use principle of least privilege
7. **API Token Security**: Rotate DigitalOcean API tokens regularly

## 📧 Support

For issues or questions:
- Check logs first: `/var/log/pm2/` and `/var/log/nginx/`
- Review this deployment guide
- Check DigitalOcean documentation for API-related issues

## 🎉 Success!

Your DigitalOcean Admin Panel is now running at:
**https://admin.realproductpat.com/login**

Features available:
- ✅ Secure login with Google Authenticator
- ✅ Complete DigitalOcean resource management
- ✅ Interactive terminal for doctl commands
- ✅ Real-time dashboard with resource statistics
- ✅ SSL encryption and security headers
- ✅ Production-ready deployment with PM2 and Nginx