# TaskFlow - Complete Setup Guide

This guide will help you set up all the services needed to make TaskFlow fully functional with real authentication, subscriptions, and email notifications.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Google OAuth Setup](#google-oauth-setup)
4. [GitHub OAuth Setup](#github-oauth-setup)
5. [Resend Email Setup](#resend-email-setup)
6. [Stripe Setup](#stripe-setup)
7. [Environment Variables](#environment-variables)
8. [Database Migration](#database-migration)
9. [Running the Application](#running-the-application)
10. [Testing](#testing)

---

## Prerequisites

Before you begin, make sure you have:
- Node.js 18+ installed
- PostgreSQL database running
- npm or pnpm package manager

## Database Setup

1. **Ensure PostgreSQL is running:**
   ```bash
   sudo systemctl status postgresql
   ```

2. **Database is already configured at:**
   ```
   postgresql://postgres:maina@localhost:5432/task_tracker
   ```

3. **Run the migration to add Stripe fields:**
   ```bash
   cd /home/nick/projects/task-tracker
   npx prisma migrate dev --name add-stripe-subscription-id
   ```

---

## Google OAuth Setup

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com

### Step 2: Create a New Project (or select existing)
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it "TaskFlow" or similar
4. Click "Create"

### Step 3: Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 4: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (for testing)
3. Fill in:
   - **App name:** TaskFlow
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click "Save and Continue"
5. Add scopes: `email`, `profile`, `openid`
6. Click "Save and Continue"
7. Add test users if needed
8. Click "Save and Continue"

### Step 5: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Fill in:
   - **Name:** TaskFlow Web Client
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### Step 6: Add to .env
```env
GOOGLE_CLIENT_ID="your-actual-client-id-here"
GOOGLE_CLIENT_SECRET="your-actual-client-secret-here"
```

---

## GitHub OAuth Setup

### Step 1: Go to GitHub Developer Settings
Visit: https://github.com/settings/developers

### Step 2: Create New OAuth App
1. Click "New OAuth App"
2. Fill in:
   - **Application name:** TaskFlow
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Click "Register application"

### Step 3: Generate Client Secret
1. Click "Generate a new client secret"
2. Copy the **Client ID** and **Client Secret**

### Step 4: Add to .env
```env
GITHUB_CLIENT_ID="your-actual-client-id-here"
GITHUB_CLIENT_SECRET="your-actual-client-secret-here"
```

---

## Resend Email Setup

### Step 1: Sign Up for Resend
Visit: https://resend.com/signup

### Step 2: Verify Your Email
Check your email and verify your account

### Step 3: Add Domain (Optional for Production)
1. Go to "Domains" in dashboard
2. Click "Add Domain"
3. Follow DNS setup instructions

For testing, you can use their test domain: `onboarding@resend.dev`

### Step 4: Create API Key
1. Go to "API Keys" in dashboard
2. Click "Create API Key"
3. Name it "TaskFlow Development"
4. Click "Create"
5. Copy the API key (starts with `re_`)

### Step 5: Add to .env
```env
RESEND_API_KEY="re_your_actual_api_key_here"
EMAIL_FROM="onboarding@resend.dev"  # or your verified domain
```

---

## Stripe Setup

### Step 1: Sign Up for Stripe
Visit: https://dashboard.stripe.com/register

### Step 2: Activate Test Mode
Make sure you're in **Test Mode** (toggle in top-right)

### Step 3: Get API Keys
1. Go to "Developers" → "API keys"
2. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 4: Create Products & Prices
1. Go to "Products" → "Add product"

**Pro Plan:**
- **Name:** Pro
- **Description:** Advanced features for power users
- **Price:** $19.00 USD / month (recurring)
- Click "Save product"
- Copy the **Price ID** (starts with `price_`)

**Enterprise Plan:**
- **Name:** Enterprise
- **Description:** Full suite for large teams
- **Price:** $49.00 USD / month (recurring)
- Click "Save product"
- Copy the **Price ID**

### Step 5: Set Up Webhook
1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter URL: `http://localhost:3000/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

**Note:** For local testing, use Stripe CLI:
```bash
# Install Stripe CLI
# Visit: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Step 6: Add to .env
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_key"
STRIPE_SECRET_KEY="sk_test_your_actual_key"
STRIPE_WEBHOOK_SECRET="whsec_your_actual_secret"

STRIPE_PRO_PRICE_ID="price_your_pro_price_id"
STRIPE_ENTERPRISE_PRICE_ID="price_your_enterprise_price_id"
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_your_pro_price_id"
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID="price_your_enterprise_price_id"
```

---

## Environment Variables

Your complete `.env` file should look like this:

```env
# Database
DATABASE_URL="postgresql://postgres:maina@localhost:5432/task_tracker?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="HX/NoBHfb7PC/5+YiXIiEpHikyeIQzsaO0fWmOu0NjI="

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Resend Email
RESEND_API_KEY="re_your_resend_api_key"
EMAIL_FROM="onboarding@resend.dev"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

STRIPE_PRO_PRICE_ID="price_your_pro_price_id"
STRIPE_ENTERPRISE_PRICE_ID="price_your_enterprise_price_id"
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID="price_your_pro_price_id"
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID="price_your_enterprise_price_id"
```

---

## Database Migration

Run the Prisma migration to add the new Stripe subscription ID field:

```bash
cd /home/nick/projects/task-tracker
npx prisma migrate dev --name add-stripe-subscription-id
npx prisma generate
```

---

## Running the Application

### Step 1: Install Dependencies
```bash
cd /home/nick/projects/task-tracker
npm install resend stripe @stripe/stripe-js react-hot-toast
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: (Optional) Run Stripe Webhook Forwarding
In a separate terminal:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The app will be available at: http://localhost:3000

---

## Testing

### Test Authentication

1. **Email/Password Login:**
   - Email: `demo@tasktracker.com`
   - Password: `password123`

2. **Google OAuth:**
   - Click "Sign in with Google" on login page
   - Use your Google account

3. **GitHub OAuth:**
   - Click "Sign in with GitHub" on login page
   - Use your GitHub account

### Test Subscription Flow

1. Login with demo account
2. Go to "Billing" page from sidebar
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete checkout
6. Check your email for confirmation

### Test Email Notifications

1. Create a new task and assign it to yourself
2. Check email for task assignment notification
3. Add a comment to a task
4. Check email for comment notification

### Test Card Numbers (Stripe Test Mode)

- **Success:** `4242 4242 4242 4242`
- **Requires authentication:** `4000 0025 0000 3155`
- **Declined:** `4000 0000 0000 9995`

---

## Troubleshooting

### OAuth Redirect Issues
- Make sure redirect URIs exactly match (including trailing slashes)
- Check that NEXTAUTH_URL is set correctly

### Email Not Sending
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for delivery logs
- Ensure EMAIL_FROM uses a verified domain or resend's test domain

### Stripe Webhooks Not Working
- Use Stripe CLI for local testing
- Check webhook signing secret matches
- Verify endpoint URL is correct

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Run migrations if schema changed

---

## Production Deployment

When deploying to production:

1. **Update NEXTAUTH_URL** to your production domain
2. **Generate new NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
3. **Update OAuth redirect URIs** in Google/GitHub to production URLs
4. **Switch Stripe to Live Mode** and use live API keys
5. **Add production domain to Resend** and verify
6. **Update Stripe webhook** to production endpoint
7. **Use production database** (not local PostgreSQL)

---

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check terminal output for server errors
3. Review the relevant service dashboard (Google Cloud, GitHub, Resend, Stripe)
4. Ensure all environment variables are set correctly

---

**Your TaskFlow app is now fully functional! 🎉**

Test all features:
- ✅ Authentication (Email, Google, GitHub)
- ✅ Task management
- ✅ Kanban boards
- ✅ Email notifications
- ✅ Subscription management
- ✅ Dark/Light theme
- ✅ Mobile responsive
