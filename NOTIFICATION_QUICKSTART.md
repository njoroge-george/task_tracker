# Notification System - Quick Start Guide

## 🚀 Setup in 5 Minutes

### Step 1: Generate VAPID Keys
```bash
./setup-notifications.sh
```

This will output environment variables. Copy them to your `.env` file:
```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BLd...
VAPID_PRIVATE_KEY=7hx...
CRON_SECRET=abc123...
```

### Step 2: Database Migration (Already Done)
The migration has been applied:
```bash
✅ Migration: 20251130192054_add_notification_preferences_and_reminders
```

### Step 3: Test Locally

#### Test Email Notifications
1. Create a task and assign it to another user
2. Check the assigned user's email

#### Test Push Notifications
1. Go to Settings → Preferences
2. Click "Enable Push Notifications"
3. Allow browser permission
4. Create a task assignment
5. You should see a browser notification

#### Test Mentions
1. Go to any task
2. Add a comment with `@[User Name](userId)`
3. The mentioned user receives a notification

#### Test Reminders
1. Create a task with a due date in 2 hours
2. Run manually: `curl -X GET http://localhost:3000/api/cron/send-reminders -H "Authorization: Bearer your_cron_secret"`
3. Check for reminder notification

#### Test WebSockets
1. Open task in two browser tabs
2. Add a comment in one tab
3. Notification appears instantly in the other tab

### Step 4: Deploy to Vercel

1. **Push Changes**
   ```bash
   git add .
   git commit -m "Add comprehensive notification system"
   git push
   ```

2. **Add Environment Variables in Vercel Dashboard**
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `CRON_SECRET`

3. **Verify Cron Job**
   - Go to Vercel Dashboard → Your Project → Cron Jobs
   - You should see: `/api/cron/send-reminders` running every hour

4. **Test Production**
   - Enable push notifications in production
   - Create a task with a due date
   - Wait for cron to run (or trigger manually via dashboard)

## 📋 Feature Checklist

- [x] Email alerts
- [x] Web push notifications
- [x] Task reminder settings
- [x] @Mentions in comments
- [x] Real-time event streaming (WebSockets)

## 🔧 Troubleshooting

### Push Notifications Not Working
- Check browser console for errors
- Verify VAPID keys are set correctly
- Ensure HTTPS (required for service workers)
- Check browser notification permissions

### Reminders Not Sent
- Verify cron job is configured in Vercel
- Check cron secret matches environment variable
- Look at Vercel function logs for errors
- Ensure tasks have future due dates

### Mentions Not Detected
- Use format: `@[Display Name](userId)`
- Check comment API route for errors
- Verify notification preferences allow mentions

### WebSocket Not Connecting
- Check browser console for connection errors
- Verify WebSocket server is running
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

## 📖 Documentation

- **Full Guide**: [NOTIFICATION_SYSTEM.md](./NOTIFICATION_SYSTEM.md)
- **Implementation Summary**: [NOTIFICATION_IMPLEMENTATION_SUMMARY.md](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md)

## 🎉 You're All Set!

Your notification system is now fully functional with:
- ✅ Multiple delivery channels (email, push, real-time)
- ✅ User preferences and customization
- ✅ Automated task reminders
- ✅ @Mention support
- ✅ Real-time updates across devices

Happy coding! 🚀
