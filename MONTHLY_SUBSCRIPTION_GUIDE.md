# Monthly Subscription System - Complete Guide

## Overview
The payment system has been updated to support **monthly subscriptions** instead of one-time payments. Users must renew their payment every 30 days to maintain premium access.

---

## 🔄 How Monthly Renewals Work

### Payment Flow

```
User Pays → Admin Verifies → Plan Activated (30 days) → Expiration → Auto-Downgrade to FREE
                                    ↓
                              User Renews Payment
                                    ↓
                              30 Days Reset Again
```

### Timeline Example

```
Day 0:  User pays KES 2,999 for PRO plan
Day 0:  Admin verifies payment
Day 0:  planExpiresAt = Current Date + 30 days
Day 23: User receives "7 days remaining" email reminder
Day 27: User receives "3 days remaining" email reminder
Day 29: User receives "1 day remaining" email reminder
Day 30: Plan expires → Auto-downgrade to FREE
Day 31: User can renew by making another payment
```

---

## 💾 Database Changes

### User Model - Plan Expiration
```typescript
{
  plan: "PRO",                              // Current plan
  planExpiresAt: "2025-01-01T00:00:00Z"    // When plan expires (30 days from verification)
}
```

**After 30 Days:**
```typescript
{
  plan: "FREE",              // Auto-downgraded
  planExpiresAt: null        // No expiration for FREE plan
}
```

---

## 📁 Files Created/Modified

### New Files

1. **`/api/cron/check-expired-plans/route.ts`**
   - Checks for expired plans daily
   - Auto-downgrades users to FREE plan
   - Runs at midnight (00:00) daily

2. **`/api/cron/send-expiration-reminders/route.ts`**
   - Sends email reminders before expiration
   - Reminds at: 7 days, 3 days, 1 day before expiry
   - Runs at 9 AM daily

### Modified Files

1. **`/api/admin/payments/verify/route.ts`**
   - Changed: `planExpiresAt: null` → `planExpiresAt: now + 30 days`
   - Sets expiration date when payment is verified

2. **`/dashboard/pricing/page.tsx`**
   - Updated FAQ: One-time → Monthly subscription
   - Added `/month` to pricing display
   - Added expiration info

3. **`vercel.json`**
   - Added cron jobs for automated tasks

---

## ⚙️ Cron Jobs Configuration

### 1. Check Expired Plans
- **Path:** `/api/cron/check-expired-plans`
- **Schedule:** `0 0 * * *` (Daily at midnight)
- **Function:** Auto-downgrades expired plans to FREE

### 2. Send Expiration Reminders
- **Path:** `/api/cron/send-expiration-reminders`
- **Schedule:** `0 9 * * *` (Daily at 9 AM)
- **Function:** Sends email reminders at 7, 3, and 1 day before expiration

### Cron Schedule Format
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6)
│ │ │ │ │
│ │ │ │ │
* * * * *

Examples:
0 0 * * *  = Every day at midnight
0 9 * * *  = Every day at 9 AM
0 */6 * * * = Every 6 hours
```

---

## 🔐 Security - CRON_SECRET

Add to `.env`:
```bash
CRON_SECRET=your-random-secret-here
```

Cron jobs validate the secret:
```typescript
const authHeader = req.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return 401 Unauthorized
}
```

**To call cron manually:**
```bash
curl -H "Authorization: Bearer your-random-secret-here" \
  http://localhost:3000/api/cron/check-expired-plans
```

---

## 📧 Email Notifications

### Expiration Reminder Email
Sent at **7, 3, and 1 day** before plan expires.

**Subject:** "Your PRO plan expires in 3 days"

**Content:**
- Expiration date
- Renewal instructions (Paybill info)
- Warning about downgrade
- Direct link to pricing page

### Downgrade Notification (TODO)
After plan expires, send email:
- "Your PRO plan has expired"
- "Downgraded to FREE plan"
- "Renew anytime to restore features"

---

## 🧪 Testing

### 1. Test Payment Verification (Creates 30-day expiration)
```bash
# Submit payment as user
POST /api/payments/submit
{
  "plan": "PRO",
  "amount": 2999,
  "phoneNumber": "0712345678",
  "transactionCode": "TEST123"
}

# Verify as admin
POST /api/admin/payments/verify
{
  "paymentId": "payment_id_here",
  "action": "VERIFY"
}

# Check user plan expiration
SELECT plan, planExpiresAt FROM "User" WHERE email = 'user@example.com';
```

### 2. Test Expired Plans Cron
```bash
# Manually trigger cron
curl -X POST http://localhost:3000/api/cron/check-expired-plans

# Or with secret
curl -X POST \
  -H "Authorization: Bearer your-secret" \
  http://localhost:3000/api/cron/check-expired-plans
