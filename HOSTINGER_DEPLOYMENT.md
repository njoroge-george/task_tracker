# 🚀 Deploy TaskFlow™ to Hostinger

Complete guide to deploy your Next.js app on Hostinger hosting.

---

## 📋 Prerequisites

### What You Need:
- ✅ Hostinger account with VPS or Cloud hosting (Next.js requires Node.js)
- ✅ Domain name (optional, can use IP)
- ✅ SSH access to your server
- ✅ PostgreSQL database

> ⚠️ **Important**: Shared hosting won't work! You need VPS or Cloud hosting for Next.js.

---

## 🎯 Deployment Options

### Option 1: Hostinger VPS (Recommended)
Best for full control and performance.

### Option 2: Use Vercel + Hostinger Database
Deploy app on Vercel (free), use Hostinger for PostgreSQL only.

### Option 3: Docker on Hostinger VPS
Containerized deployment for easy management.

---

## 🔧 Option 1: Full Deployment on Hostinger VPS

### Step 1: Connect to Your VPS

```bash
# SSH into your Hostinger VPS
ssh root@your-server-ip

# Or if you have a username
ssh yourusername@your-server-ip
```

### Step 2: Install Node.js & Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (required for Next.js 16)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be 18+
npm --version

# Install PM2 for process management
sudo npm install -g pm2

# Install build tools
sudo apt install -y build-essential
```

### Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE taskflow;
CREATE USER taskflowuser WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE taskflow TO taskflowuser;
\q
```

### Step 4: Clone Your Repository

```bash
# Navigate to web directory
cd /var/www

# Clone from GitHub
git clone https://github.com/njoroge-george/task_tracker.git
cd task_tracker

# Or upload via FTP/SFTP if you prefer
```

### Step 5: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add your configuration:

```env
# Database
DATABASE_URL="postgresql://taskflowuser:your-strong-password@localhost:5432/taskflow?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-generated-secret"

# OpenAI
OPENAI_API_KEY="your-openai-key"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-pk"
STRIPE_SECRET_KEY="your-stripe-sk"

# Email
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="587"
SMTP_USER="your-email@yourdomain.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE="false"

# Giphy (optional)
NEXT_PUBLIC_GIPHY_API_KEY="your-giphy-key"
```

Save and exit (Ctrl+X, Y, Enter).

### Step 6: Install Dependencies & Build

```bash
# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Seed database
npx prisma db seed

# Build the application
npm run build
```

### Step 7: Start with PM2

```bash
# Start the app with PM2
pm2 start npm --name "taskflow" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it gives you (usually starts with sudo)

# Check status
pm2 status
pm2 logs taskflow
```

### Step 8: Configure Nginx as Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/taskflow
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # For Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/taskflow /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 9: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Select option to redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 10: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 🔧 Option 2: Vercel + Hostinger Database (Easiest)

### Why This Option?
- ✅ Free hosting on Vercel
- ✅ Automatic deployments from GitHub
- ✅ CDN and global edge network
- ✅ Use Hostinger only for PostgreSQL

### Step 1: Setup PostgreSQL on Hostinger

```bash
# SSH to Hostinger VPS
ssh root@your-hostinger-ip

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Configure to allow remote connections
sudo nano /etc/postgresql/*/main/postgresql.conf
# Change: listen_addresses = '*'

sudo nano /etc/postgresql/*/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE taskflow;
CREATE USER taskflowuser WITH PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE taskflow TO taskflowuser;
\q

# Configure firewall
sudo ufw allow 5432
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd /home/nick/projects/task-tracker
vercel
```

Follow prompts:
- Set up and deploy: Y
- Scope: Your account
- Link to existing project: N
- Project name: taskflow
- Directory: ./
- Override settings: N

### Step 3: Add Environment Variables in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env`:

```env
DATABASE_URL=postgresql://taskflowuser:password@your-hostinger-ip:5432/taskflow
NEXTAUTH_URL=https://your-vercel-url.vercel.app
NEXTAUTH_SECRET=your-secret
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
SMTP_HOST=smtp.hostinger.com
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
```

### Step 4: Deploy with Environment Variables

```bash
# Redeploy with production settings
vercel --prod

# Run database migrations
vercel env pull .env.production
npx prisma generate
npx prisma db push
```

---

## 🐳 Option 3: Docker Deployment on Hostinger VPS

### Step 1: Create Dockerfile

```dockerfile
# In your project root
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://taskflowuser:password@db:5432/taskflow
      - NEXTAUTH_URL=https://yourdomain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=taskflow
      - POSTGRES_USER=taskflowuser
      - POSTGRES_PASSWORD=your-password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

### Step 3: Deploy with Docker

```bash
# Install Docker on Hostinger VPS
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose

# Upload your code to server
git clone https://github.com/njoroge-george/task_tracker.git
cd task_tracker

# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f

# Run migrations
docker-compose exec app npx prisma db push
```

---

## 📊 Database Backup (Important!)

### Automated Backups

```bash
# Create backup script
nano /root/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U taskflowuser taskflow > $BACKUP_DIR/taskflow_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "taskflow_*.sql" -mtime +7 -delete
```

Make executable and schedule:

```bash
chmod +x /root/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

---

## 🔍 Monitoring & Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status
pm2 logs taskflow

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check disk space
df -h

# Check memory
free -m

# Database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### Update Application

```bash
cd /var/www/task_tracker

# Pull latest changes
git pull origin main

# Install dependencies
npm install --legacy-peer-deps

# Run migrations
npx prisma generate
npx prisma db push

# Rebuild
npm run build

# Restart app
pm2 restart taskflow
```

---

## 🐛 Troubleshooting

### App Won't Start
```bash
# Check logs
pm2 logs taskflow --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U taskflowuser -d taskflow -h localhost

# Check firewall
sudo ufw status
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## 💰 Cost Comparison

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| Hostinger VPS | $4-10/mo | Full control | Manual setup |
| Vercel + Hostinger DB | Free + $4/mo | Easy, auto-deploy | Limited control |
| Docker on VPS | $4-10/mo | Easy updates | Requires Docker knowledge |

---

## 🎯 Recommended Approach

**For Beginners**: Use Vercel + Hostinger Database (Option 2)
- Easiest setup
- Free hosting
- Automatic deployments
- Use Hostinger only for database

**For Full Control**: Use Hostinger VPS (Option 1)
- Complete ownership
- Better for custom configurations
- Good for learning DevOps

**For Teams**: Docker on VPS (Option 3)
- Easy to replicate
- Consistent environments
- Simple updates

---

## ✅ Post-Deployment Checklist

- [ ] App accessible via domain
- [ ] SSL certificate working (HTTPS)
- [ ] Database connected and migrations run
- [ ] Email sending works
- [ ] Stripe webhooks configured
- [ ] AI features tested
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] DNS configured
- [ ] Environment variables secured

---

## 📞 Need Help?

- Hostinger Support: https://www.hostinger.com/tutorials
- Hostinger VPS Docs: https://support.hostinger.com/en/collections/1567769-vps
- Next.js Deployment: https://nextjs.org/docs/deployment

---

**Your app is ready to deploy! Choose your option and follow the steps above.** 🚀
