# Simplified Stripe Payment Setup 💳

## ✅ What Changed

I've simplified your Stripe integration to handle **simple one-time credit/debit card payments** instead of complex subscriptions!

### Before (Complex):
- ❌ Subscription management
- ❌ Recurring billing
- ❌ Price IDs required
- ❌ Customer portal
- ❌ Proration calculations

### After (Simple):
- ✅ One-time payments only
- ✅ Direct card input
- ✅ No subscription complexity
- ✅ Pay once, use forever
- ✅ Easy refunds

## 🎯 How It Works

1. **User clicks "Upgrade to Pro"** on pricing page
2. **Redirected to Stripe Checkout** (secure Stripe-hosted page)
3. **Enters credit/debit card details** (Visa, Mastercard, Amex, etc.)
4. **Payment processed instantly**
5. **Redirected back to success page**
6. **Account upgraded automatically**

## 🚀 Setup Steps

### Step 1: Get Stripe API Keys

1. Go to: https://dashboard.stripe.com/register
2. Create a free account (no credit card needed for testing)
3. In Dashboard → Developers → API keys
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 2: Add Keys to .env

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51abc123..."
STRIPE_SECRET_KEY="sk_test_51xyz789..."
```

### Step 3: Test It!

1. Restart your dev server
2. Go to: http://localhost:3000/dashboard/pricing
3. Click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Use any future expiry date (e.g., 12/34)
6. Use any 3-digit CVC (e.g., 123)
7. Complete payment!

## 💰 Pricing Plans

Configured in `src/lib/stripe.ts`:

```typescript
BASIC: {
  price: $0 (free)
  features: 5 projects, 50 tasks
}

PRO: {
  price: $29 one-time
  features: Unlimited projects/tasks, AI features, Analytics
}

TEAM: {
  price: $99 one-time
  features: Everything + Team collaboration, Advanced features
}
```

**You can change prices anytime!** Just edit the numbers in `src/lib/stripe.ts`.

## 🧪 Test Cards

Stripe provides test cards (only work in test mode):

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success - Payment goes through |
| `4000 0000 0000 0002` | Declined - Card declined |
| `4000 0027 6000 3184` | Requires authentication (3D Secure) |

**All test cards:**
- Expiry: Any future date (12/34)
- CVC: Any 3 digits (123)
- ZIP: Any 5 digits (12345)

## 📁 New Files Created

1. **`src/lib/stripe.ts`** (Updated)
   - Simplified to one-time payments
   - Removed subscription code
   - Added simple plans

2. **`src/app/api/checkout/route.ts`**
   - Create checkout session
   - Handles plan selection

3. **`src/app/api/verify-payment/route.ts`**
   - Verify payment completed
   - Update user account

4. **`src/app/dashboard/pricing/page.tsx`**
   - Beautiful pricing page
   - 3 plans to choose from
   - One-click checkout

5. **`src/app/dashboard/payment-success/page.tsx`**
   - Success confirmation
   - Payment details
   - Next steps

## 🎨 Pages Available

### Pricing Page
```
http://localhost:3000/dashboard/pricing
```
- Shows all plans
- Click to purchase
- Redirects to Stripe Checkout

### Payment Success
```
http://localhost:3000/dashboard/payment-success
```
- Confirmation message
- Payment details
- Return to dashboard

## 💳 What Users See

### Step 1: Pricing Page
User clicks "Upgrade to Pro" button

### Step 2: Stripe Checkout (Secure)
- **Clean, professional checkout page**
- **Stripe-hosted** (PCI compliant, you don't handle cards)
- **Enter card details:**
  - Card number
  - Expiry date
  - CVC code
  - Billing ZIP
- **"Pay $29.00" button**

### Step 3: Success Page
- ✅ Payment successful!
- Account upgraded
- Receipt sent to email

## 🔒 Security

### What Makes This Secure?

1. **No card data touches your server**
   - All card details go directly to Stripe
   - You never see or store card numbers
   - PCI compliant automatically

2. **Stripe handles everything**
   - Encryption
   - Fraud detection
   - 3D Secure authentication
   - Card verification

3. **Best practices built-in**
   - HTTPS required
   - Session tokens
   - Webhook signatures (optional)

## 💡 Customization

### Change Prices

Edit `src/lib/stripe.ts`:

```typescript
export const PLANS = {
  PRO: {
    name: 'Pro',
    price: 4900, // $49.00 (in cents!)
    features: [...],
  },
}
```

**Remember:** Prices are in cents!
- $10.00 = 1000
- $29.99 = 2999
- $99.00 = 9900

### Change Features

Edit the features array in each plan:

```typescript
features: [
  'Your custom feature',
  'Another feature',
  'And another',
]
```

### Change Plan Names

```typescript
PRO: {
  name: 'Premium',  // Change this
  price: 2900,
  ...
}
```

## 🌍 Going Live

When ready for production:

1. **Get live API keys** from Stripe dashboard
2. **Update .env:**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   STRIPE_SECRET_KEY="sk_live_..."
   ```
3. **That's it!** Real payments will now work.

### Test vs Live Mode

- **Test mode:** Use test cards, no real money
- **Live mode:** Real cards, real money
- Toggle in Stripe dashboard

## 📊 View Payments

In Stripe Dashboard:
- See all payments
- Issue refunds
- Download reports
- View customer details

## 🔄 Refunds

### Issue a Refund

```typescript
import { refundPayment } from '@/lib/stripe';

// Full refund
await refundPayment(paymentIntentId);

// Partial refund ($10.00 = 1000 cents)
await refundPayment(paymentIntentId, 1000);
```

Or use Stripe Dashboard → Payments → Click payment → Refund button

## 🎯 Next Steps

1. **Get your Stripe keys** (5 minutes)
   - Sign up at https://stripe.com
   - Get test keys from dashboard

2. **Add to .env file** (1 minute)
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   ```

3. **Test the checkout** (2 minutes)
   - Visit `/dashboard/pricing`
   - Click upgrade
   - Use test card: 4242 4242 4242 4242
   - Complete payment

4. **Customize pricing** (optional)
   - Edit prices in `src/lib/stripe.ts`
   - Add/remove features
   - Change plan names

## ❓ FAQs

**Q: Do users need a Stripe account?**
A: No! They just enter their card like any online purchase.

**Q: What cards are accepted?**
A: Visa, Mastercard, American Express, Discover, Diners, JCB, and more.

**Q: Are there transaction fees?**
A: Stripe charges 2.9% + $0.30 per successful payment. No monthly fees.

**Q: Can I change prices later?**
A: Yes! Just update the numbers in `stripe.ts`.

**Q: How do refunds work?**
A: Use Stripe dashboard or the `refundPayment()` function. Money returns to customer's card.

**Q: Is this production-ready?**
A: Yes! Just swap test keys for live keys when ready.

**Q: What about subscriptions?**
A: Not needed! This is simpler - one-time payments only.

## 🆘 Support

- **Stripe Docs:** https://stripe.com/docs
- **Test Cards:** https://stripe.com/docs/testing
- **Dashboard:** https://dashboard.stripe.com

---

**Ready to accept payments?** Just add your Stripe keys and test it out! 🚀
