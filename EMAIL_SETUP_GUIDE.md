# Email Setup Guide with Nodemailer 📧

## Overview
Your Task Tracker has Nodemailer fully integrated and ready to use! This guide will help you set up email functionality to send:

- ✅ Welcome emails to new users
- ✅ Task assignment notifications
- ✅ Comment notifications
- ✅ Subscription confirmations
- ✅ General notifications

## Email Features Already Implemented

### Available Email Functions
Located in `src/lib/email.ts`:

1. **`sendNotificationEmail()`** - Generic notifications
2. **`sendWelcomeEmail()`** - Welcome new users
3. **`sendTaskAssignmentEmail()`** - Task assignments
4. **`sendCommentNotificationEmail()`** - Comment alerts
5. **`sendSubscriptionConfirmationEmail()`** - Payment confirmations

## Setup Instructions

### Option 1: Gmail (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** in the left menu
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable it

#### Step 2: Generate App Password
1. Still in Google Account settings, go to **Security**
2. Under "Signing in to Google", click **App passwords**
   - If you don't see this option, make sure 2FA is enabled
3. Click **Select app** → Choose "Mail"
4. Click **Select device** → Choose "Other (Custom name)"
5. Type "TaskTracker" or any name you prefer
6. Click **Generate**
7. **COPY the 16-character password** (format: xxxx xxxx xxxx xxxx)

#### Step 3: Configure Environment Variables
Add these to your `.env` file:

```bash
# Email Configuration (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"           # Your Gmail address
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"        # The app password from Step 2
SMTP_FROM="noreply@tasktracker.com"        # Display name email
SMTP_SECURE="false"
```

**Important:** 
- Use the **app password**, NOT your regular Gmail password!
- Remove spaces from the app password if they cause issues
- The app password is 16 characters long

### Option 2: Outlook/Hotmail

```bash
# Email Configuration (Outlook)
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-outlook-password"
SMTP_FROM="noreply@tasktracker.com"
SMTP_SECURE="false"
```

### Option 3: Custom SMTP (Production)

For production, use a dedicated email service:

#### Recommended Services:
- **SendGrid** (12,000 free emails/month)
- **Mailgun** (5,000 free emails/month)
- **Amazon SES** (Very cheap, $0.10 per 1,000 emails)
- **Postmark** (100 free emails/month)

