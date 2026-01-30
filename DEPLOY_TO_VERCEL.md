# Vercel Deployment Guide - Step by Step

## 🚀 Quick Start

### 1. GitHub Repository
```bash
cd contactx-server
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Vercel Dashboard
1. Go to https://vercel.com
2. Click **Add New Project**
3. Import your GitHub repository
4. **Root Directory**: Select `contactx-server`
5. **Framework Preset**: Other
6. **Build Command**: `npm run build` (optional)
7. **Install Command**: `npm install`

### 3. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
```
DATABASE_URL=your_postgresql_connection_string
BETTER_AUTH_SECRET=your_secret_key_minimum_32_chars
NODE_ENV=production
```

**After First Deploy (update with your actual URL):**
```
BETTER_AUTH_URL=https://your-project.vercel.app
AUTH_TRUSTED_ORIGINS=https://your-project.vercel.app
```

**Cloudinary (if using):**
```
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

### 4. Database Setup

**Option A: Vercel Postgres (Easiest)**
1. Vercel Dashboard → **Storage** → **Create Database**
2. Select **Postgres**
3. Choose region
4. Click **Create**
5. Connection string automatically added as `DATABASE_URL`

**Option B: External Database**
- Use Supabase, Neon, or any PostgreSQL service
- Add connection string as `DATABASE_URL`

### 5. Deploy
1. Click **Deploy** button
2. Wait for build to complete
3. Copy your project URL (e.g., `https://contactx-server.vercel.app`)

### 6. Post-Deployment

**Update Environment Variables:**
```
BETTER_AUTH_URL=https://your-actual-project.vercel.app
AUTH_TRUSTED_ORIGINS=https://your-actual-project.vercel.app
```

**Run Database Migrations:**
```bash
# Set DATABASE_URL locally
export DATABASE_URL="your_vercel_database_url"

# Run migrations
cd contactx-server
npx prisma migrate deploy
```

**Redeploy** after updating environment variables.

### 7. Test Your API

```bash
# Health check
curl https://your-project.vercel.app/

# Should return: "Hello World"

# Test protected route (should return 401)
curl https://your-project.vercel.app/api/protected
```

### 8. Update Expo App

Update `contact-x/config/api.ts`:

```typescript
const DEFAULT_API_URL = __DEV__ 
  ? 'https://hwy-editorial-updates-talked.trycloudflare.com/api' // Development
  : 'https://your-project.vercel.app/api'; // Production

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
```

## 📁 File Structure

```
contactx-server/
├── api/
│   └── index.ts          # ✅ Vercel entry point (already configured)
├── src/
│   ├── app.ts            # Express app
│   └── server.ts         # Local dev server
├── vercel.json           # ✅ Vercel config (already configured)
└── package.json          # ✅ Build scripts (already configured)
```

## ✅ Pre-Deployment Checklist

- [x] `vercel.json` configured
- [x] `api/index.ts` entry point exists
- [x] `package.json` has `postinstall` script
- [ ] GitHub repository ready
- [ ] Environment variables prepared
- [ ] Database ready

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Verify `DATABASE_URL` is set
- Check Prisma generation in logs

### Database Connection Error
- Verify `DATABASE_URL` format
- Check database is accessible
- Run migrations: `npx prisma migrate deploy`

### CORS Errors
- Add Vercel URL to `AUTH_TRUSTED_ORIGINS`
- Update `BETTER_AUTH_URL` with actual Vercel URL

### Function Timeout
- Free tier: 10 seconds
- Hobby: 60 seconds  
- Pro: 300 seconds (5 minutes)

## 📝 Important Notes

1. **Serverless Functions**: Each request = separate function invocation
2. **Cold Start**: First request might be slow (~1-2 seconds)
3. **Auto-Deploy**: Push to GitHub = automatic deploy
4. **Environment Variables**: Set in Vercel Dashboard, not in code
5. **Database**: Vercel Postgres recommended for easiest setup

## 🎯 Next Steps After Deployment

1. ✅ Copy Vercel project URL
2. ✅ Update `BETTER_AUTH_URL` environment variable
3. ✅ Run database migrations
4. ✅ Test API endpoints
5. ✅ Update Expo app API URL
6. ✅ Test authentication flow

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Check deployment logs in Vercel Dashboard
- Check function logs for errors