```

### 3. Test Expiration Reminders
```bash
# Manually set expiration to 3 days from now
UPDATE "User" 
SET planExpiresAt = NOW() + INTERVAL '3 days'
WHERE email = 'test@example.com';

# Trigger reminder cron
curl -X POST http://localhost:3000/api/cron/send-expiration-reminders
```

### 4. Test Expiration Flow
```sql
-- Set plan to expire in 1 minute (for quick testing)
UPDATE "User" 
SET plan = 'PRO', planExpiresAt = NOW() + INTERVAL '1 minute'
WHERE email = 'test@example.com';

-- Wait 2 minutes, then run cron
-- User should be downgraded to FREE
```

---

## 🚀 Deployment

### Vercel (Recommended)
Cron jobs work automatically on Vercel:
1. Push code with `vercel.json`
2. Deploy to Vercel
3. Cron jobs run automatically on schedule
4. View logs in Vercel dashboard

### Other Platforms

#### GitHub Actions (Daily Cron)
Create `.github/workflows/cron.yml`:
```yaml
name: Daily Cron Jobs
on:
  schedule:
    - cron: '0 0 * * *'  # Midnight
    - cron: '0 9 * * *'  # 9 AM
  workflow_dispatch:

jobs:
  run-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Check Expired Plans
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/check-expired-plans
      
      - name: Send Reminders
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/send-expiration-reminders
```

#### External Cron Service (cron-job.org, EasyCron)
1. Create account on cron service
2. Add URLs:
   - `https://your-domain.com/api/cron/check-expired-plans`
   - `https://your-domain.com/api/cron/send-expiration-reminders`
3. Set schedules
4. Add Authorization header with CRON_SECRET

---

## 📊 Admin Dashboard Updates

### Payment Verification Changes
When admin verifies payment:

**Before (One-time):**
```typescript
planExpiresAt: null  // Never expires
```

**After (Monthly):**
```typescript
planExpiresAt: new Date(now + 30 days)  // Expires in 30 days
```

### View Expiration Dates
Add to admin dashboard (optional):
```typescript
// Show expiration date in payment list
{payment.verifiedAt && (
  <p>Expires: {new Date(payment.user.planExpiresAt).toLocaleDateString()}</p>
)}
```

---

## 🔔 User Notifications

### Email Reminder Schedule
- **Day 23:** "7 days remaining" ⚠️
- **Day 27:** "3 days remaining" ⚠️⚠️
- **Day 29:** "1 day remaining" 🚨
- **Day 30:** Plan expires (auto-downgrade)

### In-App Banner (Recommended - TODO)
Show warning banner in dashboard:
```typescript
{user.planExpiresAt && daysUntilExpiry <= 7 && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
    <p>Your {user.plan} plan expires in {daysUntilExpiry} days.</p>
    <a href="/dashboard/pricing">Renew Now</a>
  </div>
)}
```

---

## 💰 Pricing Display

### Updated Pricing Cards
```tsx
<div>
  <span>KES 2,999</span>
  <span>/month</span>  {/* Added */}
</div>
```

### FAQ Updates
**Q: Is this a subscription?**  
A: Yes! All paid plans are monthly subscriptions. Renew every 30 days.

**Q: What happens when my plan expires?**  
A: Your account downgrades to FREE. Data is preserved.

---

## 🛠️ Future Enhancements

### Recommended Additions

1. **Auto-Renewal (M-Pesa STK Push)**
   - Store user consent
   - Auto-charge on expiration day
   - Send confirmation email

2. **Grace Period**
   - 3-day grace period before downgrade
   - Allow payment during grace period
   - Plan reactivates immediately

3. **Payment History**
   - User dashboard showing all payments
   - Renewal history with dates
   - Download invoices/receipts

4. **Annual Plans**
   - Discounted yearly pricing
   - 365-day expiration
   - Save 2 months free

5. **Prorated Upgrades**
   - Upgrade from PRO → ENTERPRISE mid-cycle
   - Only pay difference
   - Keep same expiration date

6. **Notification Preferences**
   - Let users choose reminder frequency
   - SMS reminders (Kenya only)
   - WhatsApp notifications

---

## 📝 Summary

### What Changed
✅ Plans expire after 30 days  
✅ Auto-downgrade to FREE on expiration  
✅ Email reminders at 7, 3, 1 day before expiry  
✅ Daily cron jobs check for expired plans  
✅ Updated pricing page with `/month` display  
✅ FAQ updated to reflect monthly billing  

### What Stayed the Same
- Manual payment via M-Pesa Paybill
- Admin verification required
- Same pricing (KES 2,999 PRO, KES 9,999 ENTERPRISE)
- Payment submission flow unchanged

### User Experience
1. Pay monthly (KES 2,999 or 9,999)
2. Get 30 days of premium access
3. Receive reminders before expiration
4. Renew to continue (or downgrade to FREE)

**The system is now fully configured for monthly subscription renewals! 🎉**
