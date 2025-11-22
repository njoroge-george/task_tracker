# TaskFlow™ - GitHub Deployment Guide

## 🚀 Prepare for GitHub

### 1. Create `.gitignore` (if not exists)

Already configured! Make sure these are included:

```gitignore
# dependencies
node_modules/
.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
/prisma/.env
/prisma/dev.db
/prisma/dev.db-journal

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

---

## 📋 Pre-Push Checklist

### ✅ Files to Include
- [x] Source code (`src/`)
- [x] Configuration files (`next.config.ts`, `tsconfig.json`, etc.)
- [x] Package files (`package.json`, `package-lock.json`)
- [x] Prisma schema (`prisma/schema.prisma`)
- [x] Public assets (`public/logo*.svg`, `public/favicon.svg`)
- [x] Documentation (`README.md`, `*.md` files)

### ⛔ Files to Exclude (in `.gitignore`)
- [x] `.env` (NEVER commit API keys!)
- [x] `node_modules/`
- [x] `.next/`
- [x] `*.log` files
- [x] Database files (`.db`)

---

## 🔐 Environment Variables

### Create `.env.example`

```bash
# Copy your .env but remove sensitive values
cp .env .env.example
```

Then edit `.env.example` to remove actual keys:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
SMTP_FROM="noreply@taskflow.com"
SMTP_SECURE="false"

# OpenAI (optional - has mock fallback)
OPENAI_API_KEY="sk-your-openai-api-key"

# Stripe (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"
STRIPE_SECRET_KEY="sk_test_your-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Giphy (optional)
NEXT_PUBLIC_GIPHY_API_KEY="your-giphy-api-key"
```

---

## 🔧 Git Setup

### 1. Initialize Git (if not done)

```bash
git init
```

### 2. Check Git Status

```bash
git status
```

Make sure `.env` is NOT listed (should be in `.gitignore`)

### 3. Stage Files

```bash
# Add all files
git add .

# Or be selective
git add src/ public/ prisma/ *.md *.json *.ts *.tsx
```

### 4. Create Initial Commit

```bash
git commit -m "🎉 Initial commit: TaskFlow™ - AI-Powered Task Management

Features:
- ✅ AI-powered task suggestions (OpenAI GPT-4o-mini)
- ✅ Complete task management (Kanban, Calendar, Projects)
- ✅ Real-time collaboration (Socket.IO)
- ✅ Stripe payment integration
- ✅ Email notifications (Nodemailer)
- ✅ Dark/Light theme support
- ✅ Mobile responsive design
- ✅ Professional branding with custom logo

Tech Stack:
- Next.js 16, React 19, TypeScript
- Prisma + PostgreSQL
- Material-UI + Tailwind CSS
- NextAuth for authentication"
```

---

## 🌐 Create GitHub Repository

### Option 1: Via GitHub Website

1. Go to [github.com/new](https://github.com/new)
2. Name: `taskflow` or `task-tracker`
3. Description: "AI-Powered Task Management System with Smart Automation"
4. Visibility: Public or Private
5. **DO NOT** initialize with README (you already have one)
6. Click "Create repository"

### Option 2: Via GitHub CLI

```bash
gh repo create taskflow --public --description "AI-Powered Task Management System"
```

---

## 📤 Push to GitHub

### 1. Add Remote

```bash
# Replace 'yourusername' with your GitHub username
git remote add origin https://github.com/yourusername/taskflow.git
```

### 2. Verify Remote

```bash
git remote -v
```

### 3. Push to Main Branch

```bash
git branch -M main
git push -u origin main
```

---

## 🔒 Security Check

Before pushing, verify:

```bash
# Make sure .env is NOT staged
git status | grep .env

# Should return nothing or show it's ignored
```

If `.env` appears:
```bash
git reset .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "🔒 Add .env to gitignore"
```

---

## 🏷️ Create GitHub Release

### 1. Tag Your Version

```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release

Features:
- AI-powered task management
- Kanban boards & Calendar
- Real-time collaboration
- Stripe integration
- Email notifications
- Dark/Light themes"
```

### 2. Push Tags

```bash
git push origin v1.0.0
```

### 3. Create Release on GitHub

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Select tag: `v1.0.0`
4. Title: "TaskFlow™ v1.0.0 - Initial Release"
5. Description: Copy from README features
6. Upload logo: `logo-512.svg`
7. Click "Publish release"

---

## 📊 Repository Settings

### 1. Update Repository Details

- **Description**: "AI-Powered Task Management System with Smart Automation"
- **Website**: Your deployment URL
- **Topics**: `task-management`, `ai`, `nextjs`, `typescript`, `prisma`, `productivity`, `kanban`, `project-management`

### 2. Enable Features

- ✅ Issues
- ✅ Discussions (optional)
- ✅ Wiki (optional)
- ✅ Projects (optional)

### 3. Add Social Preview

1. Go to Settings → Social preview
2. Upload `public/logo-512.svg` (convert to PNG first)
3. Save

---

## 🚀 Deploy to Vercel

### 1. Import to Vercel

```bash
# Using Vercel CLI
npm i -g vercel
vercel

# Or via website: vercel.com/import
```

### 2. Configure Environment Variables

In Vercel dashboard, add all variables from `.env.example`

### 3. Deploy Database

```bash
# After deployment, run migrations
vercel env pull .env.production
npx prisma generate
npx prisma db push
```

### 4. Test Production

Visit your Vercel URL and test all features!

---

## 📝 Post-Deployment

### 1. Update README

Replace placeholders in `README.md`:
- `https://github.com/yourusername/taskflow` → Your actual repo URL
- `your-email@example.com` → Your actual email
- `https://yourdomain.com` → Your Vercel URL

### 2. Add Badges

Update README.md with:
- Build status
- Deployment status
- Version badge
- License badge

### 3. Create Documentation

Consider adding:
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Community standards
- `CHANGELOG.md` - Version history
- `LICENSE` - MIT license

---

## 🎯 Quick Deploy Commands

```bash
# Complete deployment in one go
git add .
git commit -m "🚀 Deploy: <your message>"
git push origin main

# Deploy to Vercel (auto-deploys on push if configured)
# Or manually:
vercel --prod
```

---

## ✅ Deployment Checklist

- [ ] `.gitignore` configured
- [ ] `.env.example` created (no sensitive data)
- [ ] README.md updated
- [ ] Logo files added to `public/`
- [ ] All features tested locally
- [ ] Database schema finalized
- [ ] Git repository initialized
- [ ] Files committed
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel deployment configured
- [ ] Environment variables set
- [ ] Database deployed
- [ ] Production tested
- [ ] Documentation updated

---

## 🐛 Troubleshooting

### Git Issues

```bash
# Reset if needed
git reset --hard HEAD

# Force push (use with caution!)
git push -f origin main

# Check what's being tracked
git ls-files
```

### Vercel Issues

```bash
# Check build logs
vercel logs

# Redeploy
vercel --prod --force
```

### Environment Variables

```bash
# Verify all vars are set
vercel env ls

# Pull production env
vercel env pull
```

---

## 🎉 You're Ready!

Your TaskFlow™ app is now:
- ✅ Version controlled with Git
- ✅ Backed up on GitHub
- ✅ Deployed to production (Vercel)
- ✅ Professionally branded
- ✅ Documented for contributors

**Now push your code!** 🚀

```bash
git push origin main
```
