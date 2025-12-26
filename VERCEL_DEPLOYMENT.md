# Vercel Deployment Guide

## ✅ Yes, You Can Deploy to Vercel!

Your TaskTracker application is ready for Vercel deployment. Follow this guide to deploy successfully.

---

## Prerequisites

### 1. **Vercel Account**
- Sign up at [vercel.com](https://vercel.com)
- Install Vercel CLI: `npm i -g vercel`

### 2. **PostgreSQL Database (Required)**

You **cannot use local PostgreSQL** on Vercel. Choose one of these options:

#### Option A: Vercel Postgres (Recommended - Easy Setup)
```bash
# After deploying to Vercel:
# 1. Go to your project dashboard
# 2. Click "Storage" tab
# 3. Click "Create Database" → "Postgres"
# 4. Database URL will be auto-added to environment variables
```
- ✅ Free tier: 256 MB, 60 hours compute/month
- ✅ Automatic environment variable injection
- ✅ Zero configuration

#### Option B: Neon (Recommended - Best Free Tier)
```bash
# 1. Sign up at https://neon.tech
# 2. Create a new project
# 3. Copy the DATABASE_URL
```
- ✅ Free tier: 3 GB storage, unlimited projects
- ✅ Serverless, auto-scaling
- ✅ Instant branching for preview deployments

#### Option C: Supabase (Good Alternative)
```bash
# 1. Sign up at https://supabase.com
# 2. Create a new project
# 3. Get connection string from Settings → Database
```
- ✅ Free tier: 500 MB, generous limits
- ✅ Built-in auth & storage (bonus features)

#### Option D: Railway, PlanetScale, or Heroku Postgres
All work great with Vercel!

---

## Quick Deploy Steps

### Method 1: Deploy via Vercel CLI (Fastest)

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy from your project directory
cd /home/nick/projects/task-tracker
vercel

# 3. Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? task-tracker (or your choice)
# - Directory? ./
# - Override settings? No

# 4. Add environment variables (see below)
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all required variables

# 5. Redeploy with environment variables
vercel --prod
```

### Method 2: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Push to GitHub** (if not already):
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `task_tracker` repository
   - Click "Import"

3. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

4. **Add Environment Variables** (see section below)

5. **Click "Deploy"**

---

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### ✅ Critical (Required for deployment to work)

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth (Security)
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# App URLs
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

### 🔧 Optional (But Recommended)

```bash
# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Email (Notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@tasktracker.com"

# Stripe (Payments)
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# OpenAI (AI Features)
OPENAI_API_KEY="sk-proj-..."

# Cron Jobs
CRON_SECRET="generate-random-secret"

# Web Push Notifications
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:your-email@example.com"
```

---

## Database Migration on Vercel

After deploying, you need to run Prisma migrations:

### Option 1: Using Vercel CLI
```bash
# Set DATABASE_URL locally to production database
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Option 2: Using Vercel Dashboard
1. Go to your project → Settings → Environment Variables
2. Add `DATABASE_URL` locally: `vercel env pull .env.local`
3. Run migrations: `npx prisma migrate deploy`

### Option 3: Auto-migration (Add to package.json)
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
  }
}
```
⚠️ **Warning**: This runs migrations on every build. Use with caution in production.

---

## Post-Deployment Setup

### 1. **Verify Deployment**
```bash
# Check if app is live
curl https://your-app.vercel.app

# Test API endpoints
curl https://your-app.vercel.app/api/health
```

### 2. **Set Up Upstash Redis (Recommended)**

Rate limiting currently uses in-memory fallback. For production:

```bash
# 1. Go to https://upstash.com
# 2. Create account (free)
# 3. Create Redis database
# 4. Copy REST URL and TOKEN
# 5. Add to Vercel environment variables:

vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN

# 6. Redeploy
vercel --prod
```

### 3. **Configure Webhook URLs**

If using Stripe webhooks:
```
Webhook URL: https://your-app.vercel.app/api/stripe/webhook
```

### 4. **Set Up Cron Jobs (Optional)**

Vercel Cron for scheduled tasks:

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 5. **Custom Domain (Optional)**
```bash
# Add domain via CLI
vercel domains add yourdomain.com

