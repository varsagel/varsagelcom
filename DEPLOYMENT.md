# Varsagel Production Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository
- PostgreSQL database (Supabase, PlanetScale, or Neon)

#### Steps

1. **Prepare Environment Variables**
   ```bash
   cp .env.production .env.local
   ```
   Update the following variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Strong secret key (32+ characters)
   - `NEXT_PUBLIC_APP_URL`: Your domain (https://varsagel.com)

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables in Vercel**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.production`

4. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Option 2: Docker Deployment

#### Prerequisites
- Docker and Docker Compose
- Domain name and SSL certificates
- PostgreSQL database

#### Steps

1. **Prepare Environment**
   ```bash
   cp .env.production .env
   # Edit .env with your production values
   ```

2. **Build and Deploy**
   ```bash
   docker-compose up -d --build
   ```

3. **Run Migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

### Option 3: VPS/Server Deployment

#### Prerequisites
- Ubuntu/Debian server
- Node.js 18+
- PostgreSQL
- Nginx
- PM2 (Process Manager)

#### Steps

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib -y
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Database Setup**
   ```bash
   sudo -u postgres createuser --interactive
   sudo -u postgres createdb varsagel_prod
   ```

3. **Application Setup**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/varsagel.git
   cd varsagel
   
   # Install dependencies
   npm install
   
   # Setup environment
   cp .env.production .env
   # Edit .env with your values
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate deploy
   
   # Build application
   npm run build
   ```

4. **PM2 Setup**
   ```bash
   # Create PM2 ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'varsagel',
       script: 'npm',
       args: 'start',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   EOF
   
   # Start application
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Nginx Configuration**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/varsagel
   sudo ln -s /etc/nginx/sites-available/varsagel /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 🔒 Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] File upload restrictions
- [ ] CORS properly configured

## 📊 Monitoring

### Health Checks
- Application: `https://varsagel.com/api/health`
- Database: Monitor connection pool
- Server: CPU, Memory, Disk usage

### Logging
- Application logs: PM2 logs or Vercel logs
- Nginx logs: `/var/log/nginx/`
- Database logs: PostgreSQL logs

## 🔄 Maintenance

### Regular Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Restart application
pm2 restart varsagel
```

### Database Backup
```bash
# Create backup
pg_dump varsagel_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql varsagel_prod < backup_file.sql
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check firewall settings

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

3. **Build Errors**
   - Clear `.next` folder
   - Delete `node_modules` and reinstall
   - Check TypeScript errors

4. **Performance Issues**
   - Enable gzip compression
   - Optimize images
   - Use CDN for static assets
   - Monitor database queries

### Support
For deployment support, contact: admin@varsagel.com

---

**Last Updated:** $(date +%Y-%m-%d)
**Version:** 1.0.0