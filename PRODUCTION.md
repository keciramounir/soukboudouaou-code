# Production Deployment Guide for Replit

This guide will help you deploy your Souk Boudouaou application to production on Replit.

## Prerequisites

1. A Replit account with an active Repl
2. A Supabase account (or PostgreSQL database)
3. Environment variables configured

## Step 1: Configure Environment Variables

### Backend Environment Variables

1. Go to your Replit project
2. Click on the "Secrets" tab (🔒 icon) in the left sidebar
3. Add the following environment variables:

#### Required Variables

- `NODE_ENV=production`
- `PORT=3000` (or let Replit assign it)
- `DATABASE_URL` - Your PostgreSQL connection string (Supabase pooler URL)
- `DIRECT_URL` - Your PostgreSQL direct connection string (for Prisma migrations)
- `JWT_SECRET` - A strong random secret for JWT tokens
- `JWT_REFRESH_SECRET` - A different strong random secret for refresh tokens

#### Recommended Variables

- `APP_ORIGIN` - Your Replit app URL (e.g., `https://your-repl.repl.co`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` - Initial admin account

See `backend/.env.example` for a complete list of available variables.

### Frontend Environment Variables

For Replit deployments, you typically don't need frontend environment variables since the frontend and backend share the same origin. However, if needed:

- `VITE_API_URL` - Leave empty for same-origin (recommended)
- `VITE_PUBLIC_BASE` - Leave empty for root deployment

## Step 2: Database Setup

1. **Create a Supabase project** (or use your existing PostgreSQL database)
2. **Get connection strings:**
   - Pooler URL (for `DATABASE_URL`) - Use the connection pooling URL
   - Direct URL (for `DIRECT_URL`) - Use the direct connection URL on port 5432
3. **Apply Prisma schema:**
   ```bash
   npm --prefix backend run prisma:generate
   npm --prefix backend run prisma:push
   ```

## Step 3: Deploy to Replit

### Automatic Deployment

Replit will automatically build and deploy your application when you:

1. **Push to your repository** (if using Git)
2. **Click "Deploy"** in the Replit interface
3. **Use the deployment configuration** in `.replit`

The `.replit` file is already configured with:
- Build command: `npm run install:all && npm run build && npm --prefix backend run prisma:generate`
- Run command: `cd backend && NODE_ENV=production node server.js`

### Manual Deployment Steps

If you need to deploy manually:

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Generate Prisma client:**
   ```bash
   npm --prefix backend run prisma:generate
   ```

4. **Start the production server:**
   ```bash
   cd backend
   NODE_ENV=production node server.js
   ```

## Step 4: Verify Deployment

1. **Check health endpoint:**
   - Visit: `https://your-repl.repl.co/health`
   - Should return: `{"success":true,"message":"Server is healthy"}`

2. **Check frontend:**
   - Visit: `https://your-repl.repl.co/`
   - Should load your React application

3. **Check API:**
   - Visit: `https://your-repl.repl.co/api/health`
   - Should return the same health check

## Step 5: Create Admin Account

After deployment, create your first admin account:

```bash
cd backend
node scripts/seed.js
```

Or set these environment variables before running:
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `SUPER_ADMIN_USERNAME` (optional, defaults to "admin")
- `SUPER_ADMIN_FULL_NAME` (optional)

## Troubleshooting

### Build Fails

- **Check Node version:** Ensure you're using Node.js 18+ (configured in `.replit`)
- **Check dependencies:** Run `npm run install:all` manually
- **Check Prisma:** Ensure `DATABASE_URL` and `DIRECT_URL` are set correctly

### Frontend Not Loading

- **Check build:** Ensure `frontend/dist` directory exists after build
- **Check static serving:** Verify `NODE_ENV=production` is set
- **Check routes:** Ensure SPA fallback is working (check `backend/app.js`)

### Database Connection Issues

- **Check connection strings:** Verify `DATABASE_URL` and `DIRECT_URL` are correct
- **Check SSL:** Supabase requires SSL, ensure `?sslmode=require` is in the URL
- **Check network:** Ensure Replit can reach your database

### CORS Issues

- **Check CORS configuration:** The app automatically handles Replit URLs
- **Check environment:** Verify `APP_ORIGIN` is set to your Replit URL
- **Check headers:** Ensure CORS headers are being sent (check browser console)

## Production Optimizations

The application is already configured with:

✅ **Security:**
- Helmet.js for security headers
- CORS properly configured
- Rate limiting enabled
- Input validation

✅ **Performance:**
- Compression enabled
- Production build optimizations
- Code splitting in frontend
- Static file serving

✅ **Monitoring:**
- Health check endpoints
- Error logging
- Route auditing on startup

## Environment-Specific Notes

### Replit-Specific Features

- **Automatic HTTPS:** Replit provides HTTPS automatically
- **Dynamic URLs:** CORS is configured to handle dynamic Replit URLs
- **Port Configuration:** Ports are configured in `.replit` file
- **Environment Variables:** Use Replit Secrets for sensitive data

## Next Steps

1. Set up monitoring and logging
2. Configure email service (SMTP)
3. Set up backup strategy for database
4. Configure custom domain (if needed)
5. Set up CI/CD for automated deployments

## Support

For issues or questions:
- Check the logs in Replit console
- Review error messages in browser console
- Check database connection status
- Verify all environment variables are set
