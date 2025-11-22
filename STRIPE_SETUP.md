# Stripe Subscription Integration Setup Guide

## Overview
This guide explains how to set up Stripe subscriptions for TaskTracker.

## Prerequisites
1. Stripe account (https://stripe.com)
2. Stripe API keys (publishable and secret)

## Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create products in Stripe Dashboard)
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

# App URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Setup Steps

### 1. Create Products in Stripe Dashboard

Go to https://dashboard.stripe.com/products and create:

**Pro Plan:**
- Name: TaskTracker Pro
- Price: $12/month (recurring)
- Copy the Price ID to `STRIPE_PRICE_ID_PRO`

**Enterprise Plan:**
- Name: TaskTracker Enterprise
- Price: Custom (or set a price)
- Copy the Price ID to `STRIPE_PRICE_ID_ENTERPRISE`

### 2. Configure Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the Webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode vs Production

- Use test mode keys (starting with `sk_test_` and `pk_test_`) for development
- Use live keys (starting with `sk_live_` and `pk_live_`) for production
- Test mode uses test cards: https://stripe.com/docs/testing

## Test Cards

For testing in development:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- Use any future expiry date and any 3-digit CVC

## API Routes

### `/api/subscription`
- **GET**: Get current user's subscription status

### `/api/subscription/checkout`
- **POST**: Create Stripe Checkout session for upgrading

### `/api/subscription/portal`
- **POST**: Create Stripe Customer Portal session for managing billing

### `/api/webhooks/stripe`
- **POST**: Handle Stripe webhook events

## Features Implemented

1. ✅ **Subscription Management Page** (`/dashboard/subscription`)
2. ✅ **Stripe Checkout Integration** (for upgrades)
3. ✅ **Customer Portal** (for billing management)
4. ✅ **Webhook Handling** (for subscription updates)
5. ✅ **Database Updates** (User model has plan, stripeCustomerId, stripeSubscriptionId)

## Usage

### Upgrade to Pro
```typescript
const response = await fetch("/api/subscription/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ plan: "PRO" }),
});
const { url } = await response.json();
window.location.href = url;
```

### Manage Billing
```typescript
const response = await fetch("/api/subscription/portal", {
  method: "POST",
});
const { url } = await response.json();
window.location.href = url;
```

## Security Notes

- ⚠️ Never expose `STRIPE_SECRET_KEY` in client-side code
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Store customer and subscription IDs securely in database

## Next Steps

1. Create Stripe account
2. Get API keys
3. Create products and get Price IDs
4. Update `.env` file
5. Test with test cards
6. Configure webhooks for production
7. Switch to live keys when ready

## Resources

- Stripe Documentation: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Next.js Stripe Integration: https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript
