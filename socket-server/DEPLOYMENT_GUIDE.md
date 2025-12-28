# 🚀 Fly.io Deployment Guide

## Step 1: Install Fly.io CLI

### On Linux/WSL:
```bash
curl -L https://fly.io/install.sh | sh
```

### On Mac:
```bash
brew install flyctl
```

### Verify Installation:
```bash
flyctl version
```

---

## Step 2: Sign Up for Fly.io (FREE)

```bash
flyctl auth signup
```

This will open your browser. Sign up with:
- GitHub (recommended)
- Google
- Or Email

**No credit card required for free tier!**

---

## Step 3: Login

```bash
flyctl auth login
```

---

## Step 4: Navigate to Socket Server Directory

```bash
cd socket-server
```

---

## Step 5: Deploy to Fly.io

```bash
flyctl launch
```

**When prompted:**
- App name: Press Enter (uses "taskflow-socket" from fly.toml)
- Region: Choose closest to you (or just press Enter for suggested)
- PostgreSQL database: **NO** (type 'n')
- Redis database: **NO** (type 'n')
- Deploy now: **YES** (type 'y')

This will:
1. Create the app on Fly.io
2. Build the Docker image
3. Deploy your Socket.IO server
4. Give you a URL like: `https://taskflow-socket.fly.dev`

---

## Step 6: Check Deployment Status

```bash
flyctl status
```

You should see:
```
Instances
ID       VERSION REGION STATUS  HEALTH
xxx      1       iad    running healthy
```

---

## Step 7: Test Your Socket.IO Server

```bash
curl https://taskflow-socket.fly.dev/health
```

Should return:
```json
{"status":"ok","uptime":123,"connections":0}
```

---

## Step 8: Get Your Socket.IO URL

Your Socket.IO server URL will be:
```
https://taskflow-socket.fly.dev
```

**Copy this URL!** You'll need it for the next step.

---

## Useful Commands

### View Logs
```bash
flyctl logs
```

### Check App Info
```bash
flyctl info
```

### Scale (if needed later)
```bash
flyctl scale memory 512  # Upgrade to 512MB RAM
```

### Restart App
```bash
flyctl apps restart taskflow-socket
```

---

## Troubleshooting

### If deployment fails:
```bash
flyctl logs
```

### If app won't start:
```bash
flyctl ssh console
node server.js
```

### Check configuration:
```bash
flyctl config display
```

---

## Next Steps

After deployment succeeds, you need to:
1. Copy your Fly.io URL: `https://taskflow-socket.fly.dev`
2. Update your Next.js app to use this URL
3. Add it to Vercel environment variables

See: `UPDATE_CLIENT_INSTRUCTIONS.md`
