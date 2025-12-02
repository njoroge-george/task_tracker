# Payment System - M-Pesa Paybill

## Overview
The application now uses a simple M-Pesa Paybill payment system instead of Stripe or IntaSend. This simplifies the payment process and reduces complexity.

## How It Works

### For Users

1. **Select a Plan**
   - Navigate to `/dashboard/pricing`
   - Choose between Free, Pro (KES 2,999), or Enterprise (KES 9,999)

2. **Make Payment**
   - Use M-Pesa Lipa na M-Pesa → Pay Bill
   - Business Number: **600100**
   - Account Number: **0100007828831**
   - Amount: Plan price

3. **Submit Transaction Code**
   - Fill in your phone number used for payment
   - Enter the M-Pesa transaction code from the confirmation SMS
   - Click "Submit Payment"

4. **Wait for Verification**
   - Payment will be verified within 24 hours
   - You'll receive an email once confirmed
   - Account will be automatically upgraded

### For Admins

1. **Verify Payments**
   - Check the `ManualPayment` table in the database
   - Look for payments with status `PENDING`
   - Verify the transaction code against M-Pesa statements
   - Update status to `VERIFIED` and upgrade user plan

2. **Database Query Example**
   ```sql
   -- Get pending payments
   SELECT * FROM "ManualPayment" WHERE status = 'PENDING' ORDER BY "createdAt" DESC;
   
   -- Verify a payment
   UPDATE "ManualPayment" 
   SET status = 'VERIFIED', "verifiedAt" = NOW(), "verifiedBy" = 'admin@example.com'
   WHERE id = 'payment-id-here';
   
   -- Upgrade user plan
   UPDATE "User"
   SET plan = 'PRO', "planExpiresAt" = NULL
   WHERE id = 'user-id-here';
   ```

## Database Schema

### ManualPayment Model
```prisma
model ManualPayment {
  id              String   @id @default(cuid())
  reference       String   @unique // M-Pesa transaction code
  amount          Int      // Amount in KES
  plan            Plan     // PRO or ENTERPRISE
  status          ManualPaymentStatus @default(PENDING)
  phoneNumber     String?   // M-Pesa phone number
  transactionCode String?   // M-Pesa transaction code (same as reference)
  paymentMethod   String    @default("PAYBILL")
  notes           String?   // Admin notes
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  createdAt       DateTime  @default(now())
  verifiedAt      DateTime? // When admin verified
  verifiedBy      String?   // Admin who verified
}

enum ManualPaymentStatus {
  PENDING   // Awaiting verification
  VERIFIED  // Admin verified payment
  REJECTED  // Payment verification rejected
  EXPIRED   // Payment reference expired
}
```

## API Endpoints

### POST /api/payments/submit
Submit a new payment for verification.

**Request Body:**
```json
{
  "plan": "PRO",
  "amount": 2999,
  "phoneNumber": "0712345678",
  "transactionCode": "ABC1234567",
  "paymentMethod": "PAYBILL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment submitted successfully...",
  "paymentId": "clxxx..."
}
```

## Environment Variables

No payment gateway environment variables needed! The following were removed:
- ~~STRIPE_PUBLISHABLE_KEY~~
- ~~STRIPE_SECRET_KEY~~
- ~~INTASEND_API_KEY~~
- ~~INTASEND_PRICE_PRO_KES~~
- ~~INTASEND_PRICE_ENTERPRISE_KES~~

## Configuration

The paybill information is configured in `/src/app/dashboard/pricing/page.tsx`:

```typescript
const PAYMENT_INFO = {
  paybill: '600100',
  accountNumber: '0100007828831',
};
```

## Files Modified

### Created
- `/src/app/api/payments/submit/route.ts` - Payment submission API
- `/src/app/dashboard/pricing/page.tsx` - New pricing page with M-Pesa instructions
- `/src/app/dashboard/payment-success/page.tsx` - Updated success page

### Updated
- `/prisma/schema.prisma` - Removed Payment model, added ManualPayment
- `/src/app/api/subscription/route.ts` - Removed Stripe references
- `/src/app/(dashboard)/dashboard/billing/page.tsx` - Simplified billing page

### Deleted
- `/src/lib/intasend.ts` - IntaSend library
- `/src/app/api/verify-payment/` - Stripe verification route
- `/src/app/api/payments/intasend/` - IntaSend payment routes

## Migration

Database migration created: `20251202125342_remove_payment_gateways`

To apply:
```bash
npx prisma migrate dev
```

## Next Steps

1. **Update Paybill Number**: Change `123456` to your actual M-Pesa paybill number
2. **Set Up Admin Panel**: Create interface for admins to verify payments
3. **Email Notifications**: Implement email notifications for payment status updates
4. **Testing**: Test the payment flow end-to-end

## Benefits

✅ **Simplicity**: No complex payment gateway integrations
✅ **Cost**: No gateway fees (only M-Pesa charges)
✅ **Familiarity**: Users are familiar with M-Pesa paybill
✅ **Control**: Full control over payment verification
✅ **Security**: No sensitive payment credentials stored
