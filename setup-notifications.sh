#!/bin/bash

# Notification System Setup Script
# This script helps set up the notification system for the task tracker

echo "📬 Task Tracker - Notification System Setup"
echo "==========================================="
echo ""

# Check if web-push is installed
if ! npm list web-push > /dev/null 2>&1; then
  echo "❌ web-push package not found. Installing..."
  npm install web-push
fi

echo "🔑 Generating VAPID keys for push notifications..."
echo ""

# Generate VAPID keys
VAPID_OUTPUT=$(npx web-push generate-vapid-keys)

# Extract public and private keys
PUBLIC_KEY=$(echo "$VAPID_OUTPUT" | grep "Public Key:" | cut -d ":" -f 2 | xargs)
PRIVATE_KEY=$(echo "$VAPID_OUTPUT" | grep "Private Key:" | cut -d ":" -f 2 | xargs)

echo "✅ VAPID keys generated successfully!"
echo ""
echo "Add these to your .env file:"
echo "================================"
echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=$PUBLIC_KEY"
echo "VAPID_PRIVATE_KEY=$PRIVATE_KEY"
echo ""
echo "Also add a cron secret for scheduled reminders:"
echo "CRON_SECRET=$(openssl rand -base64 32)"
echo "================================"
echo ""
echo "📝 Next steps:"
echo "1. Copy the above environment variables to your .env file"
echo "2. Run: npx prisma migrate dev (if not already done)"
echo "3. Deploy to Vercel and configure cron jobs in vercel.json"
echo "4. Test push notifications in browser settings"
echo ""
echo "📖 See NOTIFICATION_SYSTEM.md for complete documentation"