#### SendGrid Example:
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE="false"
```

## Testing Your Email Setup

### Method 1: Test API Endpoint

Create a test endpoint to verify email works:

```bash
# Create file: src/app/api/test-email/route.ts
```

I'll create this for you below.

### Method 2: Use the Email Functions Directly

Once configured, emails will be sent automatically when:
- A new user signs up → Welcome email
- A task is assigned → Assignment notification
- Someone comments → Comment notification
- Subscription is created → Confirmation email

## Configuration Reference

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | Email server address | `smtp.gmail.com` |
| `SMTP_PORT` | Server port (587 for TLS, 465 for SSL) | `587` |
| `SMTP_USER` | Your email address | `you@gmail.com` |
| `SMTP_PASSWORD` | App password or account password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Sender email shown to recipients | `noreply@tasktracker.com` |
| `SMTP_SECURE` | Use SSL/TLS (`true` for port 465) | `false` |

### Port Selection Guide

- **Port 587** - STARTTLS (Recommended)
  - `SMTP_SECURE="false"`
  - Most compatible
  
- **Port 465** - SSL/TLS
  - `SMTP_SECURE="true"`
  - More secure but some providers don't support it
  
- **Port 25** - Not recommended (often blocked)

## Current Email Templates

### 1. Welcome Email
**Trigger:** New user registration

**Template includes:**
- Welcome message with user's name
- Quick start guide
- Link to dashboard
- Help center link

### 2. Task Assignment Email
**Trigger:** Task assigned to user

**Template includes:**
- Task title
- Project name
- Who assigned it
- Direct link to task

### 3. Comment Notification
**Trigger:** New comment on task

**Template includes:**
- Commenter's name
- Task title
- Comment text
- Link to view task

### 4. Subscription Confirmation
**Trigger:** Successful subscription payment

**Template includes:**
- Plan details
- Amount
- Billing cycle
- Link to manage subscription

### 5. Generic Notification
**Trigger:** Custom notifications

**Template includes:**
- Custom title
- Custom message
- Optional action link

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:**
- Make sure you're using an **app password**, not your regular password
- Enable 2-Factor Authentication first
- Generate a new app password

### Error: "Connection timeout"

**Solution:**
- Check your firewall settings
- Try port 465 with `SMTP_SECURE="true"`
- Verify the SMTP host is correct

### Error: "Self-signed certificate"

**Solution:**
Add to your email config:
```typescript
// In src/lib/email.ts, update createTransport:
{
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: secureFlag,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false  // Add this line
  }
}
```

### Emails not sending but no errors

**Solution:**
- Check spam folder
- Verify SMTP credentials in `.env`
- Check console logs for warnings
- Test with the test endpoint (see below)

## Test Email Endpoint

Let me create a test endpoint for you to verify email setup:

```typescript
// File: src/app/api/test-email/route.ts
import { NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { to } = await req.json();
    
    if (!to) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      );
    }

    await sendNotificationEmail({
      to,
      title: '🧪 Test Email from TaskTracker',
      message: 'If you received this email, your SMTP configuration is working correctly!',
      link: process.env.NEXTAUTH_URL + '/dashboard',
    });

    return NextResponse.json({ 
      success: true,
      message: 'Test email sent! Check your inbox.' 
    });
  } catch (error: any) {
    console.error('Test email failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
```

I'll create this file for you now.

## Usage Examples

### Sending a Welcome Email

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// In your signup route
await sendWelcomeEmail(user.email, user.name);
```

### Sending a Task Assignment Notification

```typescript
import { sendTaskAssignmentEmail } from '@/lib/email';

await sendTaskAssignmentEmail(
  assigneeEmail,
  'Fix critical bug in login',
  'John Doe',
  'Website Redesign',
  'http://localhost:3000/tasks/123'
);
```

### Sending a Custom Notification

```typescript
import { sendNotificationEmail } from '@/lib/email';

await sendNotificationEmail({
  to: user.email,
  title: 'Task Deadline Approaching',
  message: 'Your task "Deploy to production" is due tomorrow.',
  link: 'http://localhost:3000/tasks/456',
});
```

## Security Best Practices

### ✅ Do's
- ✅ Use app passwords for Gmail (never your main password)
- ✅ Store credentials in `.env` file (never commit to git)
- ✅ Use dedicated email service for production (SendGrid, etc.)
- ✅ Enable 2FA on your email account
- ✅ Rotate app passwords periodically
- ✅ Use environment-specific configs (dev/staging/prod)

### ❌ Don'ts
- ❌ Commit `.env` to version control
- ❌ Use personal email for production
- ❌ Share SMTP credentials
- ❌ Hardcode passwords in source code
- ❌ Use port 25 (often blocked)
- ❌ Ignore email errors silently

## Email Rate Limits

### Gmail Free Account
- **Limit:** 500 emails/day
- **Burst:** 100 emails/hour
- **Recommendation:** Use for development only

### Gmail Workspace
- **Limit:** 2,000 emails/day
- **Burst:** 500 emails/hour
- **Recommendation:** Suitable for small teams

### SendGrid Free Tier
- **Limit:** 100 emails/day
- **Monthly:** 12,000 emails/month
- **Recommendation:** Good for production MVP

### Production Recommendations
- Use dedicated email service (SendGrid, Mailgun, SES)
- Implement email queue for bulk sends
- Monitor bounce rates and deliverability
- Set up SPF, DKIM, and DMARC records

## Next Steps

1. **Generate App Password** (if using Gmail)
   - Follow steps above to get your 16-character password

2. **Add to .env file**
   ```bash
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password-here"
   SMTP_FROM="noreply@tasktracker.com"
   SMTP_SECURE="false"
   ```

3. **Test the setup**
   - Use the test endpoint I'll create
   - Or trigger a welcome email by creating a new user

4. **Verify emails work**
   - Check inbox (and spam folder)
   - Check console logs for errors
   - Verify SMTP credentials are correct

## Getting Your Gmail App Password

### Quick Steps:
1. Go to: https://myaccount.google.com/apppasswords
   - (You may need to enable 2FA first)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Type "TaskTracker"
4. Click **Generate**
5. Copy the 16-character password
6. Paste into `.env` as `SMTP_PASSWORD`

### Troubleshooting App Passwords:
- **Can't find App Passwords?** → Enable 2-Factor Authentication first
- **Link doesn't work?** → Go to Google Account → Security → App passwords
- **Already have 2FA?** → You should see the App Passwords option

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Verify all environment variables are set correctly
3. Test with the test endpoint
4. Check server logs for detailed error messages
5. Try a different SMTP provider

---

**Ready to set up email?** Follow the Gmail steps above to get your app password, then add it to your `.env` file!