# Or via dashboard:
# Project → Settings → Domains → Add
```

---

## Troubleshooting

### Build Errors

#### Error: "Cannot find module '@prisma/client'"
```bash
# Solution: Ensure prisma generate runs before build
# package.json should have:
"build": "prisma generate && next build"
```

#### Error: "DATABASE_URL not found"
```bash
# Solution: Add DATABASE_URL to Vercel environment variables
vercel env add DATABASE_URL
```

#### Error: "NextAuth configuration error"
```bash
# Solution: Ensure NEXTAUTH_URL matches your Vercel URL
NEXTAUTH_URL="https://your-app.vercel.app"
```

### Runtime Errors

#### Error: "Connection refused" (Database)
```bash
# Check:
# 1. DATABASE_URL is correct
# 2. Database allows external connections
# 3. SSL mode is enabled: ?sslmode=require
```

#### Error: "Rate limit exceeded"
```bash
# Solution: Set up Upstash Redis (see above)
# The in-memory fallback doesn't persist across serverless functions
```

### Performance Issues

#### Cold Starts
- Vercel Edge Functions: Consider using for critical paths
- Database Connection Pooling: Use Prisma's connection pooling

#### Large Bundle Size
```bash
# Check bundle size
npm run build

# Optimize:
# 1. Remove unused dependencies
# 2. Use dynamic imports for heavy components
# 3. Enable experimental optimizeCss in next.config.ts
```

---

## Environment-Specific Configurations

### Development
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

### Preview (Vercel Automatic)
```bash
NEXT_PUBLIC_APP_URL="https://preview-*.vercel.app"
NEXTAUTH_URL="https://preview-*.vercel.app"
```

### Production
```bash
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXTAUTH_URL="https://your-app.vercel.app"
```

---

## Cost Estimation (Vercel Pro)

### Hobby (Free) Tier Includes:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ❌ No commercial use
- ❌ No team features

### Pro Tier ($20/month):
- ✅ Everything in Hobby
- ✅ Commercial use
- ✅ 1 TB bandwidth/month
- ✅ Priority support
- ✅ Team collaboration

---

## Production Checklist

Before going live:

- [ ] Set up production PostgreSQL database
- [ ] Configure all environment variables in Vercel
- [ ] Run `prisma migrate deploy` on production database
- [ ] Set up Upstash Redis for rate limiting
- [ ] Configure email (SMTP) for notifications
- [ ] Set up Stripe webhooks (if using payments)
- [ ] Add custom domain (optional)
- [ ] Set up monitoring/logging (Vercel Analytics)
- [ ] Test authentication flows
- [ ] Test payment flows (if applicable)
- [ ] Set up cron jobs for scheduled tasks
- [ ] Configure OAuth providers for production
- [ ] Generate production NEXTAUTH_SECRET
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Enable VAPID keys for push notifications
- [ ] Test database backups
- [ ] Set up error tracking (Sentry, etc.)

---

## Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Add environment variable
vercel env add [KEY]

# Pull environment variables
vercel env pull .env.local

# Remove project
vercel remove [project-name]

# Link local project to Vercel
vercel link
```

---

## Security Best Practices

1. **Never commit .env files** (already in .gitignore ✅)
2. **Use strong NEXTAUTH_SECRET** (generate with openssl)
3. **Enable SSL for database connections** (?sslmode=require)
4. **Set up CORS properly** (already configured ✅)
5. **Use environment-specific secrets** (different for prod/dev)
6. **Enable rate limiting** (Upstash Redis recommended)
7. **Keep dependencies updated** (npm audit)
8. **Use Vercel Authentication** for protecting routes

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Upstash Redis Setup](https://docs.upstash.com/redis)

---

## Need Help?

- Vercel Discord: [vercel.com/discord](https://vercel.com/discord)
- Vercel Support: support@vercel.com
- Documentation Issues: Open issue in this repo

---

## Quick Start (TL;DR)

```bash
# 1. Set up database (choose one):
# - Vercel Postgres (easiest)
# - Neon (best free tier)
# - Supabase (with bonus features)

# 2. Push to GitHub
git push origin main

# 3. Import to Vercel
# Go to vercel.com/new → Import repository

# 4. Add environment variables:
DATABASE_URL="..."
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-random"

# 5. Deploy!
# Click "Deploy" button

# 6. Run migrations
export DATABASE_URL="production-url"
npx prisma migrate deploy

# 7. Done! 🎉
```

Your app will be live at `https://your-app.vercel.app`
