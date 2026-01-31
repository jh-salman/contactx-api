# Railway Deployment Guide - Step by Step

## 🚀 Quick Start

### 1. Railway Account Setup
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. You'll get **$5 free credit** per month

---

### 2. Create PostgreSQL Database

1. Railway Dashboard → **"New Project"**
2. Click **"Provision PostgreSQL"**
3. Database will be automatically created
4. Go to Database tab → **"Connect"** → Copy `DATABASE_URL`

**Important:** Railway automatically adds `DATABASE_URL` as environment variable.

---

### 3. Connect GitHub Repository

1. Railway Dashboard → **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Select your repository: `contactx-app-server`
4. **Root Directory**: Set to `contactx-server`
5. Railway will automatically detect Node.js project

---

### 4. Environment Variables Setup

Railway Dashboard → Your Project → **Variables** tab:

#### Required Variables:

```env
# Database (Railway automatically provides this)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Better Auth
BETTER_AUTH_SECRET=your_secret_key_minimum_32_characters_long_random_string
BETTER_AUTH_URL=https://your-project-name.up.railway.app
AUTH_TRUSTED_ORIGINS=https://your-project-name.up.railway.app

# Node Environment
NODE_ENV=production
PORT=3004

# Cloudinary (if using)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
```

#### Important Notes:
- `DATABASE_URL`: Railway automatically adds this, no need to add manually
- `PORT`: Railway automatically sets this, but keep the variable
- `BETTER_AUTH_URL`: Update after deployment with your Railway URL
- `RAILWAY_PUBLIC_DOMAIN`: Railway automatically provides this

---

### 5. Railway Settings Configuration

1. Project Settings → **"Settings"** tab
2. **Root Directory**: `contactx-server`
3. **Build Command**: `npm run build` (Railway auto-detects)
4. **Start Command**: `npm start`
5. **Watch Paths**: `contactx-server/**`

---

### 6. Database Migrations

#### Option A: Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set DATABASE_URL (if not auto-set)
railway variables set DATABASE_URL="your_railway_database_url"

# Run migrations
cd contactx-server
railway run npx prisma migrate deploy
```

#### Option B: Local (Temporary)

```bash
# Set Railway database URL temporarily
export DATABASE_URL="your_railway_database_url"

# Run migrations
cd contactx-server
npx prisma migrate deploy
```

---

### 7. Deploy

1. Railway automatically detects GitHub pushes
2. Push your code:

```bash
cd contactx-server
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

3. Railway will automatically build and deploy
4. Check build logs: Railway Dashboard → **"Deployments"** tab

---

### 8. Get Your Railway URL

1. Railway Dashboard → Your Project → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** (if not auto-generated)
3. Your URL will be: `https://your-project-name.up.railway.app`

---

### 9. Update Environment Variables

After deployment, update these variables with your Railway URL:

```env
BETTER_AUTH_URL=https://your-project-name.up.railway.app
AUTH_TRUSTED_ORIGINS=https://your-project-name.up.railway.app
```

Railway will automatically redeploy after variable changes.

---

### 10. Custom Domain (Optional)

1. Railway Dashboard → Your Project → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions

---

### 11. Update Expo App

Update `contact-x/config/api.ts`:

```typescript
const DEFAULT_API_URL = __DEV__ 
  ? 'https://hwy-editorial-updates-talked.trycloudflare.com/api' // Development
  : 'https://your-project-name.up.railway.app/api'; // Production Railway

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
```

---

## 📁 File Structure

```
contactx-server/
├── railway.json          # ✅ Railway configuration
├── Procfile              # ✅ Process file for Railway
├── package.json          # ✅ Build scripts configured
├── src/
│   ├── app.ts            # Express app
│   └── server.ts         # Server entry point
└── prisma/
    └── schema.prisma     # Database schema
```

---

## ✅ Pre-Deployment Checklist

- [x] `railway.json` configured
- [x] `Procfile` created
- [x] `package.json` has `postinstall` script
- [x] `package.json` has `build` and `start` scripts
- [ ] GitHub repository ready
- [ ] Environment variables prepared
- [ ] Database migrations ready

---

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Railway Dashboard
- Verify `DATABASE_URL` is set
- Check Prisma generation in logs
- Ensure `npm run build` completes successfully

### Database Connection Error
- Verify `DATABASE_URL` format
- Check database is provisioned
- Run migrations: `railway run npx prisma migrate deploy`
- Check database is accessible from Railway

### Server Not Starting
- Check `PORT` is set (Railway auto-sets this)
- Verify start command: `npm start`
- Check logs in Railway Dashboard
- Ensure `dist/server.js` exists after build

### CORS Errors
- Add Railway URL to CORS allowed origins in `src/app.ts`
- Update `AUTH_TRUSTED_ORIGINS` with Railway URL
- Update `BETTER_AUTH_URL` with Railway URL

### Function Timeout
- Railway doesn't have function timeouts (unlike Vercel)
- Server runs continuously (no cold starts)

---

## 📝 Important Notes

1. **Always-On Server**: Railway runs your server continuously (no cold starts)
2. **Auto-Deploy**: Push to GitHub = automatic deploy
3. **Environment Variables**: Set in Railway Dashboard, not in code
4. **Database**: Railway PostgreSQL recommended for easiest setup
5. **Port**: Railway automatically sets `PORT` environment variable
6. **Domain**: Railway provides `RAILWAY_PUBLIC_DOMAIN` automatically

---

## 💰 Railway Pricing

- **Free Tier**: $5 credit/month
- **Starter Plan**: $5/month (after free credit)
- **Developer Plan**: $20/month

**Your server will cost approximately:**
- Web Service: ~$5/month
- PostgreSQL: ~$5/month (included in starter plan)
- **Total: ~$5-10/month**

---

## 🎯 Next Steps After Deployment

1. ✅ Copy Railway project URL
2. ✅ Update `BETTER_AUTH_URL` environment variable
3. ✅ Update `AUTH_TRUSTED_ORIGINS` environment variable
4. ✅ Run database migrations
5. ✅ Test API endpoints
6. ✅ Update Expo app with Railway URL
7. ✅ Monitor logs in Railway Dashboard

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app
- Railway Docs: https://docs.railway.app
- Railway CLI: https://docs.railway.app/develop/cli
- Railway Discord: https://discord.gg/railway

---

## 📞 Support

If you encounter issues:
1. Check Railway Dashboard logs
2. Verify environment variables
3. Check Railway status page
4. Join Railway Discord for help

