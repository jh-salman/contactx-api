# Vercel Deployment Guide

এই guide follow করে আপনার ContactX server Vercel এ deploy করুন।

## Prerequisites

1. GitHub repository ready
2. Vercel account (https://vercel.com)
3. PostgreSQL database (Vercel Postgres, Supabase, Neon, বা অন্য service)

## Step 1: Vercel Dashboard Setup

### 1.1 Create New Project

1. Vercel Dashboard → **Add New Project**
2. GitHub repository import করুন
3. Project settings:

**Framework Preset:**
- **Other** select করুন (Express server)

**Build Settings:**
- **Build Command**: `npm run build` (optional, Vercel auto-detects)
- **Output Directory**: leave empty
- **Install Command**: `npm install`
- **Root Directory**: leave empty

**Environment Variables:**
এখানে add করুন (নিচে details দেওয়া আছে)

### 1.2 Environment Variables Setup

Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=https://your-project.vercel.app
AUTH_TRUSTED_ORIGINS=https://your-project.vercel.app,https://your-expo-app.com
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=https://your-frontend-url.com (optional)
EXPO_APP_URL=exp://your-expo-app-url (optional)
```

**Important Notes:**
- `BETTER_AUTH_URL` - Deploy হওয়ার পর আপনার Vercel project URL হবে
- `AUTH_TRUSTED_ORIGINS` - Comma-separated URLs add করুন
- `DATABASE_URL` - PostgreSQL connection string
- `VERCEL_URL` - Vercel automatically set করে (use করতে পারেন)

## Step 2: PostgreSQL Database Setup

### Option A: Vercel Postgres (Recommended)

1. Vercel Dashboard → **Storage** → **Create Database**
2. **Postgres** select করুন
3. Settings:
   - **Name**: `contactx-db`
   - **Region**: আপনার নিকটবর্তী region
   - **Plan**: Hobby (free) বা Pro (paid)
4. **Create** করুন
5. Connection string automatically environment variable এ add হবে

### Option B: External Database

- Supabase, Neon, Render Postgres, বা অন্য PostgreSQL service use করতে পারেন
- Connection string environment variable এ `DATABASE_URL` হিসেবে add করুন

## Step 3: Deploy

### Option A: Automatic Deploy (GitHub Integration)

1. Code GitHub এ push করুন:
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

2. Vercel automatically deploy শুরু করবে

3. Build logs monitor করুন:
   - Vercel Dashboard → Your Project → **Deployments**
   - Build process check করুন

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

## Step 4: Post-Deployment

### 4.1 Update Environment Variables

Deploy complete হওয়ার পর:

1. Project URL copy করুন (যেমন: `https://contactx-server.vercel.app`)
2. Environment Variables update করুন:
   - `BETTER_AUTH_URL` = আপনার Vercel project URL
   - `AUTH_TRUSTED_ORIGINS` = project URL add করুন

3. **Redeploy** করুন (environment variables change হলে)

### 4.2 Run Database Migrations

**Option 1: Vercel CLI (Recommended)**

```bash
# Set DATABASE_URL locally
export DATABASE_URL="your_vercel_database_url"

# Run migrations
npx prisma migrate deploy
```

**Option 2: Vercel Function**

Temporary function create করে migration run করতে পারেন, অথবা local থেকে run করুন।

### 4.3 Test Your API

```bash
# Health check
curl https://your-project.vercel.app/

# Test protected route (should return 401 without auth)
curl https://your-project.vercel.app/api/protected

# Test public endpoint
curl https://your-project.vercel.app/api/public-card/some-card-id
```

## Step 5: Update Expo App Configuration

Expo app এ API base URL update করুন:

```javascript
// config.js
const API_BASE_URL = __DEV__ 
  ? 'http://10.23.61.18:3004'  // Development - local IP
  : 'https://your-project.vercel.app'; // Production - Vercel URL

export default {
  API_BASE_URL,
  AUTH_URL: `${API_BASE_URL}/api/auth`,
};
```

## Vercel-Specific Configuration

### vercel.json

আপনার project root এ `vercel.json` file আছে যা Vercel serverless functions configure করে:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ]
}
```

### API Handler

`api/index.ts` file Vercel serverless function entry point হিসেবে কাজ করে:

```typescript
import { app } from '../src/app';
export default app;
```

## Troubleshooting

### Build Fails
- Build logs check করুন (Vercel Dashboard → Deployments)
- `package.json` এ `build` script verify করুন
- Prisma generate হচ্ছে কিনা check করুন
- `@vercel/node` package installed আছে কিনা verify করুন

### Database Connection Error
- `DATABASE_URL` verify করুন
- Database service running আছে কিনা check করুন
- Connection string format correct কিনা verify করুন
- Vercel Postgres use করলে automatically configured হয়

### CORS Errors
- Production URL CORS config এ add করুন
- `AUTH_TRUSTED_ORIGINS` environment variable set করুন
- `VERCEL_URL` environment variable check করুন

### Function Timeout
- Vercel free tier এ 10 seconds timeout
- Hobby plan এ 60 seconds
- Pro plan এ 300 seconds (5 minutes)
- Long-running operations optimize করুন

### Cold Start Issues
- Serverless functions cold start হতে পারে
- Vercel Pro plan use করলে better performance
- Keep-alive strategies implement করুন

## Important Notes

1. **Serverless Functions:**
   - Vercel Express apps serverless functions হিসেবে run হয়
   - Each request একটি separate function invocation
   - Cold start হতে পারে (first request slow)

2. **Free Tier Limitations:**
   - 100GB bandwidth per month
   - 100 serverless function executions per day
   - 10 seconds function timeout

3. **Auto-Deploy:**
   - GitHub push হলে automatically deploy হয়
   - Preview deployments automatically create হয় (PRs)

4. **Environment Variables:**
   - Production, Preview, Development environments আলাদা
   - Sensitive data environment variables এ রাখুন
   - Production secrets use করুন

5. **Database:**
   - Vercel Postgres free tier এ 256 MB storage
   - Connection pooling automatically handled
   - Production এর জন্য paid plan consider করুন

6. **Prisma:**
   - `postinstall` script automatically Prisma generate করে
   - Migrations manually run করতে হবে
   - Connection pooling Vercel Postgres এ automatically handled

## File Structure

```
contactx-server/
├── api/
│   └── index.ts          # Vercel serverless function entry point
├── src/
│   ├── app.ts            # Express app
│   ├── server.ts         # Local development server
│   └── ...
├── vercel.json           # Vercel configuration
├── package.json
└── ...
```

## Next Steps

1. ✅ Service successfully deployed
2. ✅ Database migrations run হয়েছে
3. ✅ API endpoints test করুন
4. ✅ CORS configuration verify করুন
5. ✅ Better Auth endpoints test করুন
6. ✅ Expo app configuration update করুন

## Support

Issues হলে:
- Vercel Dashboard → Deployments → Logs check করুন
- Vercel Documentation: https://vercel.com/docs
- GitHub Issues: https://github.com/jh-salman/contactx-server/issues

## Comparison: Vercel vs Render

| Feature | Vercel | Render |
|---------|--------|--------|
| **Deployment Type** | Serverless Functions | Traditional Server |
| **Cold Start** | Yes (first request slow) | No (always running) |
| **Free Tier** | 100GB bandwidth/month | 750 hours/month |
| **Sleep Mode** | No | Yes (15 min inactivity) |
| **Best For** | API endpoints, Edge functions | Long-running processes |

Vercel serverless functions এর জন্য ভাল, Render traditional Express server এর জন্য ভাল।

