# Vercel Deployment Quick Setup

## ✅ Pre-Deployment Checklist

1. **Environment Variables** - Vercel Dashboard এ এই variables add করুন:
   ```
   DATABASE_URL=your_postgresql_connection_string
   BETTER_AUTH_SECRET=your_secret_key
   BETTER_AUTH_URL=https://your-project.vercel.app (deploy হওয়ার পর update করুন)
   AUTH_TRUSTED_ORIGINS=https://your-project.vercel.app
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   NODE_ENV=production
   ```

2. **Prisma Client** - `postinstall` script automatically Prisma generate করবে

3. **Build Configuration** - `vercel.json` properly configured

## 🚀 Deployment Steps

1. **GitHub এ Push করুন:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Vercel Dashboard:**
   - New Project → GitHub repository select করুন
   - Framework Preset: **Other**
   - Build Command: `npm run build` (optional)
   - Install Command: `npm install`
   - Deploy করুন

3. **Post-Deployment:**
   - Project URL copy করুন
   - Environment Variables এ `BETTER_AUTH_URL` update করুন
   - Redeploy করুন

## 🔧 Important Files

- `api/index.ts` - Vercel serverless function entry point
- `vercel.json` - Vercel configuration
- `package.json` - Build scripts configured
- `.vercelignore` - Files excluded from deployment

## ⚠️ Common Issues & Solutions

### Prisma Client Not Found
- Solution: `postinstall` script automatically runs `prisma generate`
- Verify: Check build logs for Prisma generation

### Database Connection Error
- Solution: Verify `DATABASE_URL` environment variable
- Check: Database service is accessible from Vercel

### CORS Errors
- Solution: Add production URL to `AUTH_TRUSTED_ORIGINS`
- Check: `VERCEL_URL` environment variable is set

### Function Timeout
- Solution: Vercel free tier = 10s, Hobby = 60s, Pro = 300s
- Check: Long-running operations optimize করুন

## 📝 Notes

- Serverless functions: Each request = separate function invocation
- Cold start: First request might be slow
- Prisma: Connection pooling automatically handled
- Environment variables: Automatically available in Vercel

