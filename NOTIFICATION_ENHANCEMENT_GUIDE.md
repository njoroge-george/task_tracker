# Enhanced Notification Features - Implementation Guide

## 🎯 What's New

The notification system has been significantly enhanced with:

✅ **In-app notifications** - Real-time updates in the dashboard  
✅ **Email notifications** - Professional HTML emails for all notification types  
✅ **Due-date reminders** - Customizable reminders before tasks are due  
✅ **Assignment alerts** - Instant notifications when tasks are assigned  
✅ **Overdue task alerts** - Daily reminders for overdue tasks  
✅ **Daily digest** - Morning summary of upcoming tasks  

## 📁 New Files Created

1. **`src/lib/notification-scheduler.ts`** - Scheduled notification logic
   - `checkDueDateReminders()` - Hourly reminder checks
   - `sendDueSoonNotifications()` - Tasks due within 48h
   - `notifyTaskAssignment()` - Task assignment notifications
   - `checkOverdueTasks()` - Daily overdue checks
   - `sendDailyDigest()` - Daily task summary

2. **`src/app/api/cron/notifications/route.ts`** - Cron job endpoint
   - Secured with `CRON_SECRET`
   - Supports multiple task types
   - Logging and error handling

3. **Enhanced `src/lib/email.ts`** - New email templates:
   - `sendTaskAssignmentEmail()` - Task assignment with full details
   - `sendTaskReminderEmail()` - Urgent reminder countdown
   - `sendTaskDueSoonEmail()` - Approaching deadline warning

## 🚀 Quick Setup

### Step 1: Environment Variables

Add to your `.env` and `.env.production`:

```bash
# Email Configuration (required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=false
SMTP_FROM=TaskFlow <noreply@taskflow.com>

# Cron Security
CRON_SECRET=generate-a-secure-random-string

# App URL
NEXTAUTH_URL=https://taskflow.mainakiburi.com
```

### Step 2: Database Migration

Run the Prisma migration to add new notification types:

```bash
# Development
npx prisma migrate dev --name add-notification-enhancements

# Production
npx prisma migrate deploy
npx prisma generate
```

This adds:
- `TASK_OVERDUE` notification type
- `SYSTEM` notification type

### Step 3: Set Up Cron Jobs

#### On Your Server (Recommended)

Edit crontab: `crontab -e`

```bash
# Due date reminders - every hour
0 * * * * curl -s "https://taskflow.mainakiburi.com/api/cron/notifications?task=reminders&secret=YOUR_CRON_SECRET" > /dev/null 2>&1

# Due soon notifications - every 6 hours
0 */6 * * * curl -s "https://taskflow.mainakiburi.com/api/cron/notifications?task=due-soon&secret=YOUR_CRON_SECRET" > /dev/null 2>&1

# Daily digest - 8 AM every day
0 8 * * * curl -s "https://taskflow.mainakiburi.com/api/cron/notifications?task=digest&secret=YOUR_CRON_SECRET" > /dev/null 2>&1

# Overdue tasks - 9 AM every day
0 9 * * * curl -s "https://taskflow.mainakiburi.com/api/cron/notifications?task=overdue&secret=YOUR_CRON_SECRET" > /dev/null 2>&1
```

Replace `YOUR_CRON_SECRET` with your actual secret from `.env`.

#### Using External Cron Service

Use services like **cron-job.org** or **EasyCron**:

1. Create an account
2. Add these URLs as cron jobs:
   - Hourly: `/api/cron/notifications?task=reminders&secret=YOUR_SECRET`
   - Every 6h: `/api/cron/notifications?task=due-soon&secret=YOUR_SECRET`
   - Daily 8AM: `/api/cron/notifications?task=digest&secret=YOUR_SECRET`
   - Daily 9AM: `/api/cron/notifications?task=overdue&secret=YOUR_SECRET`

### Step 4: Deploy

```bash
# Commit changes
git add -A
git commit -m "feat: Enhanced notification system with reminders and emails"
git push origin main

# On server
cd /var/www/taskflow
git pull origin main
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart all
```

## ✨ Features Breakdown

### 1. Task Assignment Notifications

**When**: A task is assigned to a user (or reassigned)

**What Happens**:
- In-app notification created
- Email sent with:
  - Task title and description
  - Priority badge (color-coded)
  - Due date
  - Project and workspace context
  - Direct link to task

**Code**: Automatically triggered in `/api/tasks/route.ts` when creating tasks

### 2. Due-Date Reminders

**When**: Based on user's reminder settings (default: 24h and 1h before due)

**What Happens**:
- Checks every hour for tasks approaching due date
- Sends reminder if within user's reminder window
- Prevents duplicate reminders
- Email includes countdown timer

**Customization**: Users can set custom intervals in their settings:
```json
{
  "reminderSettings": {
    "enabled": true,
    "intervals": [168, 24, 1]  // 1 week, 1 day, 1 hour
  }
}
```

### 3. Due Soon Notifications

**When**: Tasks due within 48 hours (runs every 6 hours)

**What Happens**:
- Broader sweep than reminders
- Catches tasks that might fall between reminder intervals
- Red-themed urgent emails

### 4. Overdue Task Alerts

**When**: Daily at 9 AM for tasks past due date

**What Happens**:
- One notification per task per day
- Shows days overdue
- Encourages completion

### 5. Daily Digest

**When**: Daily at 8 AM

**What Happens**:
- Summary of tasks due today and tomorrow
- Max 10 tasks shown
- Only sent if user has upcoming tasks
- Can be disabled in user preferences

