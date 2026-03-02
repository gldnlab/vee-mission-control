# Mission Control — Setup Guide

## Prerequisites
- Node.js 18+
- A Convex account (free at convex.dev)
- A Vercel account (free at vercel.com)

---

## Step 1: Install dependencies

```bash
cd mission-control
npm install
```

## Step 2: Create your Convex project

1. Go to [convex.dev](https://convex.dev) and sign up (GitHub login works great)
2. Create a new project — call it `mission-control`
3. In your terminal:

```bash
npx convex dev
```

This will:
- Ask you to log in (opens browser)
- Link to your new project
- Push the schema + functions
- Give you your `NEXT_PUBLIC_CONVEX_URL`

Copy that URL — you'll need it in the next step.

## Step 3: Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud  # from step 2
API_SECRET=your-random-secret  # generate with: openssl rand -hex 32
```

## Step 4: Test locally

```bash
npm run dev
```

Open http://localhost:3000 — you should see Mission Control.

## Step 5: Deploy to Vercel

### Option A: Vercel CLI
```bash
npx vercel --prod
```
When prompted, add your env vars.

### Option B: Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo
4. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `API_SECRET`
5. Deploy

## Step 6: Tell Vee the API details

Once deployed, send Vee:
- Your Vercel URL (e.g. `https://mission-control-xyz.vercel.app`)
- Your `API_SECRET` value

Vee will start logging all activity in real-time and sync your memory/docs into the search index.

---

## API Reference (for Vee)

### Log activity
```
POST /api/activity
Authorization: Bearer <API_SECRET>
{
  "action_type": "slack_message",
  "title": "Replied to Derek in Slack",
  "description": "Optional details",
  "status": "success",
  "metadata": {}
}
```

### Sync cron jobs
```
POST /api/crons
Authorization: Bearer <API_SECRET>
{
  "jobs": [
    {
      "name": "Morning check-in",
      "schedule_expr": "0 14 * * *",
      "schedule_human": "Daily at 7am MDT",
      "next_run": 1234567890000,
      "last_run": 1234567890000,
      "last_status": "success",
      "enabled": true
    }
  ]
}
```

### Index a document
```
POST /api/documents
Authorization: Bearer <API_SECRET>
{
  "title": "MEMORY.md",
  "content": "...",
  "file_path": "/data/workspace/MEMORY.md",
  "doc_type": "memory"
}
```