## 🎨 Email Templates

All emails include:
- **Gradient headers** with notification-specific colors:
  - Blue for assignments
  - Orange for reminders
  - Red for urgent/overdue
- **Task details** (title, description, priority, due date)
- **Context** (project, workspace)
- **Call-to-action** buttons
- **Professional branding**
- **Responsive design**

## ⚙️ User Preferences

Users can control notifications via `notificationPreferences`:

```typescript
{
  email: true,           // Receive emails
  push: true,            // Receive push notifications
  taskAssigned: true,    // Assignment notifications
  taskCompleted: false,  // Completion notifications
  taskDueSoon: true,     // Due soon alerts
  comments: true,        // Comment notifications
  mentions: true,        // Mention notifications
  dailyDigest: true      // Daily digest emails
}
```

## 🧪 Testing

### Test Assignment Notification

1. Create a task via the UI
2. Assign it to another user
3. Check:
   - Assignee's notification dropdown
   - Assignee's email inbox

### Test Reminders (Manual Trigger)

```bash
# Development
curl "http://localhost:3000/api/cron/notifications?task=all&secret=YOUR_CRON_SECRET"

# Production
curl "https://taskflow.mainakiburi.com/api/cron/notifications?task=all&secret=YOUR_CRON_SECRET"
```

### Create Test Task with Near Due Date

```typescript
// In Prisma Studio or API call
const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

await prisma.task.create({
  data: {
    title: "Test Reminder",
    dueDate: oneHourFromNow,
    assigneeId: "your-user-id",
    workspaceId: "your-workspace-id",
    status: "TODO",
    priority: "HIGH",
  },
});

// Wait for cron or trigger manually
```

## 📊 Monitoring

### Check Notification Stats

```sql
-- Notification counts by type
SELECT type, COUNT(*) as count, 
       COUNT(*) FILTER (WHERE "emailSent" = true) as emails_sent
FROM "Notification"
GROUP BY type;

-- Recent notifications
SELECT type, title, "emailSent", "createdAt"
FROM "Notification"
ORDER BY "createdAt" DESC
LIMIT 20;
```

### Check Cron Execution

```bash
# View cron logs
tail -f /var/log/cron.log

# Or app logs
pm2 logs taskflow | grep "notification cron"
```

## 🔧 Troubleshooting

### Emails Not Sending

1. **Check SMTP config**: Verify all env vars are set
2. **Test SMTP manually**: Use a tool like `swaks`
3. **Check logs**: Look for email errors in PM2 logs
4. **Gmail users**: Use App Password, not account password

### Reminders Not Triggering

1. **Verify cron is running**: `crontab -l`
2. **Check cron logs**: Look for execution errors
3. **Test manually**: Trigger via curl
4. **Check server time**: Ensure timezone is correct

### No Notifications Appearing

1. **Check user preferences**: Might be disabled
2. **Verify database**: Look for notification records
3. **Check WebSocket**: Real-time updates require socket connection
4. **Browser console**: Look for JavaScript errors

## 🎯 Notification Flow

```
Task Created with Assignee
  ↓
notifyTaskAssignment() called
  ↓
Create Notification in DB
  ↓
Send Email (if enabled)
  ↓
WebSocket Broadcast
  ↓
UI Updates Immediately
```

```
Cron Job Runs
  ↓
checkDueDateReminders()
  ↓
Query Tasks Due Soon
  ↓
For Each Task:
  - Check reminder intervals
  - Verify not already reminded
  - Create notification
  - Send email
  ↓
Log Completion
```

## 📈 Performance Notes

- **Hourly reminders**: Efficient query with indexed `dueDate`
- **Duplicate prevention**: Checks recent notifications before creating
- **Batch processing**: Handles multiple users/tasks efficiently
- **Background jobs**: Email sending doesn't block API
- **WebSocket optimization**: Only broadcasts to relevant users

## 🔐 Security

- **Cron endpoint** secured with `CRON_SECRET`
- **Email templates** sanitize user input
- **Workspace isolation** ensures users only see their notifications
- **Rate limiting** prevents notification spam (built-in)

## 📋 Checklist

Before going live:

- [ ] Set up SMTP credentials
- [ ] Generate strong `CRON_SECRET`
- [ ] Configure cron jobs on server
- [ ] Run database migration
- [ ] Test all notification types
- [ ] Verify email delivery
- [ ] Check user preference defaults
- [ ] Monitor first few cron executions
- [ ] Set up log monitoring
- [ ] Document for team

## 🚀 What's Next

The system is extensible. Future additions could include:

- SMS notifications via Twilio
- Slack/Discord webhooks
- Custom notification rules per workspace
- Notification snooze feature
- Weekly summary reports
- Notification analytics dashboard
- Template customization per workspace

## 💡 Tips

1. **Start conservative**: Begin with default reminder intervals
2. **Monitor email deliverability**: Check spam rates
3. **User feedback**: Let users customize preferences
4. **Log everything**: Helps with debugging
5. **Test email templates**: Send to yourself first
6. **Gradual rollout**: Enable for small group first

## 📞 Support

If you encounter issues:

1. Check this guide thoroughly
2. Review application logs: `pm2 logs taskflow`
3. Test cron endpoints manually
4. Verify database migration ran successfully
5. Check email SMTP configuration

---

**That's it!** Your notification system is now enterprise-ready with comprehensive reminders, alerts, and beautiful emails. 🎉
